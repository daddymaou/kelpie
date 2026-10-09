import {
	mutationSchema,
	protocolVersion,
	type Mutation
} from '@kelpie/protocol';
import { HybridLogicalClock } from './hlc.js';
import { createUlid } from './ids.js';
import { lastWriteWins, visibleRow, type MaterializedRow, type TableResolver } from './resolver.js';
import type { LocalStore } from './storage.js';
import type { SyncTransport } from './transport.js';

export type SyncStatus = 'idle' | 'connecting' | 'online' | 'offline' | 'syncing' | 'error';

export type KelpieEvent =
	| { type: 'status'; status: SyncStatus }
	| { type: 'queue'; depth: number }
	| { type: 'mutation'; mutation: Mutation; source: 'local' | 'remote' }
	| { type: 'error'; error: Error };

export interface Query<T> {
	table: string;
	where?: (row: Record<string, unknown>) => boolean;
	select?: (row: Record<string, unknown>) => T;
}

export interface EngineOptions {
	deviceId: string;
	schemaVersion: number;
	store: LocalStore;
	transport?: SyncTransport;
	resolvers?: Record<string, TableResolver>;
	now?: () => number;
	random?: () => number;
	retryBaseMs?: number;
	retryMaxMs?: number;
}

export class Kelpie {
	readonly #clock: HybridLogicalClock;
	readonly #listeners = new Set<(event: KelpieEvent) => void>();
	readonly #queryListeners = new Map<string, Set<() => void>>();
	readonly #resolvers: Record<string, TableResolver>;
	#status: SyncStatus = 'idle';
	#running = false;
	#retryAttempt = 0;
	#stopSocket: (() => void) | undefined;

