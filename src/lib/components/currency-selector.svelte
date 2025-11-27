<script lang="ts">
let { currency = $bindable() }: Props = $props();

import { page } from '$app/state';

import * as Select from '$components/ui/select';

import { CurrencyType } from '$prisma/enums';

import type { Page } from '@sveltejs/kit';

interface Props {
	currency: CurrencyType;
}

function getCurrencies(): Page['data']['currencies'] {
	return Object.entries(page.data.currencies).toSorted((a, b) => a[0].localeCompare(b[0]));
}
</script>

<Select.Root type="single" bind:value={currency}>
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
