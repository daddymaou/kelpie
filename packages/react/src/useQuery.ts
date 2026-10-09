import { useEffect, useRef, useState } from 'react';
import type { Kelpie, Query } from '@kelpie/core';

export function useQuery<T = Record<string, unknown>>(
	engine: Kelpie | null,
	query: Query<T>
): { rows: T[]; error: Error | null } {
	const [rows, setRows] = useState<T[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const queryRef = useRef(query);
	queryRef.current = query;

	useEffect(() => {
		if (!engine) {
			setRows([]);
			setError(null);
			return;
		}

		const unsubscribe = engine.subscribe(
			queryRef.current,
			(nextRows) => {
				setRows(nextRows);
				setError(null);
			},
			(nextError) => setError(nextError)
		);

		return () => unsubscribe();
	}, [engine, query.table, query.where, query.select]);

	return { rows, error };
}

/** Convenience wrapper when table name is stable but filters are inline. */
export function useTableQuery<T = Record<string, unknown>>(
	engine: Kelpie | null,
	table: string,
	where?: Query<T>['where'],
	select?: Query<T>['select']
): { rows: T[]; error: Error | null } {
	return useQuery(engine, { table, where, select });
}
