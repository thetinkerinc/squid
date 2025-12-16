import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'src/lib/components/ui/',
			'src/lib/paraglide/',
			'.trigger/',
			'src/worker-configuration.d.ts'
		]
	},
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		rules: {
			'svelte/require-each-key': 'off',
			'svelte/prefer-writable-derived': 'off'
		}
	},
	{
		files: ['migrations/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		rules: {
			'no-mixed-spaces-and-tabs': 'off',
			'no-control-regex': 'off',
			'no-async-promise-executor': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					varsIgnorePattern: '^_.',
					argsIgnorePattern: '^_.',
					caughtErrorsIgnorePattern: '^_.'
				}
			]
		}
	}
);
