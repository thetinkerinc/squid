<script lang="ts">
let { currency }: Props = $props();

import { page } from '$app/state';
import local from '@thetinkerinc/isolocal';

import * as m from '$paraglide/messages';
import { addEntry } from '$remote/data.remote';

import { Input } from '$components/ui/input';
import CurrencySelector from '$components/currency-selector.svelte';

import type { CurrencyValue } from '$types';

interface Props {
	currency?: CurrencyValue;
}

// svelte-ignore state_referenced_locally
let selectedCurrency = $state<CurrencyValue>(currency ?? local.currency);
let enteredAmount = $state<number | undefined>();

let amount = $derived(getAmount());

function getAmount() {
	if (enteredAmount == null) {
		return undefined;
	}
	const multiplier = 1 / page.data.currencies[selectedCurrency].value;
	return enteredAmount * multiplier;
}
</script>

<div class="flex gap-1">
	<div class="flex-auto">
		<Input
			{...addEntry.fields.enteredAmount.as('number')}
			min={0}
			placeholder={m.add_entry_amount_placeholder()}
			bind:value={enteredAmount} />
		<input class="hidden" {...addEntry.fields.amount.as('number')} step="any" value={amount} />
	</div>
	{#if !currency}
		<div>
			<CurrencySelector bind:currency={selectedCurrency} />
		</div>
	{/if}
</div>
