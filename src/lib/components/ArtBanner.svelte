<script lang="ts">
	import type { ArtSlot } from '$lib/art';
	import ArtImage from './ArtImage.svelte';

	let { slot }: { slot: ArtSlot } = $props();
</script>

<ArtImage
	src={slot.src}
	alt={slot.alt}
	focalPoint={slot.focalPoint}
	tone={slot.tone}
	class="doc-banner"
	decorative
/>
