import { describe, expect, it } from 'vitest';
import { lastWriteWins, visibleRow } from './resolver.js';
import type { Mutation } from '@kelpie/protocol';

function mutation(
	deviceId: string,
	counter: number,
	fields: Record<string, unknown>,
	op: Mutation['op'] = 'update'
): Mutation {
	return {
		id: `01JGFJJZ00000000000000000${deviceId === 'device-a' ? '0' : '1'}`,
		table: 'notes',
		rowId: 'n1',
		op,
		fields,
		hlc: { wallTime: 100, counter, deviceId },
		schemaVersion: 1,
		deviceId
	};
}

describe('lastWriteWins', () => {
	it('merges fields independently rather than replacing the whole row', () => {
		const first = lastWriteWins(undefined, mutation('device-a', 1, { title: 'Draft' }));
		const merged = lastWriteWins(first, mutation('device-b', 2, { color: 'steel' }));
		expect(visibleRow(merged)).toEqual({ id: 'n1', title: 'Draft', color: 'steel' });
	});

	it('keeps tombstones until a newer update arrives', () => {
		const deleted = lastWriteWins(
			lastWriteWins(undefined, mutation('device-a', 1, { title: 'Draft' })),
			mutation('device-b', 2, {}, 'delete')
		);
		expect(visibleRow(deleted)).toBeUndefined();
		const restored = lastWriteWins(deleted, mutation('device-a', 3, { title: 'Restored' }));
		expect(visibleRow(restored)).toEqual({ id: 'n1', title: 'Restored' });
	});
});
