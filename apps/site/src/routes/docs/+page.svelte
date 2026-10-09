<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { getSectionPages } from '$lib/content';

	const library = getSectionPages('library');
	const cli = getSectionPages('cli');
	const groups = ['GETTING STARTED', 'FEATURES', 'CUSTOMIZE', 'REFERENCE', 'GUIDES', 'HELP'].map((name) => ({
		name,
		pages: library.filter((page) => page.metadata.group === name)
	}));
	const linkFor = (section: string, slug: string) => `/docs/${section}/${slug}`;
</script>

<Seo
	title="Documentation"
	description="Everything you need to run Kelpie: setup, sync model, conflict resolution, TLS/JWT auth, and the CLI."
	path="/docs"
/>
<main id="main-content" class="page">
	<header class="page-head">
		<p class="eyebrow">DOCUMENTATION</p>
		<h1 class="page-title">Read it end to end.</h1>
		<p class="page-lede">
			The library sections cover the engine, storage, transport, and conflict rules. The CLI reference covers
			inspecting, validating, and migrating a project from the terminal.
		</p>
	</header>

	<section class="page-section" style="margin-top:34px">
		<div class="page-grid">
			<div class="page-card">
				<h3>Start here</h3>
				<p>Install the core package, define a store, and make your first local write.</p>
				<a class="text-link" href="/docs/library/quick-start">Quick start →</a>
			</div>
			<div class="page-card">
				<h3>Understand the model</h3>
				<p>Why the clock, queue, and resolver are separate, and what that buys you.</p>
				<a class="text-link" href="/docs/library/what-is-kelpie">What is Kelpie? →</a>
			</div>
			<div class="page-card">
				<h3>Self-host the server</h3>
				<p>Postgres, Drizzle, JWKS, and the push/pull endpoints that back your clients.</p>
				<a class="text-link" href="/docs/library/configuration">Configuration →</a>
			</div>
		</div>
	</section>

	{#each groups as group}
		{#if group.pages.length}
			<section class="page-section">
				<h2>{group.name}</h2>
				<div class="page-grid">
					{#each group.pages as page}
						<a class="page-card" href={linkFor(page.section, page.slug)}>
							<h3>{page.metadata.title}</h3>
							<p>{page.metadata.description}</p>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	{/each}

	{#if cli.length}
		<section class="page-section">
			<h2>CLI</h2>
			<div class="page-grid">
				{#each cli as page}
					<a class="page-card" href={linkFor(page.section, page.slug)}>
						<h3>{page.metadata.title}</h3>
						<p>{page.metadata.description}</p>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</main>
