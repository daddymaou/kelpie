<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>
<div class="steps">{@render children()}</div>
