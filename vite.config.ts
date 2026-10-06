import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [enhancedImages(), sveltekit()],
	build: {
		// Kelpie's docs bundle a lot of code samples; keeping chunks small makes
		// the prerendered pages cache independently of one another.
		chunkSizeWarningLimit: 900
	}
});