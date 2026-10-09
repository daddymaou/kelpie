import { contentPages } from '$lib/content';
import { siteUrl } from '$lib/site';
import type { RequestHandler } from './$types';

export const prerender = true;

const productPaths = [
	'/',
	'/docs',
	'/blog',
	'/playground',
	'/cli',
	'/pricing',
	'/examples',
	'/benchmarks',
	'/changelog',
	'/support',
	'/about',
	'/legal/privacy',
	'/legal/terms'
];

export const GET: RequestHandler = () => {
	const paths = [
		...productPaths,
		...contentPages.map((item) =>
			item.section === 'blog' ? `/blog/${item.slug}` : `/docs/${item.section}/${item.slug}`
		)
	];
	const body = paths
		.map((path) => `<url><loc>${siteUrl}${path}</loc></url>`)
		.join('');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
		{ headers: { 'content-type': 'application/xml; charset=utf-8' } }
	);
};