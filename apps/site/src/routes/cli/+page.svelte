<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import CrackDivider from '$lib/components/CrackDivider.svelte';

	const commands = [
		{ name: 'kelpie init', text: 'Create a local .kelpie/config.json scaffold with a generated device id.' },
		{ name: 'kelpie dev', text: 'Open the Ink dashboard: live status, mutation log, conflicts, and queue depth.' },
		{ name: 'kelpie status', text: 'Print the resolved config, queue depth, and last cursor as JSON.' },
		{ name: 'kelpie inspect', text: 'List materialized local tables, or one with --table <name>.' },
		{ name: 'kelpie queue', text: 'Show pending mutations waiting to be pushed.' },
		{ name: 'kelpie conflicts', text: 'Explain the active resolution guidance for the project.' },
		{ name: 'kelpie logs', text: 'Show recent local mutations, bounded by --limit <n>.' },
		{ name: 'kelpie doctor', text: 'Run integrity and local setup checks and report anything missing.' },
		{ name: 'kelpie migrate', text: 'Print the Postgres schema migration guidance for self-hosting.' }
	];
</script>

<Seo
	title="CLI"
	description="kelpie init, dev, status, inspect, queue, conflicts, logs, doctor, and migrate — a terminal companion that reads your real local project state."
	path="/cli"
/>
<main id="main-content" class="page">
	<header class="page-head">
		<p class="eyebrow">CLI · INK DASHBOARD</p>
		<h1 class="page-title">A terminal that <em>tells the truth.</em></h1>
		<p class="page-lede">
			<code>kelpie</code> reads your project's <code>.kelpie/config.json</code> and local store. If a project is not
			configured, commands say so and point you at <code>kelpie init</code> — they never invent a status.
		</p>
	</header>

	<div class="cli-mock" role="img" aria-label="Example kelpie dev session">
		<div class="cli-mock-head"><span></span><span></span><span></span></div>
		<pre><span class="dim">$</span> <span class="cmd">kelpie dev</span>
<span class="dim">kelpie · device-A / schema v1 / memory store</span>
<span class="ok">● online</span>  queue 0  conflicts 0  cursor 42
<span class="dim">────────────────────────────────────────────────</span>
<span class="dim">14:02:11</span>  local   insert  notes/n_01H8Z
<span class="dim">14:02:12</span>  remote  update  notes/n_01H9A
<span class="warn">14:02:19</span>  conflict  notes/n_01H9A  resolved via last-write-wins
<span class="dim">press c/o/t/l · ctrl-p for palette · q to quit</span></pre>
	</div>

	<CrackDivider />

	<section class="page-section">
		<h2>Commands</h2>
		<table class="pricing-table">
			<thead><tr><th>COMMAND</th><th>WHAT IT DOES</th></tr></thead>
			<tbody>
				{#each commands as command}
					<tr><td><code>{command.name}</code></td><td>{command.text}</td></tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="prose" style="margin-top:56px">
		<h2>The dashboard</h2>
		<p>
			<code>kelpie dev</code> opens an Ink interface with a live status line, a scrolling mutation log, a conflicts
			panel, and a queue-depth readout. Rendering sits behind a <code>CliRenderer</code> interface, so the plain
			renderer used by scripted commands and the interactive dashboard share one source of truth.
		</p>
		<p>
			Keyboard: <code>c</code> for conflicts, <code>o</code> for the queue, <code>t</code> for the log,
			<code>l</code> to tail, <code>Ctrl-P</code> for the command palette, and <code>q</code> to quit.
		</p>
	</section>
</main>
