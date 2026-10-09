<script lang="ts">
	import type { Snippet } from 'svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
</script>

<a class="skip-link" href="#main-content">Skip to content</a>
<TopBar />
{@render children()}
<Footer />
