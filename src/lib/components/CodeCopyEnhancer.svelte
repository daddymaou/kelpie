<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		const cleanups: (() => void)[] = [];
		for (const pre of document.querySelectorAll<HTMLElement>('.doc-body pre')) {
			if (pre.querySelector('.code-copy')) continue;
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'code-copy';
			button.textContent = 'Copy';
			button.setAttribute('aria-label', 'Copy code block');
			const handleCopy = async () => {
				try {
					await navigator.clipboard.writeText(pre.querySelector('code')?.textContent ?? '');
					button.textContent = 'Copied';
					window.setTimeout(() => (button.textContent = 'Copy'), 1200);
				} catch (error) {
					console.error('Could not copy code block.', error);
					button.textContent = 'Copy failed';
					window.setTimeout(() => (button.textContent = 'Copy'), 1600);
				}
			};
			button.addEventListener('click', handleCopy);
			pre.append(button);
			cleanups.push(() => {
				button.removeEventListener('click', handleCopy);
				button.remove();
			});
		}
		return () => cleanups.forEach((cleanup) => cleanup());
	});
</script>
