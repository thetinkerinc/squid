<script lang="ts">
let {
	amount = $bindable(),
	enteredAmount = $bindable(),
	enteredCurrency = $bindable('CAD')
}: Props = $props();

import { page } from '$app/state';

import { Input } from '$components/ui/input';
import CurrencySelector from '$components/currency-selector.svelte';

import type { CurrencyType } from '$models';

interface Props {
	amount: number | undefined;
	enteredAmount: number | undefined;
	enteredCurrency: CurrencyType;
}

$effect(() => {
	amount = getAmount();
});

function getAmount() {
	if (enteredAmount == null) {
		return undefined;
	}
	const multiplier = 1 / page.data.currencies[enteredCurrency].value;
	return enteredAmount * multiplier;
}
</script>

<div class="flex gap-1">
	<div class="flex-auto">
		<Input type="number" min={0} placeholder="Amount" bind:value={enteredAmount} />
	</div>
	<div>
		<CurrencySelector onupdate={(c: CurrencyType) => (enteredCurrency = c)} />
	</div>
</div>
