<script lang="ts">
	import { page } from '$app/state';
	import { getContentPage } from '$lib/content';
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import CrackDivider from '$lib/components/CrackDivider.svelte';

	let { data }: { data: PageData } = $props();
	const item = $derived.by(() => {
		const content = getContentPage(data.item.section, data.item.slug);
		if (!content) throw new Error(`Blog page is missing: ${data.item.slug}`);
		return content;
	});
</script>

<Seo title={item.metadata.title} description={item.metadata.description} path={page.url.pathname} type="article" article />
<main id="main-content" class="blog-article" data-pagefind-body>
	<a class="back-link" href="/blog">← FIELD NOTES</a>
	<p class="eyebrow">{item.metadata.date ?? 'KELPIE FIELD NOTES'}</p>
	<h1>{item.metadata.title}</h1>
	<p class="blog-deck">{item.metadata.description}</p>
	<CrackDivider />
	<article class="doc-body"><svelte:component this={item.component} /></article>
	<CrackDivider />
	<a class="text-link" href="/blog">All field notes <span aria-hidden="true">→</span></a>
</main>
