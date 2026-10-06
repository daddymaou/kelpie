<script lang="ts">
	import { onMount } from 'svelte';

	let theme = $state<'dark' | 'light'>('dark');

	onMount(() => {
		let saved: string | null = null;
		try {
			saved = localStorage.getItem('kelpie-theme');
		} catch (error) {
			console.warn('Could not read the saved Kelpie theme.', error);
		}
		theme = saved === 'light' || saved === 'dark'
			? saved
			: matchMedia('(prefers-color-scheme: light)').matches
				? 'light'
				: 'dark';
		document.documentElement.dataset.theme = theme;
	});

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('kelpie-theme', theme);
		} catch (error) {
			console.warn('Could not save the selected Kelpie theme.', error);
		}
	}
</script>

<button class="theme-toggle" type="button" onclick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
	<span aria-hidden="true">{theme === 'dark' ? '◐' : '◑'}</span>
</button>
