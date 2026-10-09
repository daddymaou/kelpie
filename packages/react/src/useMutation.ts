import { useCallback } from 'react';
import type { Kelpie } from '@kelpie/core';
import type { Mutation } from '@kelpie/protocol';

export interface TableMutations {
	insert(row: { id: string } & Record<string, unknown>): Promise<Mutation>;
	update(rowId: string, fields: Record<string, unknown>): Promise<Mutation>;
	delete(rowId: string): Promise<Mutation>;
}

export function useMutation(engine: Kelpie | null, table: string): TableMutations {
	const insert = useCallback(
		(row: { id: string } & Record<string, unknown>) => {
			if (!engine) throw new Error('Kelpie engine is not initialized.');
			return engine.insert(table, row);
		},
		[engine, table]
	);
	const update = useCallback(
		(rowId: string, fields: Record<string, unknown>) => {
			if (!engine) throw new Error('Kelpie engine is not initialized.');
			return engine.update(table, rowId, fields);
		},
		[engine, table]
	);
	const remove = useCallback(
		(rowId: string) => {
			if (!engine) throw new Error('Kelpie engine is not initialized.');
			return engine.delete(table, rowId);
		},
		[engine, table]
	);
	return { insert, update, delete: remove };
}
