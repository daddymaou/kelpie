<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>
<span class="badge">{@render children()}</span>
