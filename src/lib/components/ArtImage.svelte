<script lang="ts">
	let {
		src,
		alt,
		focalPoint = '50% 50%',
		tone = 'blue',
		class: className = '',
		decorative = false
	}: {
		src: string;
		alt: string;
		focalPoint?: string;
		tone?: 'blue' | 'mono';
		class?: string;
		decorative?: boolean;
	} = $props();

	let available = $state(true);
</script>

<div class={`art-frame art-${tone} ${className}`} aria-hidden={decorative}>
	{#if available}
		<img
			{src}
			alt={decorative ? '' : alt}
			style={`object-position:${focalPoint}`}
			onerror={() => (available = false)}
		/>
	{:else}
		<div class="art-fallback" aria-hidden="true"></div>
	{/if}
	<span class="art-grain" aria-hidden="true"></span>
</div>
