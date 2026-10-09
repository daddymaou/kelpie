<script lang="ts">
	import { onMount } from 'svelte';
	import { contentPages } from '$lib/content';
	import ArtImage from './ArtImage.svelte';
	import { art } from '$lib/art';

	let query = $state('');
	let active = $state(0);
	let open = $state(false);
	let input: HTMLInputElement;
	let dialog: HTMLDialogElement;
	let recent = $state<string[]>([]);
	let pagefindReady = $state(false);
	let pagefindResults = $state<typeof contentPages>([]);
	let isSearching = $state(false);

	const results = $derived.by(() => {
		const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
		return contentPages
			.map((item) => {
				const title = item.metadata.title.toLowerCase();
				const description = item.metadata.description.toLowerCase();
				const score = words.reduce(
					(total, word) => total + (title.includes(word) ? 4 : 0) + (description.includes(word) ? 1 : 0),
					0
				);
				return { ...item, score };
			})
			.filter((item) => !words.length || item.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, 10);
	});
	const visibleResults = $derived(pagefindReady ? pagefindResults : results);

	onMount(() => {
		try {
			const stored: unknown = JSON.parse(localStorage.getItem('kelpie-recent-searches') ?? '[]');
			recent = Array.isArray(stored) && stored.every((item): item is string => typeof item === 'string')
				? stored.slice(0, 5)
				: [];
		} catch (error) {
			console.warn('Could not restore recent searches.', error);
			recent = [];
		}
		const keyboard = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				show();
			}
		};
		let cancelled = false;
		const loadPagefind = async () => {
			try {
				const modulePath = '/pagefind/pagefind.js';
				const module = await import(/* @vite-ignore */ modulePath) as {
					search: NonNullable<Window['pagefind']>['search'];
				};
				if (!cancelled) {
					window.pagefind = { search: module.search };
					pagefindReady = true;
				}
			} catch {
				console.info('Pagefind index is not available yet; using local search.');
			}
		};
		void loadPagefind();
		window.addEventListener('keydown', keyboard);
		return () => {
			cancelled = true;
			window.removeEventListener('keydown', keyboard);
		};
	});

	$effect(() => {
		const searchTerm = query.trim();
		if (!searchTerm || !pagefindReady || !window.pagefind) {
			pagefindResults = [];
			isSearching = false;
			return;
		}
		let cancelled = false;
		isSearching = true;
		const timeout = window.setTimeout(async () => {
			try {
				const search = await window.pagefind?.search(searchTerm);
				if (!search) {
					if (!cancelled) isSearching = false;
					return;
				}
				const entries = await Promise.all(search.results.slice(0, 10).map((result) => result.data()));
				if (cancelled) return;
				pagefindResults = entries
					.map((entry) => {
						const pathname = new URL(entry.url, window.location.origin).pathname.replace(/\/$/, '');
						const item = contentPages.find((candidate) => {
							const target = candidate.section === 'blog'
								? `/blog/${candidate.slug}`
								: `/docs/${candidate.section}/${candidate.slug}`;
							return target === pathname;
						});
						return item;
					})
					.filter((item): item is (typeof contentPages)[number] => item !== undefined);
				isSearching = false;
			} catch (error) {
				if (!cancelled) isSearching = false;
				console.error('Pagefind search failed.', error);
			}
		}, 100);
		return () => {
			cancelled = true;
			window.clearTimeout(timeout);
		};
	});

	function show() {
		open = true;
		if (dialog && !dialog.open) dialog.showModal();
		requestAnimationFrame(() => input?.focus());
	}

	function close() {
		open = false;
		dialog?.close();
	}

	function navigateTo(index: number) {
		const item = visibleResults[index];
		if (!item) return;
		const next = [item.metadata.title, ...recent.filter((entry) => entry !== item.metadata.title)].slice(0, 5);
		recent = next;
		try {
			localStorage.setItem('kelpie-recent-searches', JSON.stringify(next));
		} catch (error) {
			console.warn('Could not save recent search.', error);
		}
		window.location.href = item.section === 'blog'
			? `/blog/${item.slug}`
			: `/docs/${item.section}/${item.slug}`;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			active = (active + 1) % Math.max(visibleResults.length, 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			active = (active - 1 + Math.max(visibleResults.length, 1)) % Math.max(visibleResults.length, 1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			navigateTo(active);
		} else if (event.key === 'Tab') {
			const focusable = dialog.querySelectorAll<HTMLElement>('button, input, a[href]');
			const first = focusable.item(0);
			const last = focusable.item(focusable.length - 1);
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}
</script>

<button class="search-trigger" type="button" onclick={show} aria-haspopup="dialog" aria-expanded={open}>
	<span>Search documentation</span>
	<kbd>⌘ K</kbd>
</button>

<dialog bind:this={dialog} class="search-dialog" onclose={() => (open = false)} onkeydown={handleKeydown}>
	<div class="search-box">
		<span class="search-mark" aria-hidden="true">⌕</span>
		<input bind:this={input} bind:value={query} oninput={() => (active = 0)} placeholder="Search..." aria-label="Search documentation" />
		<button class="search-close" type="button" onclick={close} aria-label="Close search">Esc</button>
	</div>
	{#if query && visibleResults.length}
		<div class="search-results" role="listbox" aria-label="Search results">
			{#each visibleResults as result, index}
				<button
					type="button"
					class:search-active={index === active}
					role="option"
					aria-selected={index === active}
					onmouseenter={() => (active = index)}
					onclick={() => navigateTo(index)}
				>
					<span class="result-kind">{result.section === 'blog' ? 'FIELD NOTES' : result.section.toUpperCase()}</span>
					<strong>{result.metadata.title}</strong>
					<span>{result.metadata.description}</span>
				</button>
			{/each}
		</div>
	{:else if query && isSearching}
		<div class="search-loading"><span class="search-tear" aria-hidden="true"></span><p>Looking through the field guide…</p></div>
	{:else if query && (!pagefindReady || pagefindResults.length === 0)}
		<div class="search-empty">
			<span class="search-tear" aria-hidden="true"></span>
			<ArtImage src={art.empty.src} alt={art.empty.alt} focalPoint={art.empty.focalPoint} tone="mono" class="search-empty-art" decorative />
			<p>No pages found. The signal ends here.</p>
		</div>
	{:else}
		<div class="search-hints">
			<p>TYPE TO SEARCH THE FIELD GUIDE</p>
			{#if recent.length}
				<p class="recent-label">RECENT</p>
				{#each recent as title}
					<span class="recent-item">{title}</span>
				{/each}
			{/if}
		</div>
	{/if}
	<footer><span>↑↓ to navigate</span><span>↵ to open</span><span>esc to close</span></footer>
</dialog>
