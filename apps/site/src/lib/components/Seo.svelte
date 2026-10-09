<script lang="ts">
	import { siteDescription, siteName, siteUrl } from '$lib/site';

	let {
		title,
		description = siteDescription,
		path = '/',
		type = 'website',
		ogImage,
		article = false,
		robots = 'index,follow'
	}: {
		title: string;
		description?: string;
		path?: string;
		type?: 'website' | 'article';
		ogImage?: string;
		article?: boolean;
		robots?: string;
	} = $props();

	const canonical = $derived(`${siteUrl}${path.startsWith('/') ? path : `/${path}`}`);
	const image = $derived(ogImage?.startsWith('http') ? ogImage : `${siteUrl}${ogImage ?? '/og-image.png'}`);
	const schema = $derived(article
		? {
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: title,
				description,
				url: canonical,
				mainEntityOfPage: canonical,
				publisher: { '@type': 'Organization', name: siteName, url: siteUrl }
			}
		: {
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: siteName,
				url: siteUrl,
				description
			});
</script>

<svelte:head>
	<title>{title} | Kelpie</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta name="robots" content={robots} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Kelpie — local-first sync for TypeScript" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="theme-color" content="#1f1e1b" media="(prefers-color-scheme: dark)" />
	<meta name="theme-color" content="#f4f2ec" media="(prefers-color-scheme: light)" />
	<meta name="color-scheme" content="dark light" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
	<script type="application/ld+json">{JSON.stringify(schema)}</script>
</svelte:head>
