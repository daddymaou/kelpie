<script lang="ts">
	let { title = 'Note', kind = 'note', children }: {
		title?: string;
		kind?: 'note' | 'warning' | 'tip';
		children: import('svelte').Snippet;
	} = $props();
</script>

<aside class={`callout callout-${kind}`} aria-label={title}>
	<strong>{title}</strong>
	<div>{@render children()}</div>
</aside>
