import { defineConfig } from 'vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { execSync } from 'node:child_process';

import type { Plugin } from 'vite';

function stopDbOnExit(): Plugin {
	let registered = false;

	function shutdown(exit: boolean) {
		return () => {
			try {
				execSync('docker compose down', { stdio: 'ignore' });
			} catch (_err) {} // eslint-disable-line no-empty
			if (exit) {
				process.exit();
			}
		};
	}

	return {
		name: 'stop-db-on-exit',
		apply: 'serve',
		configureServer() {
			if (registered) {
				return;
			}
			registered = true;
			process.on('SIGINT', shutdown(true));
			process.on('SIGTERM', shutdown(true));
			process.on('exit', shutdown(false));
		}
	};
}

export default defineConfig({
	ssr: {
		noExternal: ['@thetinkerinc/isolocal']
	},
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['cookie', 'baseLocale']
		}),
		stopDbOnExit()
	]
});
