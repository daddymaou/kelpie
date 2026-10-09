<script lang="ts">
	import { createMutationHelpers, kelpieStatusStore, queryStore } from '@kelpie/svelte';
	import { engine } from './kelpie';

	interface Note {
		id: string;
		title: string;
		body: string;
		updatedAt: number;
	}

	const notes = queryStore<Note>(engine, { table: 'notes' });
	const status = kelpieStatusStore(engine);
	const notesApi = createMutationHelpers(engine, 'notes');

	let title = $state('');
	let body = $state('');
	let counter = 0;

	async function addNote() {
		const trimmed = title.trim();
		if (!trimmed) return;
		counter += 1;
		await notesApi.insert({
			id: `note_${Date.now().toString(36)}_${counter}`,
			title: trimmed,
			body,
			updatedAt: Date.now()
		});
		title = '';
		body = '';
	}

	async function removeNote(id: string) {
		await notesApi.delete(id);
	}
</script>

<main class="app">
	<h1>Kelpie · Svelte notes</h1>
	<p class="hint">
		Sync status: <code>{$status}</code>. Writes are local-first; without a transport the queue is the terminal state.
	</p>

	<form onsubmit|preventDefault={addNote}>
		<input bind:value={title} placeholder="Title" aria-label="Note title" />
		<textarea bind:value={body} placeholder="Body" rows="3" aria-label="Note body"></textarea>
		<button type="submit">Add note</button>
	</form>

	{#if $notes.error}
		<p class="error">{$notes.error.message}</p>
	{/if}

	{#if $notes.rows.length}
		<ul class="notes">
			{#each $notes.rows as note (note.id)}
				<li>
					<strong>{note.title}</strong>
					<p>{note.body}</p>
					<button type="button" onclick={() => removeNote(note.id)}>Delete</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">Nothing here yet. Add a note to get started.</p>
	{/if}
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
		background: #f4f2ec;
		color: #1c1a16;
	}

	.app {
		max-width: 540px;
		margin: 0 auto;
		padding: 48px 20px;
	}

	h1 {
		font-size: 28px;
		margin: 0 0 8px;
	}

	.hint,
	.empty {
		color: #6b675c;
		font-size: 14px;
		line-height: 1.6;
	}

	form {
		display: grid;
		gap: 8px;
		margin: 20px 0;
	}

	input,
	textarea {
		padding: 10px 12px;
		border: 1px solid #d8d2c2;
		border-radius: 8px;
		font: inherit;
		background: #fffdf7;
	}

	button {
		padding: 10px 14px;
		border: 1px solid #d8d2c2;
		border-radius: 8px;
		background: #fffdf7;
		font-size: 14px;
		cursor: pointer;
		justify-self: start;
	}

	button:hover {
		border-color: #bf5b3d;
		color: #bf5b3d;
	}

	.notes {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}

	.notes li {
		padding: 12px 14px;
		border: 1px solid #d8d2c2;
		border-radius: 8px;
		background: #fffdf7;
	}

	.notes p {
		margin: 6px 0;
		color: #6b675c;
		font-size: 14px;
	}

	.notes button {
		padding: 4px 10px;
		margin-top: 4px;
	}

	.error {
		color: #a33;
		font-size: 13px;
	}

	@media (prefers-color-scheme: dark) {
		:global(body) {
			background: #1f1e1b;
			color: #eee9de;
		}

		input,
		textarea,
		button,
		.notes li {
			background: #262522;
			border-color: #3a382f;
			color: #eee9de;
		}

		.hint,
		.empty,
		.notes p {
			color: #a8a294;
		}
	}
</style>