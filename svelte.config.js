import adapter from '@sveltejs/adapter-auto';
import { mdsvex } from 'mdsvex';
import rehypePrettyCode from 'rehype-pretty-code';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * @typedef {object} HeadingNode
 * @property {string} type
 * @property {string} [value]
 * @property {string} [tagName]
 * @property {Record<string, unknown>} [properties]
 * @property {HeadingNode[]} [children]
 */

function headingAnchors() {
	/** @param {HeadingNode} tree */
	return (tree) => {
		const used = new Map();
		/** @param {HeadingNode} node */
		const visit = (node) => {
			if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
				const text = (node.children ?? [])
					.map((child) => child.value ?? '')
					.join('')
					.trim();
				const base = text
					.toLowerCase()
					.replace(/[^\w\s-]/g, '')
					.replace(/\s+/g, '-')
					.replace(/-+/g, '-') || 'section';
				const count = used.get(base) ?? 0;
				used.set(base, count + 1);
				const id = count ? `${base}-${count + 1}` : base;
				node.properties = { ...node.properties, id };
				node.children = [
					{
						type: 'element',
						tagName: 'a',
						properties: { href: `#${id}`, className: ['heading-anchor'], ariaLabel: `Link to ${text}` },
						children: node.children
					}
				];
			}
			for (const child of node.children ?? []) visit(child);
		};
		visit(tree);
	};
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md', '.svx'],
			rehypePlugins: [
				headingAnchors,
				[
					rehypePrettyCode,
					{
						theme: { light: 'github-light', dark: 'github-dark-dimmed' },
						keepBackground: false,
						defaultLang: 'text',
						bypassInlineCode: true
					}
				]
			]
		})
	],
	kit: {
		adapter: adapter(),
		alias: {
			$content: 'src/content',
			'$components': 'src/lib/components',
			'$tokens': 'src/lib/styles'
		},
		prerender: {
			handleHttpError: 'fail',
			handleMissingId: 'fail',
			crawl: true
		},
		typescript: {
			config(cfg) {
				cfg.exclude = [...(cfg.exclude ?? []), '../build/**'];
				return cfg;
			}
		}
	}
};

export default config;