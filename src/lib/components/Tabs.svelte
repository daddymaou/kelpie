<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>
<div class="content-tabs">{@render children()}</div>
