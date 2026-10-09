import { env } from '$env/dynamic/public';

export const siteName = 'Kelpie';
const configuredSiteUrl = env.PUBLIC_SITE_URL?.trim() || 'https://kelpie.dev';
const parsedSiteUrl = new URL(
	/^[a-z][a-z\d+.-]*:\/\//i.test(configuredSiteUrl)
		? configuredSiteUrl
		: `https://${configuredSiteUrl}`
);

if (parsedSiteUrl.protocol !== 'http:' && parsedSiteUrl.protocol !== 'https:') {
	throw new Error('PUBLIC_SITE_URL must use HTTP or HTTPS');
}

export const siteUrl = parsedSiteUrl.origin;
export const siteDescription =
	'A local-first sync engine for TypeScript apps. Keep data useful, even when the network is not.';
