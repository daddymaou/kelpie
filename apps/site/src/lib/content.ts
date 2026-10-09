import type { Component } from 'svelte';
import { z } from 'zod';

const frontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	group: z.string().optional(),
	order: z.number().optional(),
	date: z.string().optional(),
	ogImage: z.string().optional(),
	banner: z.enum(['bannerA', 'bannerB']).optional()
});

export type PageMetadata = z.infer<typeof frontmatterSchema>;
export interface ContentPage {
	section: 'library' | 'cli' | 'blog';
	slug: string;
	metadata: PageMetadata;
	component: Component;
	source: string;
}

type MarkdownModule = {
	default: Component;
	metadata: unknown;
};

function loadPages(
	modules: Record<string, MarkdownModule>,
	sources: Record<string, string>,
	section: ContentPage['section']
) {
	return Object.entries(modules).map(([path, module]) => {
		const metadata = frontmatterSchema.parse(module.metadata);
		const slug = path.split(/[\\/]/).at(-1)?.replace(/\.md$/, '');
		if (!slug) throw new Error(`Unable to derive content slug from ${path}`);
		const source = sources[path];
		if (source === undefined) throw new Error(`Markdown source is missing for ${path}`);
		return { section, slug, metadata, component: module.default, source };
	});
}

const docSources = import.meta.glob('/src/content/docs/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;
const cliSources = import.meta.glob('/src/content/cli/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;
const blogSources = import.meta.glob('/src/content/blog/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const docs = loadPages(
	import.meta.glob('/src/content/docs/**/*.md', { eager: true }) as Record<string, MarkdownModule>,
	docSources,
	'library'
);
const cli = loadPages(
	import.meta.glob('/src/content/cli/**/*.md', { eager: true }) as Record<string, MarkdownModule>,
	cliSources,
	'cli'
);
const blog = loadPages(
	import.meta.glob('/src/content/blog/**/*.md', { eager: true }) as Record<string, MarkdownModule>,
	blogSources,
	'blog'
);

export const contentPages = [...docs, ...cli, ...blog].sort(
	(a, b) => (a.metadata.order ?? 0) - (b.metadata.order ?? 0)
);

export function getContentPage(section: string, slug: string) {
	return contentPages.find((page) => page.section === section && page.slug === slug);
}

export function getSectionPages(section: ContentPage['section']) {
	return contentPages.filter((page) => page.section === section);
}
