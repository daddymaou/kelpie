import type { Mutation, ProtocolError } from '@kelpie/protocol';
import { lastWriteWins, type MaterializedRow } from '@kelpie/core';

export interface AppendOutcome {
	accepted: string[];
	rejected: Array<{ id: string; error: ProtocolError }>;
	cursor: string | null;
}

export interface PullOutcome {
	mutations: Mutation[];
	nextCursor: string | null;
	hasMore: boolean;
}

export type PullFilter = (mutation: Mutation) => boolean | Promise<boolean>;

export interface StoreStats {
	cursor: string | null;
	mutations: number;
	rows: number;
	tables: string[];
	backend: 'memory' | 'postgres';
}

export interface CompactionOptions {
	/** Delete log entries with a cursor strictly below this value. */
	logBefore?: number;
	/** Drop materialized rows tombstoned before this wall-clock time (ms). */
	tombstoneBefore?: number;
}

export interface CompactionReport {
	removedLogEntries: number;
	removedTombstones: number;
	/** Cursor high-water mark preserved after log compaction. */
	cursor: string | null;
}

export interface ServerStore {
	/**
	 * Append mutations idempotently: an id that already exists with identical
	 * content is accepted as a duplicate; the same id with different content
	 * is rejected with CONFLICT. Materialized rows are updated in the same step.
	 */
	append(mutations: Mutation[]): Promise<AppendOutcome>;
	/**
	 * Read forward from `after` (exclusive, null = beginning). The filter is
	 * applied per mutation; `nextCursor` always advances past every examined
	 * entry so filtered-out entries cannot stall a client's progress.
	 */
	pull(after: string | null, limit: number, filter: PullFilter): Promise<PullOutcome>;
	stats(): Promise<StoreStats>;
	compact(options: CompactionOptions): Promise<CompactionReport>;
	close(): Promise<void>;
}

export function materialize(
	current: MaterializedRow | undefined,
	mutation: Mutation
): MaterializedRow {
	return lastWriteWins(current, mutation);
}

export function parseCursor(cursor: string | null): number | null {
	if (cursor === null) return null;
	if (!/^\d{1,15}$/.test(cursor)) {
		throw new Error(`Invalid cursor: ${JSON.stringify(cursor)}`);
	}
	return Number(cursor);
}

/** How many log entries a single pull may examine (readable or not). */
export const PULL_EXAMINE_WINDOW = 500;
