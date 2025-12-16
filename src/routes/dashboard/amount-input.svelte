<script lang="ts">
import { page } from '$app/state';

import { addEntry } from '$remote/data.remote';

import { Input } from '$components/ui/input';
import CurrencySelector from '$components/currency-selector.svelte';

import { CurrencyType, type CurrencyValue } from '$types';

let currency = $state<CurrencyValue>(CurrencyType.CAD);
let enteredAmount = $state<number | undefined>();

let amount = $derived(getAmount());

function getAmount() {
	if (enteredAmount == null) {
		return undefined;
	}
	const multiplier = 1 / page.data.currencies[currency].value;
	return enteredAmount * multiplier;
}
</script>

<div class="flex gap-1">
	<div class="flex-auto">
		<Input
			{...addEntry.fields.enteredAmount.as('number')}
			min={0}
			placeholder="Amount"
			bind:value={enteredAmount} />
		<input class="hidden" {...addEntry.fields.amount.as('number')} value={amount} />
	</div>
	<div>
		<CurrencySelector bind:currency />
	</div>
</div>
