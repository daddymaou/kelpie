import { useState } from 'react';
import { useMutation, useTableQuery } from '@kelpie/react';
import { engine } from './kelpie';

interface Todo {
	id: string;
	title: string;
	done: boolean;
	createdAt: number;
}

let counter = 0;

export default function App() {
	const { rows: todos, error } = useTableQuery<Todo>(engine, 'todos');
	const todosApi = useMutation(engine, 'todos');
	const [draft, setDraft] = useState('');

	async function addTodo(event: React.FormEvent) {
		event.preventDefault();
		const title = draft.trim();
		if (!title) return;
		counter += 1;
		await todosApi.insert({
			id: `todo_${Date.now().toString(36)}_${counter}`,
			title,
			done: false,
			createdAt: Date.now()
		});
		setDraft('');
	}

	async function toggle(id: string, done: boolean) {
		await todosApi.update(id, { done: !done });
	}

	async function remove(id: string) {
		await todosApi.delete(id);
	}

	return (
		<main className="app">
			<h1>Kelpie · React todo</h1>
			<p className="hint">
				Local-first: writes land in the store immediately, no server required. The queue stays at zero without a
				transport.
			</p>
			<form className="row" onSubmit={addTodo}>
				<input
					value={draft}
					onChange={(event) => setDraft(event.currentTarget.value)}
					placeholder="What needs doing?"
					aria-label="New todo"
				/>
				<button type="submit">Add</button>
			</form>
			{error ? <p className="error">{error.message}</p> : null}
			<ul className="todos">
				{todos.map((todo) => (
					<li key={todo.id} className={todo.done ? 'done' : ''}>
						<label>
							<input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id, todo.done)} />
							{todo.title}
						</label>
						<button type="button" onClick={() => remove(todo.id)} aria-label={`Delete ${todo.title}`}>
							×
						</button>
					</li>
				))}
			</ul>
			{todos.length === 0 ? <p className="empty">Nothing here yet. Add a todo to get started.</p> : null}
		</main>
	);
}