import type { Mutation, ProtocolError } from '@kelpie/protocol';
import type { MaterializedRow } from '@kelpie/core';
import {
	materialize,
	parseCursor,
	PULL_EXAMINE_WINDOW,
	type AppendOutcome,
	type CompactionOptions,
	type CompactionReport,
	type PullFilter,
	type PullOutcome,
	type ServerStore,
	type StoreStats
} from './store.js';

interface LogEntry {
	cursor: number;
	mutation: Mutation;
	fingerprint: string;
}

function fingerprint(mutation: Mutation): string {
	return JSON.stringify([
		mutation.table,
		mutation.rowId,
		mutation.op,
		mutation.fields,
		mutation.hlc,
		mutation.schemaVersion,
		mutation.deviceId
	]);
}

function rowKey(table: string, rowId: string): string {
	return `${table}\u0000${rowId}`;
}

export class MemoryServerStore implements ServerStore {
	readonly #entries: LogEntry[] = [];
	readonly #byId = new Map<string, LogEntry>();
	readonly #rows = new Map<string, MaterializedRow>();
	#highWaterCursor = 0;

	async append(mutations: Mutation[]): Promise<AppendOutcome> {
		const accepted: string[] = [];
		const rejected: Array<{ id: string; error: ProtocolError }> = [];

		for (const mutation of mutations) {
			const existing = this.#byId.get(mutation.id);
			if (existing) {
				if (existing.fingerprint === fingerprint(mutation)) {
					accepted.push(mutation.id);
				} else {
					rejected.push({
						id: mutation.id,
						error: {
							code: 'CONFLICT',
							message: `Mutation ${mutation.id} was already stored with different content.`,
							retryable: false
						}
					});
				}
				continue;
			}
			const entry: LogEntry = {
				cursor: ++this.#highWaterCursor,
				mutation,
				fingerprint: fingerprint(mutation)
			};
			this.#entries.push(entry);
			this.#byId.set(mutation.id, entry);
			const key = rowKey(mutation.table, mutation.rowId);
			this.#rows.set(key, materialize(this.#rows.get(key), mutation));
			accepted.push(mutation.id);
		}

		return { accepted, rejected, cursor: String(this.#highWaterCursor) };
	}

	async pull(after: string | null, limit: number, filter: PullFilter): Promise<PullOutcome> {
		const afterCursor = parseCursor(after) ?? 0;
		const mutations: Mutation[] = [];
		let examined = 0;
		let nextCursor = afterCursor;
		let index = this.#entries.findIndex((entry) => entry.cursor > afterCursor);
		if (index === -1) index = this.#entries.length;

		while (index < this.#entries.length && examined < PULL_EXAMINE_WINDOW) {
			const entry = this.#entries[index]!;
			examined += 1;
			nextCursor = entry.cursor;
			if (mutations.length < limit && (await filter(entry.mutation))) {
				mutations.push(entry.mutation);
			}
			index += 1;
		}

		return {
			mutations,
			nextCursor: String(nextCursor),
			hasMore: index < this.#entries.length
		};
	}

	async stats(): Promise<StoreStats> {
		const tables = new Set<string>();
		for (const entry of this.#entries) tables.add(entry.mutation.table);
		return {
			cursor: this.#highWaterCursor > 0 ? String(this.#highWaterCursor) : null,
			mutations: this.#entries.length,
			rows: this.#rows.size,
			tables: [...tables].sort(),
			backend: 'memory'
		};
	}

	async compact(options: CompactionOptions): Promise<CompactionReport> {
		let removedLogEntries = 0;
		if (options.logBefore !== undefined && options.logBefore > 0) {
			const keep = this.#entries.filter((entry) => entry.cursor >= options.logBefore!);
			removedLogEntries = this.#entries.length - keep.length;
			if (removedLogEntries > 0) {
				this.#entries.splice(0, this.#entries.length, ...keep);
				this.#byId.clear();
				for (const entry of this.#entries) this.#byId.set(entry.mutation.id, entry);
			}
		}

		let removedTombstones = 0;
		if (options.tombstoneBefore !== undefined) {
			for (const [key, row] of this.#rows) {
				if (row.tombstone && row.tombstone.wallTime < options.tombstoneBefore) {
					this.#rows.delete(key);
					removedTombstones += 1;
				}
			}
		}

		return {
			removedLogEntries,
			removedTombstones,
			cursor: this.#highWaterCursor > 0 ? String(this.#highWaterCursor) : null
		};
	}

	async close(): Promise<void> {
		// Nothing to release.
	}
}
