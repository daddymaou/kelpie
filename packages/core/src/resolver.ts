import type { Clock, Mutation } from '@kelpie/protocol';
import { compareClocks } from './hlc.js';

export interface VersionedField {
	value: unknown;
	clock: Clock;
}

export interface MaterializedRow {
	id: string;
	fields: Record<string, VersionedField>;
	tombstone?: Clock;
}

export type TableResolver = (
	current: MaterializedRow | undefined,
	incoming: Mutation
) => MaterializedRow;

export function lastWriteWins(
	current: MaterializedRow | undefined,
	incoming: Mutation
): MaterializedRow {
	const row: MaterializedRow = current
		? {
				id: current.id,
				fields: { ...current.fields },
				...(current.tombstone ? { tombstone: current.tombstone } : {})
			}
		: { id: incoming.rowId, fields: {} };

	if (incoming.op === 'delete') {
		if (!row.tombstone || compareClocks(incoming.hlc, row.tombstone) > 0) {
			row.tombstone = incoming.hlc;
		}
		return row;
	}

	for (const [name, value] of Object.entries(incoming.fields)) {
		const previous = row.fields[name];
		if (!previous || compareClocks(incoming.hlc, previous.clock) > 0) {
			row.fields[name] = { value, clock: incoming.hlc };
		}
	}

	if (row.tombstone && compareClocks(incoming.hlc, row.tombstone) > 0) {
		delete row.tombstone;
	}
	return row;
}

export function visibleRow(row: MaterializedRow | undefined): Record<string, unknown> | undefined {
	if (!row) return undefined;
	if (row.tombstone) {
		const newestField = Object.values(row.fields).reduce<Clock | undefined>(
			(newest, field) => (!newest || compareClocks(field.clock, newest) > 0 ? field.clock : newest),
			undefined
		);
		if (!newestField || compareClocks(row.tombstone, newestField) >= 0) return undefined;
	}
	return Object.fromEntries([
		['id', row.id],
		...Object.entries(row.fields).map(([name, field]) => [name, field.value])
	]);
}
