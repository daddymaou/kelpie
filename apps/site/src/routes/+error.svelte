<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import ArtImage from '$lib/components/ArtImage.svelte';
	import { art } from '$lib/art';
</script>

<Seo title="Page not found" description="That page is not on this map." path={page.url.pathname} robots="noindex,nofollow" />
<main id="main-content" class="not-found">
	<ArtImage src={art.empty.src} alt={art.empty.alt} focalPoint={art.empty.focalPoint} tone={art.empty.tone} class="empty-art" decorative />
	<p class="eyebrow">404 / OUT OF RANGE</p>
	<h1>Nothing here.<br /><em>It cracked.</em></h1>
	<p>The page may have moved, or the trail may have ended.</p>
	<a class="button-primary" href="/">Back to solid ground <span aria-hidden="true">↗</span></a>
</main>
