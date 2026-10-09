<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';

	const channels = [
		{
			title: 'Bug reports & feature requests',
			body: 'Open an issue on the GitHub tracker. Include the Kelpie version, your runtime, and the smallest reproduction you can manage.',
			action: 'Open an issue'
		},
		{
			title: 'Questions about running Kelpie',
			body: 'Start with the field notes and the FAQ. If the answer is not there, a well-scoped question on the tracker is the right place.',
			action: 'Read the docs'
		},
		{
			title: 'Security',
			body: 'Kelpie keeps authorization in your application and your server. Report anything that crosses a trust boundary privately before opening a public issue.',
			action: 'Report privately'
		}
	];
</script>

<Seo
	title="Support"
	description="How to get help with Kelpie, report a bug, or flag a security concern."
	path="/support"
/>
<main id="main-content" class="page">
	<header class="page-head">
		<p class="eyebrow">SUPPORT</p>
		<h1 class="page-title">Help, without a <em>queue.</em></h1>
		<p class="page-lede">
			Kelpie is maintained in the open. There is no paid support tier and no sales call — just issues, docs, and
			the people using it.
		</p>
	</header>

	<section class="page-grid">
		{#each channels as channel}
			<div class="page-card">
				<h3>{channel.title}</h3>
				<p>{channel.body}</p>
				<span class="text-link">{channel.action} →</span>
			</div>
		{/each}
	</section>

	<section class="prose" style="margin-top:56px">
		<h2>Before you file</h2>
		<ul>
			<li>Run <code>kelpie doctor</code> and include the output — it checks store, config, and schema.</li>
			<li>Note whether the transport is HTTP or the deterministic simulator.</li>
			<li>If the issue is a conflict, include the two mutations and the resolver you configured.</li>
		</ul>
	</section>
</main>
