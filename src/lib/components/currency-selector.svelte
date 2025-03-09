<script lang="ts">
let { onupdate }: Props = $props();

import { page } from '$app/state';
import local from '@thetinkerinc/isolocal';

import * as Select from '$components/ui/select';

import type { Page } from '@sveltejs/kit';
import type { Currency } from '$types';

interface Props {
	onupdate?: (c: Currency) => void;
}

function getCurrencies(): Page['data']['currencies'] {
	return Object.entries(page.data.currencies).toSorted((a, b) => a[0].localeCompare(b[0]));
}

function updateCurrency(newCurrency: string) {
	local.currency = newCurrency as Currency;
	onupdate?.(newCurrency as Currency);
}
</script>

<Select.Root type="single" value={local.currency} onValueChange={updateCurrency}>
	<Select.Trigger>{local.currency}</Select.Trigger>
	<Select.Content>
		{#each getCurrencies() as [code, info]}
			<Select.Item value={code}>
				{info.symbol}
				{code}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
