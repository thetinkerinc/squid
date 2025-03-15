import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$components: './src/lib/components',
			$utils: './src/lib/utils',
			$routes: './src/routes',
			$eql: './dbschema/edgeql-js',
			$models: './dbschema/interfaces.ts',
			$trpc: './src/lib/trpc'
		}
	}
};

export default config;
