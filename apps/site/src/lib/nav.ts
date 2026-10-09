export interface NavLink {
	label: string;
	href: string;
	description?: string;
}

export interface NavGroup {
	label: string;
	href?: string;
	direct?: boolean;
	wide?: boolean;
	columns?: { heading: string; links: NavLink[] }[];
}

export const primaryNav: NavGroup[] = [
	{
		label: 'Product',
		columns: [
			{
				heading: 'Engine',
				links: [
					{ label: 'Overview', href: '/', description: 'What Kelpie is and why it exists.' },
					{ label: 'Playground', href: '/playground', description: 'Two devices syncing in the browser.' },
					{ label: 'Benchmarks', href: '/benchmarks', description: 'Measured numbers, or an honest blank.' }
				]
			},
			{
				heading: 'Tools',
				links: [
					{ label: 'CLI', href: '/cli', description: 'Inspect, migrate, and watch a project.' },
					{ label: 'Examples', href: '/examples', description: 'Runnable React and Svelte apps.' },
					{ label: 'Changelog', href: '/changelog', description: 'What changed, and when.' }
				]
			}
		]
	},
	{
		label: 'Docs',
		wide: true,
		columns: [
			{
				heading: 'Getting started',
				links: [
					{ label: 'What is Kelpie?', href: '/docs/library/what-is-kelpie', description: 'The mental model in five minutes.' },
					{ label: 'Install', href: '/docs/library/install', description: 'Add the core package and a store.' },
					{ label: 'Quick start', href: '/docs/library/quick-start', description: 'Write locally, then sync.' }
				]
			},
			{
				heading: 'Core concepts',
				links: [
					{ label: 'Conflict resolution', href: '/docs/library/conflict-resolution', description: 'Per-collection merge rules.' },
					{ label: 'Offline queue', href: '/docs/library/offline-queue', description: 'Durable pending writes.' },
					{ label: 'Schema & migrations', href: '/docs/library/schema-migrations', description: 'Evolve local data safely.' },
					{ label: 'CLI reference', href: '/docs/cli/cli-reference', description: 'Every command and flag.' }
				]
			}
		]
	},
	{
		label: 'Resources',
		columns: [
			{
				heading: 'Project',
				links: [
					{ label: 'Field notes', href: '/blog', description: 'Notes on local-first engineering.' },
					{ label: 'Support', href: '/support', description: 'How to get help, and how to give it.' },
					{ label: 'About', href: '/about', description: 'Who builds Kelpie and how.' }
				]
			}
		]
	},
	{ label: 'Pricing', href: '/pricing', direct: true }
];

export const mobileNav: NavGroup[] = [
	{
		label: 'Product',
		columns: [
			{
				heading: 'Product',
				links: [
					{ label: 'Overview', href: '/' },
					{ label: 'Playground', href: '/playground' },
					{ label: 'CLI', href: '/cli' },
					{ label: 'Examples', href: '/examples' },
					{ label: 'Benchmarks', href: '/benchmarks' },
					{ label: 'Changelog', href: '/changelog' }
				]
			}
		]
	},
	{
		label: 'Docs',
		columns: [
			{
				heading: 'Docs',
				links: [
					{ label: 'What is Kelpie?', href: '/docs/library/what-is-kelpie' },
					{ label: 'Install', href: '/docs/library/install' },
					{ label: 'Quick start', href: '/docs/library/quick-start' },
					{ label: 'Conflict resolution', href: '/docs/library/conflict-resolution' },
					{ label: 'Offline queue', href: '/docs/library/offline-queue' },
					{ label: 'CLI reference', href: '/docs/cli/cli-reference' }
				]
			}
		]
	},
	{
		label: 'Resources',
		columns: [
			{
				heading: 'Resources',
				links: [
					{ label: 'Field notes', href: '/blog' },
					{ label: 'Support', href: '/support' },
					{ label: 'About', href: '/about' }
				]
			}
		]
	},
	{ label: 'Pricing', href: '/pricing', direct: true }
];
