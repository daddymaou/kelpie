<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let { children }: { children: Snippet } = $props();
	let drawerOpen = $state(false);
	let drawerButton: HTMLButtonElement;
	let docsSidebar: HTMLElement;
	const section = $derived(page.params.section === 'cli' ? 'cli' : 'library');

	function closeDrawer() {
		drawerOpen = false;
		drawerButton?.focus();
	}

	function toggleDrawer() {
		drawerOpen = !drawerOpen;
		if (drawerOpen) requestAnimationFrame(() => docsSidebar?.querySelector<HTMLElement>('a')?.focus());
		else drawerButton?.focus();
	}

	onMount(() => {
		const handleKeys = (event: KeyboardEvent) => {
			if (!drawerOpen) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				closeDrawer();
				return;
			}
			if (event.key !== 'Tab') return;
			const focusable = docsSidebar.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
			const first = focusable.item(0);
			const last = focusable.item(focusable.length - 1);
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		window.addEventListener('keydown', handleKeys);
		return () => window.removeEventListener('keydown', handleKeys);
	});
</script>

<div class="docs-shell">
	<div class="docs-tabs" aria-label="Documentation sections">
		<a class:tab-active={section === 'library'} href="/docs/library/what-is-kelpie">Library</a>
		<a class:tab-active={section === 'cli'} href="/docs/cli/cli-reference">CLI</a>
	</div>
	<div class="docs-layout">
		<button bind:this={drawerButton} class="drawer-trigger" type="button" aria-expanded={drawerOpen} aria-controls="docs-sidebar" onclick={toggleDrawer}>
			Contents
		</button>
		<aside
			bind:this={docsSidebar}
			id="docs-sidebar"
			class:drawer-open={drawerOpen}
			class="docs-sidebar"
			role={drawerOpen ? 'dialog' : undefined}
			aria-modal={drawerOpen ? 'true' : undefined}
			aria-label="Documentation menu"
		>
			<Sidebar section={section} activePath={page.url.pathname} closeDrawer={closeDrawer} />
		</aside>
		<button
			class="drawer-backdrop"
			class:backdrop-visible={drawerOpen}
			type="button"
			aria-label="Close documentation menu"
			onclick={closeDrawer}
		></button>
		{@render children()}
	</div>
</div>
