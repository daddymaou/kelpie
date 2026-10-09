import { describe, expect, it } from 'vitest';
import { engine } from './kelpie';

interface Todo {
	id: string;
	title: string;
	done: boolean;
}

describe('react-todo engine', () => {
	it('inserts, updates, queries, and deletes todos', async () => {
		const id = 'todo_1';
		await engine.insert('todos', { id, title: 'Write an example', done: false, createdAt: 1 });

		let rows = await engine.query<Todo>({ table: 'todos' });
		expect(rows).toHaveLength(1);
		expect(rows[0]!.done).toBe(false);

		await engine.update('todos', id, { done: true });
		rows = await engine.query<Todo>({ table: 'todos' });
		expect(rows[0]!.done).toBe(true);

		await engine.delete('todos', id);
		rows = await engine.query<Todo>({ table: 'todos' });
		expect(rows).toHaveLength(0);
	});
});