import { defineConfig } from 'vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { unwasm } from 'unwasm/plugin';

export default defineConfig({
	ssr: {
		noExternal: ['@thetinkerinc/isolocal']
	},
	plugins: [
		unwasm({
			esmImport: true
		}),
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['cookie', 'baseLocale']
		})
	]
});
