<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ArtImage from '$lib/components/ArtImage.svelte';
	import { getSectionPages } from '$lib/content';
	import { art } from '$lib/art';

	const posts = getSectionPages('blog');
</script>

<Seo title="Field notes" description="Short notes on local-first software, reliable sync, and the shape of offline work." path="/blog" />
<main id="main-content" class="blog-index">
	<header class="blog-heading">
		<p class="eyebrow">NOTES FROM THE EDGE OF THE NETWORK</p>
		<h1>Field notes.</h1>
		<p>Ideas for software that keeps its footing when the signal gets thin.</p>
	</header>
	<div class="blog-grid" data-pagefind-body>
		{#each posts as post}
			<a class="blog-card" href={`/blog/${post.slug}`}>
				<ArtImage src={art.card.src} alt={art.card.alt} focalPoint={art.card.focalPoint} tone={art.card.tone} class="blog-card-art" decorative />
				<div class="blog-card-copy">
					<p class="blog-date">{post.metadata.date ? new Date(post.metadata.date).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'FIELD NOTE'}</p>
					<h2>{post.metadata.title}</h2>
					<p>{post.metadata.description}</p>
					<span class="text-link">Read the note <span aria-hidden="true">↗</span></span>
				</div>
			</a>
		{/each}
	</div>
</main>
