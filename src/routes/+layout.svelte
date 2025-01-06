<script lang="ts">
let { children }: Props = $props();

import { ParaglideJS } from '@inlang/paraglide-sveltekit';

import { i18n } from '$lib/i18n';

import type { Snippet } from 'svelte';

interface Props {
	children: Snippet
};

import '../app.css';
</script>

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>