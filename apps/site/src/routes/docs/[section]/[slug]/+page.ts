import { error } from '@sveltejs/kit';
import { getContentPage, getSectionPages } from '$lib/content';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	(['library', 'cli'] as const).flatMap((section) =>
		getSectionPages(section).map((item) => ({ section, slug: item.slug }))
	);

export const load: PageLoad = ({ params }) => {
	if (params.section !== 'library' && params.section !== 'cli') error(404, 'Page not found');
	const item = getContentPage(params.section, params.slug);
	if (!item) error(404, 'Page not found');
	return {
		item: {
			section: item.section,
			slug: item.slug,
			metadata: item.metadata
		}
	};
};
