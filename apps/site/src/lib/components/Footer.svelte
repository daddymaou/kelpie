<script lang="ts">
	import { siteName } from '$lib/site';

	const year = new Date().getFullYear();
	const columns = [
		{
			heading: 'PRODUCT',
			links: [
				{ label: 'Overview', href: '/' },
				{ label: 'Playground', href: '/playground' },
				{ label: 'CLI', href: '/cli' },
				{ label: 'Benchmarks', href: '/benchmarks' },
				{ label: 'Pricing', href: '/pricing' }
			]
		},
		{
			heading: 'LEARN',
			links: [
				{ label: 'Documentation', href: '/docs/library/what-is-kelpie' },
				{ label: 'Quick start', href: '/docs/library/quick-start' },
				{ label: 'Examples', href: '/examples' },
				{ label: 'Field notes', href: '/blog' },
				{ label: 'Changelog', href: '/changelog' }
			]
		},
		{
			heading: 'PROJECT',
			links: [
				{ label: 'About', href: '/about' },
				{ label: 'Support', href: '/support' },
				{ label: 'Privacy', href: '/legal/privacy' },
				{ label: 'Terms', href: '/legal/terms' }
			]
		}
	];
</script>

<footer class="site-footer">
	<div class="footer-inner">
		<div class="footer-brand">
			<a class="wordmark" href="/" aria-label={`${siteName} home`}>
				<span class="brand-mark" aria-hidden="true">K</span><span>kelpie</span>
			</a>
			<p>A local-first sync engine for TypeScript. Open source under Apache-2.0, self-hosted, and staying that way.</p>
		</div>
		{#each columns as column}
			<div class="footer-col">
				<h4>{column.heading}</h4>
				{#each column.links as link}
					<a href={link.href}>{link.label}</a>
				{/each}
			</div>
		{/each}
	</div>
	<div class="footer-base">
		<span>© {year} {siteName} contributors · Apache-2.0</span>
		<span>Built for the tunnel, the airplane mode, the coffee shop with no router.</span>
	</div>
</footer>
