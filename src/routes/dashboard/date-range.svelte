<script lang="ts">
let { period, start, end, children }: Props = $props();

import { page } from '$app/state';

import navigation from '$utils/navigation';

import { Button } from '$components/ui/button';

import type { Snippet } from 'svelte';

interface Props {
	period?: string;
	start?: string;
	end?: string;
	children: Snippet;
}

let selectedPeriod = $derived(page.url.searchParams.get('period'));
let variant = $derived<'default' | 'outline'>(selectedPeriod == period ? 'default' : 'outline');

async function handleDates() {
	await navigation.updateSearch({
		period,
		start,
		end
	});
}
</script>

<Button {variant} onclick={handleDates}>
	{@render children()}
</Button>
