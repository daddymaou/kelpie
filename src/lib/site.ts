import { env } from '$env/dynamic/public';

export const siteName = 'Kelpie';
export const siteUrl = (env.PUBLIC_SITE_URL || 'https://kelpie.dev').replace(/\/$/, '');
export const siteDescription =
	'A local-first sync engine for TypeScript apps. Keep data useful, even when the network is not.';
