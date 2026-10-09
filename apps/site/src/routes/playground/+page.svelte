<script lang="ts">
	import { onMount } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { SyncSimulation } from '@kelpie/sim';

	interface Note {
		id: string;
		body: string;
	}
	interface LogEntry {
		device: string;
		op: string;
		detail: string;
		source: 'local' | 'remote';
	}

	let sim: SyncSimulation | null = $state(null);
	let ready = $state(false);
	let deviceNotes = $state<Note[][]>([[], []]);
	let online = $state([true, true]);
	let log = $state<LogEntry[]>([]);
	let draft = $state(['', '']);
	let busy = $state(false);

	const labels = ['Device A', 'Device B'];

	function record(device: string, op: string, detail: string, source: 'local' | 'remote') {
		log = [{ device, op, detail, source }, ...log].slice(0, 40);
	}

	async function refresh() {
		if (!sim) return;
		deviceNotes = await Promise.all(
			sim.replicas.map((replica) => replica.engine.query<Note>({ table: 'notes' }))
		);
	}

	async function addNote(index: number) {
		if (!sim) return;
		const body = draft[index]?.trim();
		if (!body) return;
		const id = `n_${Math.random().toString(36).slice(2, 8)}`;
		await sim.replicas[index]!.engine.insert('notes', { id, body });
		draft = draft.map((value, i) => (i === index ? '' : value));
		await settle();
	}

	async function editNote(index: number, id: string, body: string) {
		if (!sim) return;
		await sim.replicas[index]!.engine.update('notes', id, { body });
		await settle();
	}

	async function removeNote(index: number, id: string) {
		if (!sim) return;
		await sim.replicas[index]!.engine.delete('notes', id);
		await settle();
	}

	async function toggleOnline(index: number) {
		if (!sim) return;
		const next = !online[index];
		online = online.map((value, i) => (i === index ? next : value));
		sim.replicas[index]!.setOnline(next);
		await settle();
	}

	async function settle() {
		if (!sim) return;
		busy = true;
		try {
			await sim.converge();
			await refresh();
		} finally {
			busy = false;
		}
	}

	onMount(() => {
		sim = new SyncSimulation(['A', 'B']);
		for (const replica of sim.replicas) {
			replica.engine.on((event) => {
				if (event.type === 'mutation') {
					const mutation = event.mutation;
					record(mutation.deviceId, mutation.op, `${mutation.table}/${mutation.rowId}`, event.source);
				}
			});
		}
		ready = true;
		// Seed one note so the first screen is not empty.
		void sim.replicas[0]!.engine.insert('notes', { id: 'n_seed', body: 'Buy oat milk' }).then(settle);
	});
</script>

<Seo
	title="Playground"
	description="Two Kelpie devices, one deterministic network. Take a device offline, write locally, and watch the mutation log converge."
	path="/playground"
/>
<main id="main-content" class="page">
	<header class="page-head">
		<p class="eyebrow">PLAYGROUND</p>
		<h1 class="page-title">Two devices. One <em>truth.</em></h1>
		<p class="page-lede">
			This runs <code>@kelpie/sim</code> entirely in your browser. Take a device offline, make an edit, then bring
			it back and watch the deterministic network converge. Every accepted mutation is shown in the log.
		</p>
	</header>

	{#if ready && sim}
		<div class="playground">
			{#each sim.replicas as replica, index}
				<section class="device">
					<div class="device-head">
						<strong>{labels[index]}</strong>
						<span class="device-state">{online[index] ? 'ONLINE' : 'OFFLINE'} · {deviceNotes[index]?.length ?? 0} notes</span>
					</div>
					<div class="device-body">
						{#each deviceNotes[index] ?? [] as note (note.id)}
							<div class="note-row">
								<input
									value={note.body}
									aria-label="Note body"
									onchange={(event) => editNote(index, note.id, event.currentTarget.value)}
								/>
								<button type="button" aria-label="Delete note" onclick={() => removeNote(index, note.id)}>✕</button>
							</div>
						{/each}
						<div class="note-row">
							<input
								bind:value={draft[index]}
								placeholder="Write a note…"
								aria-label="New note"
								onkeydown={(event) => {
									if (event.key === 'Enter') addNote(index);
								}}
							/>
							<button type="button" onclick={() => addNote(index)} aria-label="Add note">＋</button>
						</div>
					</div>
				</section>
			{/each}
		</div>

		<div class="playground-controls">
			{#each sim.replicas as replica, index}
				<button class="toggle-btn" data-on={online[index]} type="button" onclick={() => toggleOnline(index)}>
					{online[index] ? `Take ${labels[index]} offline` : `Bring ${labels[index]} online`}
				</button>
			{/each}
			<button class="button-ghost" type="button" onclick={settle} disabled={busy}>
				{busy ? 'Syncing…' : 'Sync now'}
			</button>
		</div>

		<section class="mutation-log">
			<h3>MUTATION LOG — MOST RECENT FIRST</h3>
			{#if log.length}
				<ol>
					{#each log as entry}
						<li>
							<span>{entry.device}</span>
							<span class="op">{entry.op}</span>
							<span>{entry.detail} · {entry.source}</span>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="empty">No mutations yet. Add a note to a device to begin.</p>
			{/if}
		</section>
	{:else}
		<p class="muted-note">Loading the simulator…</p>
	{/if}
</main>
