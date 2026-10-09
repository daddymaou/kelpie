<script lang="ts">
	import { onMount } from 'svelte';
	import SearchPalette from './SearchPalette.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import { primaryNav, mobileNav } from '$lib/nav';

	let openMenu = $state<string | null>(null);
	let mobileOpen = $state(false);
	let openMobileGroup = $state<string | null>('Product');
	let navEl: HTMLElement;

	function toggleMenu(label: string) {
		openMenu = openMenu === label ? null : label;
	}

	function closeAll() {
		openMenu = null;
	}

	function toggleMobile() {
		mobileOpen = !mobileOpen;
	}

	function closeMobile() {
		mobileOpen = false;
	}

	onMount(() => {
		const onPointer = (event: PointerEvent) => {
			if (openMenu && navEl && !navEl.contains(event.target as Node)) closeAll();
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeAll();
				closeMobile();
			}
		};
		window.addEventListener('pointerdown', onPointer);
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('pointerdown', onPointer);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<header class="topbar">
	<a class="wordmark" href="/" aria-label="Kelpie home" onclick={closeAll}>
		<span class="brand-mark" aria-hidden="true">K</span>
		<span>kelpie</span>
	</a>

	<nav class="nav" bind:this={navEl} aria-label="Main navigation">
		{#each primaryNav as group (group.label)}
			{#if group.direct}
				<a class="nav-link" href={group.href} onclick={closeAll}>{group.label}</a>
			{:else}
				<div class="nav-item" data-open={openMenu === group.label}>
					<button
						class="nav-trigger"
						type="button"
						aria-haspopup="true"
						aria-expanded={openMenu === group.label}
						onclick={() => toggleMenu(group.label)}
					>
						{group.label}<span class="nav-caret" aria-hidden="true">▾</span>
					</button>
					<div class="nav-menu" class:nav-menu-wide={group.wide}>
						{#each group.columns ?? [] as column}
							<span class="menu-head">{column.heading}</span>
							{#each column.links as link}
								<a href={link.href} onclick={closeAll}>
									<strong>{link.label}</strong>
									{#if link.description}<span>{link.description}</span>{/if}
								</a>
							{/each}
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</nav>

	<div class="spacer"></div>

	<div class="top-search"><SearchPalette /></div>

	<div class="top-actions">
		<ThemeToggle />
		<button
			class="nav-toggle"
			type="button"
			aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={mobileOpen}
			onclick={toggleMobile}
		>
			<span aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span>
		</button>
	</div>
</header>

<nav class="mobile-nav" class:open={mobileOpen} aria-label="Mobile navigation" aria-hidden={!mobileOpen}>
	{#each mobileNav as group (group.label)}
		{#if group.direct}
			<a class="mobile-direct" href={group.href} onclick={closeMobile}>{group.label}</a>
		{:else}
			<div class="mobile-group">
				<button
					type="button"
					aria-expanded={openMobileGroup === group.label}
					onclick={() => (openMobileGroup = openMobileGroup === group.label ? null : group.label)}
				>
					{group.label}<span aria-hidden="true">{openMobileGroup === group.label ? '−' : '+'}</span>
				</button>
				<div class="mobile-group-panel" class:open={openMobileGroup === group.label}>
					<div>
						{#each group.columns ?? [] as column}
							{#each column.links as link}
								<a href={link.href} onclick={closeMobile}>{link.label}</a>
							{/each}
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/each}
</nav>
