<script lang="ts">
let {
	amount = $bindable(),
	enteredAmount = $bindable(),
	enteredCurrency = $bindable(CurrencyType.CAD)
}: Props = $props();

import { page } from '$app/state';

import { Input } from '$components/ui/input';
import CurrencySelector from '$components/currency-selector.svelte';

import { CurrencyType } from '$prisma/enums';

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
		<CurrencySelector bind:currency={enteredCurrency} />
	</div>
</div>
