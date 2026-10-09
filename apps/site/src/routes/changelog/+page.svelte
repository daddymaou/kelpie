<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';

	const entries = [
		{
			date: 'UNRELEASED',
			title: 'In progress',
			items: [
				'Product site with a playground driven by @kelpie/sim.',
				'Server hardening: cursor paging, idempotency, and protocol-compatible errors.',
				'CLI dashboard and honest empty states across the docs.'
			]
		},
		{
			date: '0.1.0',
			title: 'First tagged build',
			items: [
				'@kelpie/core: HLC, IndexedDB and memory stores, HTTP transport, and resolvers.',
				'@kelpie/protocol: versioned mutation and push/pull schemas.',
				'@kelpie/server: Hono endpoints, JWT/JWKS auth, and Postgres persistence.',
				'@kelpie/sim: deterministic two-device network for tests and demos.',
				'React and Svelte adapters; Vue reserved as a documented stub.'
			]
		}
	];
</script>

<Seo
	title="Changelog"
	description="What changed in Kelpie, release by release. Unreleased work is listed as such and never presented as shipped."
	path="/changelog"
/>
<main id="main-content" class="page page-narrow">
	<header class="page-head">
		<p class="eyebrow">CHANGELOG</p>
		<h1 class="page-title">What changed, <em>and when.</em></h1>
		<p class="page-lede">
			Entries are grouped by release. Anything without a tag is listed under Unreleased and is not claimed as
			available.
		</p>
	</header>

	<div class="timeline">
		{#each entries as entry}
			<div class="timeline-entry">
				<p class="timeline-date">{entry.date}</p>
				<h3>{entry.title}</h3>
				<ul>
					{#each entry.items as item}<li>{item}</li>{/each}
				</ul>
			</div>
		{/each}
	</div>
</main>
