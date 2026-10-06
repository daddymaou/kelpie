<script lang="ts">
	import { onMount } from 'svelte';

	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let current = $state('');

	onMount(() => {
		headings = [...document.querySelectorAll<HTMLElement>('.doc-body h2, .doc-body h3')]
			.filter((heading) => heading.id)
			.map((heading) => ({
				id: heading.id,
				text: heading.textContent?.replace(/#$/, '').trim() ?? '',
				level: Number(heading.tagName.slice(1))
			}));
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting).sort(
					(a, b) => a.boundingClientRect.top - b.boundingClientRect.top
				);
				if (visible[0]) current = visible[0].target.id;
			},
			{ rootMargin: '-15% 0px -72% 0px' }
		);
		for (const heading of headings) {
			const element = document.getElementById(heading.id);
			if (element) observer.observe(element);
		}
		return () => observer.disconnect();
	});
</script>

<nav class="on-this-page" aria-label="On this page">
	<p>ON THIS PAGE</p>
	{#each headings as heading}
		<a href={`#${heading.id}`} class:subheading={heading.level === 3} class:toc-active={current === heading.id}>{heading.text}</a>
	{/each}
</nav>
