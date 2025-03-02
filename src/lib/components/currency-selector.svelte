<script lang="ts">
let { onupdate } = $props();

import { page } from '$app/state';
import local from '@thetinkerinc/isolocal';

import * as Select from '$components/ui/select';

import type { Page } from '@sveltejs/kit';

let currency = $state(local.get('currency', 'CAD'));

function getCurrencies(): Page['data']['currencies'] {
	return Object.entries(page.data.currencies).toSorted((a, b) => a[0].localeCompare(b[0]));
}

function updateCurrency(newCurrency: string) {
	currency = newCurrency;
	onupdate(newCurrency);
}
</script>

<Select.Root type="single" value={currency} onValueChange={updateCurrency}>
	<Select.Trigger>{currency}</Select.Trigger>
	<Select.Content>
		{#each getCurrencies() as [code, info]}
			<Select.Item value={code}>
				{info.symbol}
				{code}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
