<script lang="ts">
let { totals } = $props();

import { Landmark, Banknote } from '@lucide/svelte';

import formatter from '$utils/formatter';

let total = $derived(totals.income - totals.expense);
let bank = $derived(totals.bankIncome - totals.withdrawal - totals.bankExpense);
let cash = $derived(totals.cashIncome + totals.withdrawal - totals.cashExpense);
</script>

<div class="mb-4 text-center text-3xl tracking-wider">
	{formatter.money(total)}
</div>
<div class="flex justify-center gap-4">
	<div class="flex items-center gap-2">
		<Landmark />
		<div>{formatter.money(bank)}</div>
	</div>
	<div>/</div>
	<div class="flex items-center gap-2">
		<Banknote />
		<div>{formatter.money(cash)}</div>
	</div>
</div>
