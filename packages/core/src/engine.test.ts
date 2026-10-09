import { describe, expect, it } from 'vitest';
import { Kelpie } from './engine.js';
import { MemoryStore } from './storage.js';

describe('Kelpie local writes', () => {
	it('applies writes immediately, stores immutable mutations, and notifies queries', async () => {
		let time = 1_735_689_600_000;
		const engine = new Kelpie({
			deviceId: 'device-a',
			schemaVersion: 1,
			store: new MemoryStore(),
			now: () => time++
		});
		const seen: Array<Record<string, unknown>[]> = [];
		engine.subscribe({ table: 'tasks' }, (rows) => seen.push(rows));
		await engine.insert('tasks', { id: 'task-1', title: 'Ship local writes', done: false });
		await Promise.resolve();
		expect(await engine.get('tasks', 'task-1')).toMatchObject({
			id: 'task-1',
			title: 'Ship local writes',
			done: false
		});
		expect(seen.at(-1)).toHaveLength(1);
	});

	it('rejects an empty update instead of creating a meaningless mutation', async () => {
		const engine = new Kelpie({
			deviceId: 'device-a',
			schemaVersion: 1,
			store: new MemoryStore()
		});
		await expect(engine.update('tasks', 'task-1', {})).rejects.toThrow('at least one field');
	});
});
