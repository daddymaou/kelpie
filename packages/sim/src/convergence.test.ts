import { describe, expect, it } from 'vitest';
import { SyncSimulation } from './replica.js';

describe('deterministic sync simulation', () => {
	it('converges concurrent field edits through partitions, reordering, and duplicate delivery', async () => {
		const simulation = new SyncSimulation(['device-a', 'device-b', 'device-c'], {
			reorder: true,
			duplicateDelivery: 2,
			seed: 91,
			now: (deviceId) => () => (deviceId === 'device-a' ? 1_000 : 900)
		});
		const [first, second, third] = simulation.replicas;
		if (!first || !second || !third) throw new Error('The simulation did not create all replicas.');

		await first.engine.insert('notes', { id: 'note-1', title: 'Start', detail: 'shared' });
		second.setOnline(false);
		third.setOnline(false);
		await simulation.converge();

		await first.engine.update('notes', 'note-1', { title: 'From A' });
		await second.engine.update('notes', 'note-1', { title: 'From B' });
		await third.engine.update('notes', 'note-1', { detail: 'Changed elsewhere' });

		second.setOnline(true);
		third.setOnline(true);
		await simulation.converge();

		const snapshots = await simulation.snapshot('notes');
		expect(snapshots[0]).toEqual(snapshots[1]);
		expect(snapshots[1]).toEqual(snapshots[2]);
		expect(snapshots[0]).toEqual([
			{ id: 'note-1', title: 'From A', detail: 'Changed elsewhere' }
		]);
	});

	it('resumes an offline queue and applies repeated delivery exactly once', async () => {
		const simulation = new SyncSimulation(['laptop', 'phone'], {
			duplicateDelivery: 3,
			seed: 12
		});
		const [laptop, phone] = simulation.replicas;
		if (!laptop || !phone) throw new Error('The simulation did not create both replicas.');
		phone.setOnline(false);
		await laptop.engine.insert('tasks', { id: 'task-1', title: 'Queue while away' });
		await simulation.converge();
		phone.setOnline(true);
		await simulation.converge();
		expect(await simulation.snapshot('tasks')).toEqual([
			[{ id: 'task-1', title: 'Queue while away' }],
			[{ id: 'task-1', title: 'Queue while away' }]
		]);
	});
});
