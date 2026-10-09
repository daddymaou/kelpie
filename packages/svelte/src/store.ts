import { readable, type Readable } from 'svelte/store';
import type { Kelpie, KelpieEvent, Query, SyncStatus } from '@kelpie/core';
import type { Mutation } from '@kelpie/protocol';

export function kelpieStatusStore(engine: Kelpie): Readable<SyncStatus> {
	return readable<SyncStatus>(engine.status, (set) =>
		engine.on((event: KelpieEvent) => {
			if (event.type === 'status') set(event.status);
		})
	);
}

export function queryStore<T = Record<string, unknown>>(engine: Kelpie, query: Query<T>): Readable<{ rows: T[]; error: Error | null }> {
	return readable<{ rows: T[]; error: Error | null }>({ rows: [], error: null }, (set) =>
		engine.subscribe(
			query,
			(rows) => set({ rows, error: null }),
			(error) => set({ rows: [], error })
		)
	);
}

export interface TableMutationHelpers {
	insert(row: { id: string } & Record<string, unknown>): Promise<Mutation>;
	update(rowId: string, fields: Record<string, unknown>): Promise<Mutation>;
	delete(rowId: string): Promise<Mutation>;
}

export function createMutationHelpers(engine: Kelpie, table: string): TableMutationHelpers {
	return {
		insert: (row) => engine.insert(table, row),
		update: (rowId, fields) => engine.update(table, rowId, fields),
		delete: (rowId) => engine.delete(table, rowId)
	};
}
