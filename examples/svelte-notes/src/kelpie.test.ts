import { describe, expect, it } from 'vitest';
import { engine } from './kelpie';

interface Note {
	id: string;
	title: string;
	body: string;
}

describe('svelte-notes engine', () => {
	it('inserts, updates, queries, and deletes notes', async () => {
		const id = 'note_1';
		await engine.insert('notes', { id, title: 'Tide tables', body: 'before leaving', updatedAt: 1 });

		let rows = await engine.query<Note>({ table: 'notes' });
		expect(rows).toHaveLength(1);
		expect(rows[0]!.title).toBe('Tide tables');

		await engine.update('notes', id, { body: 'before sunset' });
		rows = await engine.query<Note>({ table: 'notes' });
		expect(rows[0]!.body).toBe('before sunset');

		await engine.delete('notes', id);
		rows = await engine.query<Note>({ table: 'notes' });
		expect(rows).toHaveLength(0);
	});
});