	constructor(readonly options: EngineOptions) {
		if (!Number.isInteger(options.schemaVersion) || options.schemaVersion < 1) {
			throw new Error('schemaVersion must be a positive integer.');
		}
		this.#clock = new HybridLogicalClock(options.deviceId, undefined, {
			now: options.now ?? Date.now
		});
		this.#resolvers = options.resolvers ?? {};
	}

	get status(): SyncStatus {
		return this.#status;
	}

	on(listener: (event: KelpieEvent) => void): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	async get<T extends Record<string, unknown> = Record<string, unknown>>(
		table: string,
		rowId: string
	): Promise<T | undefined> {
		return visibleRow(await this.options.store.getRow(table, rowId)) as T | undefined;
	}

	async query<T = Record<string, unknown>>(query: Query<T>): Promise<T[]> {
		const rows = await this.options.store.listRows(query.table);
		return rows.flatMap((row) => {
			const value = visibleRow(row);
			if (!value || (query.where && !query.where(value))) return [];
			return [query.select ? query.select(value) : (value as T)];
		});
	}

	subscribe<T>(
		query: Query<T>,
		listener: (rows: T[]) => void,
		onError: (error: Error) => void = (error) => this.#emit({ type: 'error', error })
	): () => void {
		const listeners = this.#queryListeners.get(query.table) ?? new Set<() => void>();
		const refresh = () => {
			void this.query(query).then(listener, onError);
		};
		listeners.add(refresh);
		this.#queryListeners.set(query.table, listeners);
		refresh();
		return () => {
			listeners.delete(refresh);
			if (listeners.size === 0) this.#queryListeners.delete(query.table);
		};
	}

	async insert(table: string, row: { id: string } & Record<string, unknown>): Promise<Mutation> {
		return this.#write(table, row.id, 'insert', Object.fromEntries(
			Object.entries(row).filter(([field]) => field !== 'id')
		));
	}

	async update(
		table: string,
		rowId: string,
		fields: Record<string, unknown>
	): Promise<Mutation> {
		if (Object.keys(fields).length === 0) throw new Error('An update must include at least one field.');
		return this.#write(table, rowId, 'update', fields);
	}

	async delete(table: string, rowId: string): Promise<Mutation> {
		return this.#write(table, rowId, 'delete', {});
	}

	async #write(
		table: string,
		rowId: string,
		op: Mutation['op'],
		fields: Record<string, unknown>
	): Promise<Mutation> {
		const mutation = mutationSchema.parse({
			id: createUlid(this.#clock.tick().wallTime),
			table,
			rowId,
			op,
			fields,
			hlc: this.#clock.last,
			schemaVersion: this.options.schemaVersion,
			deviceId: this.options.deviceId
		});
		await this.options.store.appendAndApply(
			mutation,
			this.#resolvers[table] ?? lastWriteWins
		);
		this.#emit({ type: 'mutation', mutation, source: 'local' });
		this.#notifyTable(table);
		await this.#emitQueueDepth();
		return mutation;
	}

	async start(): Promise<void> {
		if (this.#running) return;
		if (!this.options.transport) throw new Error('Cannot start sync without a configured transport.');
		this.#running = true;
		this.#setStatus('connecting');
		if (this.options.transport.connect) {
			this.#stopSocket = await this.options.transport.connect({
				onMutations: (mutations, cursor) => {
					void this.#applyRemote(mutations, cursor).catch((error: unknown) => {
						this.#fail(error);
					});
				},
				onError: (error) => {
					this.#setStatus('offline');
					this.#emit({ type: 'error', error });
					this.#scheduleRetry();
				}
			});
			this.#setStatus('online');
		}
		void this.#syncLoop();
	}

	async stop(): Promise<void> {
		this.#running = false;
		this.#stopSocket?.();
		this.#stopSocket = undefined;
		this.#setStatus('idle');
	}

	async syncOnce(signal?: AbortSignal): Promise<void> {
		const transport = this.options.transport;
		if (!transport) throw new Error('Cannot sync without a configured transport.');
		this.#setStatus('syncing');
		const pending = await this.options.store.pendingMutations(500);
		if (pending.length) {
			const pushed = await transport.push(pending.map((record) => record.mutation), signal);
			await this.options.store.markAcknowledged(pushed.accepted, pushed.cursor);
			if (pushed.rejected.length) {
				for (const rejected of pushed.rejected) {
					this.#emit({ type: 'error', error: new Error(`${rejected.error.code}: ${rejected.error.message}`) });
				}
			}
		}
		let cursor = await this.options.store.lastCursor();
		for (;;) {
			const pulled = await transport.pull(cursor, this.options.schemaVersion, signal);
			await this.#applyRemote(pulled.mutations, pulled.nextCursor);
			cursor = pulled.nextCursor;
			if (!pulled.hasMore) break;
		}
		this.#retryAttempt = 0;
		this.#setStatus('online');
		await this.#emitQueueDepth();
	}

	async #applyRemote(mutations: Mutation[], cursor: string): Promise<void> {
		for (const mutation of mutations) {
			this.#clock.receive(mutation.hlc);
			const resolver = this.#resolvers[mutation.table] ?? lastWriteWins;
			await this.options.store.applyRemote(mutation, cursor, (row) => resolver(row, mutation));
			this.#emit({ type: 'mutation', mutation, source: 'remote' });
			this.#notifyTable(mutation.table);
		}
		await this.options.store.setCursor(cursor);
	}

	async #syncLoop(): Promise<void> {
		while (this.#running) {
			try {
				await this.syncOnce();
				await this.#sleep(1_000);
			} catch (error) {
				this.#fail(error);
				await this.#sleep(this.#retryDelay());
			}
		}
	}

	#retryDelay(): number {
		const base = this.options.retryBaseMs ?? 500;
		const maximum = this.options.retryMaxMs ?? 30_000;
		const exponential = Math.min(maximum, base * 2 ** this.#retryAttempt++);
		const random = this.options.random ?? Math.random;
		return Math.max(0, Math.floor(exponential * (0.5 + random() * 0.5)));
	}

	#scheduleRetry(): void {
		if (!this.#running) return;
		setTimeout(() => {
			if (this.#running) void this.#syncLoop();
		}, this.#retryDelay());
	}

	#sleep(milliseconds: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	#fail(reason: unknown): void {
		const error = reason instanceof Error ? reason : new Error(String(reason));
		this.#setStatus('error');
		this.#emit({ type: 'error', error });
	}

	#setStatus(status: SyncStatus): void {
		if (this.#status === status) return;
		this.#status = status;
		this.#emit({ type: 'status', status });
	}

	#emitQueueDepth(): Promise<void> {
		return this.options.store.pendingMutations(100_000).then((pending) => {
			this.#emit({ type: 'queue', depth: pending.length });
		});
	}

	#notifyTable(table: string): void {
		for (const notify of this.#queryListeners.get(table) ?? []) notify();
	}

	#emit(event: KelpieEvent): void {
		for (const listener of this.#listeners) listener(event);
	}
}

export { protocolVersion, type MaterializedRow };
