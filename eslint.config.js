import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'src/lib/components/ui/',
			'dbschema/',
			'src/lib/paraglide/'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
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
