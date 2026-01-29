<script lang="ts">
let { entries }: Props = $props();

import * as _ from 'radashi';
import { Landmark, Banknote } from '@lucide/svelte';

import formatter from '$utils/formatter';

import { EntryType, AccountType, type Entry } from '$types';

interface Props {
	entries: Entry[];
}

let totals = $derived(getTotals());
let total = $derived(totals.income - totals.expense);
let pending = $derived(totals.pending);
let bank = $derived(totals.bankIncome - totals.withdrawal - totals.bankExpense);
let cash = $derived(totals.cashIncome + totals.withdrawal - totals.cashExpense);

function getTotals() {
	const income = entries.filter((e) => e.type === EntryType.income && e.pending === false);
	const pending = entries.filter((e) => e.type === EntryType.income && e.pending === true);
	const bankIncome = income.filter((e) => e.account === AccountType.bank);
	const cashIncome = income.filter((e) => e.account === AccountType.cash);
	const expense = entries.filter((e) => e.type === EntryType.expense);
	const bankExpense = expense.filter((e) => e.account === AccountType.bank);
	const cashExpense = expense.filter((e) => e.account === AccountType.cash);
	const withdrawal = entries.filter((e) => e.type === EntryType.withdrawal);
	return {
		income: _.sum(income, (e) => e.amount),
		pending: _.sum(pending, (e) => e.amount),
		bankIncome: _.sum(bankIncome, (e) => e.amount),
		cashIncome: _.sum(cashIncome, (e) => e.amount),
		expense: _.sum(expense, (e) => e.amount),
		bankExpense: _.sum(bankExpense, (e) => e.amount),
		cashExpense: _.sum(cashExpense, (e) => e.amount),
		withdrawal: _.sum(withdrawal, (e) => e.amount)
	};
}
</script>

<div class="mb-4 flex items-center justify-center gap-2">
	<div class="text-3xl tracking-wider">
		{formatter.money(total)}
	</div>
	{#if pending}
		<div class="text-gray-600">+</div>
		<div class="text-gray-600">
			({formatter.money(pending)})
		</div>
	{/if}
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
