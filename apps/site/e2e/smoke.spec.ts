import { expect, test } from '@playwright/test';

test('home page renders the hero and primary actions', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.hero h1')).toBeVisible();
	await expect(page.getByRole('link', { name: /Read the quick start/ })).toBeVisible();
});

test('docs pages prerender and their sidebar is present', async ({ page }) => {
	await page.goto('/docs/library/what-is-kelpie');
	await expect(page.locator('.docs-tabs')).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'library documentation' })).toBeVisible();
});

test('primary routes resolve without prerender errors', async ({ page }) => {
	for (const href of ['/pricing', '/playground', '/docs/library/quick-start', '/docs/cli/cli-reference', '/blog/keeping-writes-local']) {
		const response = await page.goto(href);
		expect(response?.status()).toBe(200);
	}
});

test('desktop navigation dropdowns toggle', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Product' }).hover();
	await expect(page.getByRole('link', { name: 'Playground' })).toBeVisible();
});