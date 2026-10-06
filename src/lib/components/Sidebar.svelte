<script lang="ts">
	import { getSectionPages, type ContentPage } from '$lib/content';

	let { section, activePath, closeDrawer = () => {} }: {
		section: 'library' | 'cli';
		activePath: string;
		closeDrawer?: () => void;
	} = $props();
	let openGroups = $state<string[]>(['GETTING STARTED', 'FEATURES']);

	const pages = $derived(getSectionPages(section));
	const groups = $derived(
		section === 'cli'
			? [{ name: 'CLI REFERENCE', pages }]
			: ['GETTING STARTED', 'FEATURES', 'CUSTOMIZE', 'REFERENCE', 'GUIDES', 'HELP'].map((name) => ({
					name,
					pages: pages.filter((page) => page.metadata.group === name)
				}))
	);

	function toggleGroup(name: string) {
		openGroups = openGroups.includes(name)
			? openGroups.filter((group) => group !== name)
			: [...openGroups, name];
	}

	function linkFor(page: ContentPage) {
		return `/docs/${page.section}/${page.slug}`;
	}
</script>

<nav class="sidebar-tree" aria-label={`${section} documentation`}>
	{#each groups as group}
		{#if group.pages.length}
			<div class="sidebar-group">
				<button
					class="group-heading"
					type="button"
					aria-expanded={openGroups.includes(group.name)}
					onclick={() => toggleGroup(group.name)}
				>
					<span>{group.name}</span><span class="chevron" aria-hidden="true">{openGroups.includes(group.name) ? '−' : '+'}</span>
				</button>
				<div
					class:group-collapsed={!openGroups.includes(group.name)}
					class="group-links"
					inert={!openGroups.includes(group.name)}
				>
					<div class="group-links-inner">
						{#each group.pages as page}
							<a
								href={linkFor(page)}
								class:active={activePath === linkFor(page)}
								aria-current={activePath === linkFor(page) ? 'page' : undefined}
								onclick={closeDrawer}
							>{page.metadata.title}</a>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/each}
</nav>
