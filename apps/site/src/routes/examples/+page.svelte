<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';

	const examples = [
		{
			title: 'React todo',
			path: 'examples/react-todo',
			body: 'A todo list built on @kelpie/react. Optimistic local writes, a live queue badge, and a manual sync button wired to the engine.',
			tags: ['React 19', '@kelpie/react', 'IndexedDB']
		},
		{
			title: 'Svelte notes',
			path: 'examples/svelte-notes',
			body: 'A notes app built on @kelpie/svelte. Stores for the engine, a reactive query, and a mutation helper with status feedback.',
			tags: ['Svelte 5', '@kelpie/svelte', 'Stores']
		}
	];
</script>

<Seo
	title="Examples"
	description="Runnable React and Svelte apps that use Kelpie for local-first sync."
	path="/examples"
/>
<main id="main-content" class="page">
	<header class="page-head">
		<p class="eyebrow">EXAMPLES</p>
		<h1 class="page-title">Read the code that <em>runs.</em></h1>
		<p class="page-lede">
			Both examples ship in this repository with a dev server and a test. They use the real adapters against a
			memory or IndexedDB store; there is no mock layer standing in for the engine.
		</p>
	</header>

	<section class="example-grid">
		{#each examples as example}
			<article class="example-card">
				<h3>{example.title}</h3>
				<p>{example.body}</p>
				<div class="tag-row">
					{#each example.tags as tag}<span class="tag">{tag}</span>{/each}
				</div>
				<code class="muted-note" style="margin:0">{example.path}</code>
			</article>
		{/each}
	</section>

	<section class="prose" style="margin-top:56px">
		<h2>Running them</h2>
		<pre>pnpm install
pnpm --filter @kelpie/example-react-todo dev
pnpm --filter @kelpie/example-svelte-notes dev</pre>
		<p>
			Each example points its transport at a URL you choose. Run the local server with
			<code>docker compose up</code> from <code>packages/server</code>, or leave the transport unset and explore the
			offline queue on its own.
		</p>
	</section>
</main>
