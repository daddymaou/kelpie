import type { Mutation } from '@kelpie/protocol';
import type { LocalStore, MutationRecord } from './storage.js';
import type { MaterializedRow } from './resolver.js';

const rowsStore = 'rows';
const mutationsStore = 'mutations';
const stateStore = 'state';

interface StoredRow {
	key: string;
	table: string;
	rowId: string;
	value: MaterializedRow;
}

interface StoredState {
	key: 'cursor';
	cursor: string | null;
}

function rowKey(table: string, rowId: string): string {
	return `${table}\u0000${rowId}`;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
	});
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onabort = () =>
			reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'));
		transaction.onerror = () =>
			reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
	});
}

export class IndexedDbStore implements LocalStore {
	constructor(private readonly database: IDBDatabase) {}

	async appendAndApply(
		mutation: Mutation,
		resolver: (row: MaterializedRow | undefined) => MaterializedRow
	): Promise<void> {
		const transaction = this.database.transaction([rowsStore, mutationsStore], 'readwrite');
		const rows = transaction.objectStore(rowsStore);
		const mutations = transaction.objectStore(mutationsStore);
		const existing = await requestResult(mutations.get(mutation.id));
		if (!existing) {
			const key = rowKey(mutation.table, mutation.rowId);
			const row = await requestResult<StoredRow | undefined>(rows.get(key));
			rows.put({
				key,
				table: mutation.table,
				rowId: mutation.rowId,
				value: resolver(row?.value)
			} satisfies StoredRow);
			mutations.add({ ...mutation, acknowledged: false, cursor: null });
		}
		await transactionDone(transaction);
	}

	async applyRemote(
		mutation: Mutation,
		cursor: string,
		resolver: (row: MaterializedRow | undefined) => MaterializedRow
	): Promise<void> {
		const transaction = this.database.transaction(
			[rowsStore, mutationsStore, stateStore],
			'readwrite'
		);
		const rows = transaction.objectStore(rowsStore);
		const mutations = transaction.objectStore(mutationsStore);
		const state = transaction.objectStore(stateStore);
		const existing = await requestResult(mutations.get(mutation.id));
		if (!existing) {
			const key = rowKey(mutation.table, mutation.rowId);
			const row = await requestResult<StoredRow | undefined>(rows.get(key));
			rows.put({
				key,
				table: mutation.table,
				rowId: mutation.rowId,
				value: resolver(row?.value)
			} satisfies StoredRow);
			mutations.add({ ...mutation, acknowledged: true, cursor });
		}
		state.put({ key: 'cursor', cursor } satisfies StoredState);
		await transactionDone(transaction);
	}

	async getRow(table: string, rowId: string): Promise<MaterializedRow | undefined> {
		const transaction = this.database.transaction(rowsStore, 'readonly');
		const row = await requestResult<StoredRow | undefined>(
			transaction.objectStore(rowsStore).get(rowKey(table, rowId))
		);
		await transactionDone(transaction);
		return row?.value;
	}

	async listRows(table: string): Promise<MaterializedRow[]> {
		const transaction = this.database.transaction(rowsStore, 'readonly');
		const all = await requestResult<StoredRow[]>(transaction.objectStore(rowsStore).getAll());
		await transactionDone(transaction);
		return all.filter((row) => row.table === table).map((row) => row.value);
	}

	async pendingMutations(limit: number): Promise<MutationRecord[]> {
		const transaction = this.database.transaction(mutationsStore, 'readonly');
		const all = await requestResult<Array<Mutation & { acknowledged: boolean; cursor: string | null }>>(
			transaction.objectStore(mutationsStore).getAll()
		);
		await transactionDone(transaction);
		return all
			.filter((record) => !record.acknowledged)
			.slice(0, limit)
			.map(({ acknowledged, cursor, ...mutation }) => ({
				mutation,
				acknowledged,
				cursor
			}));
	}

	async markAcknowledged(ids: string[], cursor: string | null): Promise<void> {
		const transaction = this.database.transaction([mutationsStore, stateStore], 'readwrite');
		const mutations = transaction.objectStore(mutationsStore);
		for (const id of ids) {
			const mutation = await requestResult<
				(Mutation & { acknowledged: boolean; cursor: string | null }) | undefined
			>(mutations.get(id));
			if (mutation) mutations.put({ ...mutation, acknowledged: true, cursor });
		}
		if (cursor !== null) transaction.objectStore(stateStore).put({ key: 'cursor', cursor });
		await transactionDone(transaction);
	}

	async lastCursor(): Promise<string | null> {
		const transaction = this.database.transaction(stateStore, 'readonly');
		const stored = await requestResult<StoredState | undefined>(
			transaction.objectStore(stateStore).get('cursor')
		);
		await transactionDone(transaction);
		return stored?.cursor ?? null;
	}

	async setCursor(cursor: string | null): Promise<void> {
		const transaction = this.database.transaction(stateStore, 'readwrite');
		transaction.objectStore(stateStore).put({ key: 'cursor', cursor } satisfies StoredState);
		await transactionDone(transaction);
	}

	async allMutations(limit: number): Promise<MutationRecord[]> {
		const transaction = this.database.transaction(mutationsStore, 'readonly');
		const all = await requestResult<Array<Mutation & { acknowledged: boolean; cursor: string | null }>>(
			transaction.objectStore(mutationsStore).getAll()
		);
		await transactionDone(transaction);
		return all
			.slice(-limit)
			.reverse()
			.map(({ acknowledged, cursor, ...mutation }) => ({ mutation, acknowledged, cursor }));
	}

	close(): void {
		this.database.close();
	}
}

export async function openIndexedDbStore(name = 'kelpie'): Promise<IndexedDbStore> {
	if (typeof indexedDB === 'undefined') {
		throw new Error('IndexedDB is not available in this runtime.');
	}
	const database = await new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(name, 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(rowsStore)) db.createObjectStore(rowsStore, { keyPath: 'key' });
			if (!db.objectStoreNames.contains(mutationsStore)) {
				db.createObjectStore(mutationsStore, { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains(stateStore)) {
				db.createObjectStore(stateStore, { keyPath: 'key' });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('Could not open Kelpie IndexedDB.'));
		request.onblocked = () =>
			reject(new Error('Opening Kelpie IndexedDB is blocked by another tab.'));
	});
	database.onversionchange = () => database.close();
	return new IndexedDbStore(database);
}
