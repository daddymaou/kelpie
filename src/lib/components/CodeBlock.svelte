<script lang="ts">
	let {
		language = 'text',
		title,
		children
	}: {
		language?: string;
		title?: string;
		children: import('svelte').Snippet;
	} = $props();
	let copied = $state(false);

	async function copyCode(event: MouseEvent) {
		const code = (event.currentTarget as HTMLButtonElement).closest('.code-block')?.querySelector('code')?.textContent;
		if (!code) return;
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			window.setTimeout(() => (copied = false), 1200);
		} catch (error) {
			console.error('Could not copy code block.', error);
		}
	}
</script>

<div class="code-block">
	<div class="code-block-head"><span>{title ?? language}</span><button type="button" onclick={copyCode}>{copied ? 'Copied' : 'Copy'}</button></div>
	<pre><code>{@render children()}</code></pre>
</div>
