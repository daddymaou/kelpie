<script lang="ts">
	import SearchPalette from './SearchPalette.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="topbar">
	<a class="wordmark" href="/" aria-label="Kelpie home"><span class="brand-mark" aria-hidden="true">K</span><span>kelpie</span></a>
	<div class="top-search"><SearchPalette /></div>
	<nav class="top-links" aria-label="Main navigation">
		<a href="/docs/library/what-is-kelpie">DOCS</a>
		<a href="/blog">BLOG</a>
	</nav>
	<ThemeToggle />
</header>
