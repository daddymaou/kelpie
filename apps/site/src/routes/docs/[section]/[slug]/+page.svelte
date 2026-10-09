<script lang="ts">
	import { page } from '$app/state';
	import { getContentPage, getSectionPages } from '$lib/content';
	import { art } from '$lib/art';
	import Seo from '$lib/components/Seo.svelte';
	import ArtBanner from '$lib/components/ArtBanner.svelte';
	import CrackDivider from '$lib/components/CrackDivider.svelte';
	import OnThisPage from '$lib/components/OnThisPage.svelte';
	import CodeCopyEnhancer from '$lib/components/CodeCopyEnhancer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const item = $derived.by(() => {
		const content = getContentPage(data.item.section, data.item.slug);
		if (!content) throw new Error(`Content page is missing: ${data.item.section}/${data.item.slug}`);
		return content;
	});
	const allPages = $derived(getSectionPages(item.section));
	const pageIndex = $derived(allPages.findIndex((candidate) => candidate.slug === item.slug));
	const previous = $derived(allPages[pageIndex - 1]);
	const next = $derived(allPages[pageIndex + 1]);
	const banner = $derived(item.metadata.banner ? art[item.metadata.banner] : undefined);
	let copied = $state(false);
	let copyFailed = $state(false);

	async function copyMarkdown() {
		try {
			const response = await fetch(`${page.url.pathname}.md`);
			if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
			await navigator.clipboard.writeText(await response.text());
			copied = true;
			copyFailed = false;
			window.setTimeout(() => (copied = false), 1500);
		} catch (error) {
			console.error('Could not copy page Markdown.', error);
			copyFailed = true;
			window.setTimeout(() => (copyFailed = false), 1800);
		}
	}
</script>

<Seo
	title={item.metadata.title}
	description={item.metadata.description}
	path={page.url.pathname}
	ogImage={item.metadata.ogImage}
	type="article"
	article
/>
<main class="doc-main" id="main-content">
	<article class="doc-article" data-pagefind-body>
		{#if banner}<ArtBanner slot={banner} />{/if}
		<div class="doc-title-row">
			<div><p class="doc-kicker">{item.section === 'cli' ? 'CLI REFERENCE' : 'KELPIE DOCUMENTATION'}</p><h1>{item.metadata.title}</h1></div>
			<button class="copy-page" type="button" onclick={copyMarkdown} aria-live="polite">{copied ? 'Copied' : copyFailed ? 'Copy failed' : 'Copy page'}<span aria-hidden="true">{copied ? '✓' : '↗'}</span></button>
		</div>
		<p class="doc-subtitle">{item.metadata.description}</p>
		<div class="doc-body"><svelte:component this={item.component} /><CodeCopyEnhancer /></div>
		<CrackDivider />
		<nav class="page-neighbors" aria-label="Adjacent pages">
			{#if previous}<a href={`/docs/${previous.section}/${previous.slug}`}><span>← PREVIOUS</span><strong>{previous.metadata.title}</strong></a>{:else}<span></span>{/if}
			{#if next}<a class="neighbor-next" href={`/docs/${next.section}/${next.slug}`}><span>NEXT →</span><strong>{next.metadata.title}</strong></a>{/if}
		</nav>
	</article>
	<aside class="doc-rail"><OnThisPage /></aside>
</main>
