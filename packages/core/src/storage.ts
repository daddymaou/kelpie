import type { Mutation } from '@kelpie/protocol';
import type { MaterializedRow } from './resolver.js';

export interface MutationRecord {
	mutation: Mutation;
	cursor: string | null;
	acknowledged: boolean;
}

export interface LocalStore {
	appendAndApply(mutation: Mutation, resolver: (row: MaterializedRow | undefined) => MaterializedRow): Promise<void>;
	applyRemote(
		mutation: Mutation,
		cursor: string,
		resolver: (row: MaterializedRow | undefined) => MaterializedRow
	): Promise<void>;
	getRow(table: string, rowId: string): Promise<MaterializedRow | undefined>;
	listRows(table: string): Promise<MaterializedRow[]>;
	pendingMutations(limit: number): Promise<MutationRecord[]>;
	markAcknowledged(ids: string[], cursor: string | null): Promise<void>;
	lastCursor(): Promise<string | null>;
	setCursor(cursor: string | null): Promise<void>;
	allMutations(limit: number): Promise<MutationRecord[]>;
}

function key(table: string, rowId: string): string {
	return `${table}\u0000${rowId}`;
}

export class MemoryStore implements LocalStore {
	readonly #rows = new Map<string, MaterializedRow>();
	readonly #mutations = new Map<string, MutationRecord>();
	#cursor: string | null = null;

	async appendAndApply(
		mutation: Mutation,
		resolver: (row: MaterializedRow | undefined) => MaterializedRow
	): Promise<void> {
		if (this.#mutations.has(mutation.id)) return;
		const rowKey = key(mutation.table, mutation.rowId);
		this.#rows.set(rowKey, resolver(this.#rows.get(rowKey)));
		this.#mutations.set(mutation.id, { mutation, cursor: null, acknowledged: false });
	}

	async applyRemote(
		mutation: Mutation,
		cursor: string,
		resolver: (row: MaterializedRow | undefined) => MaterializedRow
	): Promise<void> {
		if (!this.#mutations.has(mutation.id)) {
			const rowKey = key(mutation.table, mutation.rowId);
			this.#rows.set(rowKey, resolver(this.#rows.get(rowKey)));
			this.#mutations.set(mutation.id, { mutation, cursor, acknowledged: true });
		}
		this.#cursor = cursor;
	}

	async getRow(table: string, rowId: string): Promise<MaterializedRow | undefined> {
		return this.#rows.get(key(table, rowId));
	}

	async listRows(table: string): Promise<MaterializedRow[]> {
		const prefix = `${table}\u0000`;
		return [...this.#rows.entries()]
			.filter(([rowKey]) => rowKey.startsWith(prefix))
			.map(([, row]) => row);
	}

	async pendingMutations(limit: number): Promise<MutationRecord[]> {
		return [...this.#mutations.values()].filter((record) => !record.acknowledged).slice(0, limit);
	}

	async markAcknowledged(ids: string[], cursor: string | null): Promise<void> {
		for (const id of ids) {
			const record = this.#mutations.get(id);
			if (record) this.#mutations.set(id, { ...record, acknowledged: true, cursor });
		}
		if (cursor !== null) this.#cursor = cursor;
	}

	async lastCursor(): Promise<string | null> {
		return this.#cursor;
	}

	async setCursor(cursor: string | null): Promise<void> {
		this.#cursor = cursor;
	}

	async allMutations(limit: number): Promise<MutationRecord[]> {
		return [...this.#mutations.values()].slice(-limit).reverse();
	}
}
