<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>
<kbd class="kbd">{@render children()}</kbd>
