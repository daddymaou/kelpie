import { error } from '@sveltejs/kit';
import { getContentPage, getSectionPages } from '$lib/content';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => getSectionPages('blog').map((item) => ({ slug: item.slug }));

export const load: PageLoad = ({ params }) => {
	const item = getContentPage('blog', params.slug);
	if (!item) error(404, 'Article not found');
	return {
		item: {
			section: item.section,
			slug: item.slug,
			metadata: item.metadata
		}
	};
};
