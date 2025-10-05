<script lang="ts">
import { page } from '$app/state';
import local from '@thetinkerinc/isolocal';
import { useClerkContext } from 'svelte-clerk/client';
import { LogOut } from '@lucide/svelte';

import Card from '$components/card.svelte';
import CurrencySelector from '$components/currency-selector.svelte';
import Totals from '$components/totals.svelte';
import Entries from '$components/entries.svelte';
import Breakdown from '$components/breakdown.svelte';

import Income from './income.svelte';
import Expense from './expense.svelte';
import Withdrawal from './withdrawal.svelte';
import Partners from './partners.svelte';

const ctx = useClerkContext();

async function logout() {
	await ctx.clerk?.signOut();
}
</script>

<svelte:head>
	<title>Squid</title>
</svelte:head>
<div class="px-8 pt-4 pb-10">
	<div class="mb-4 flex items-center">
		<div class="flex-auto">
			<img src="/squid.png" alt="Cartoon squid with money" class="w-[70px]" />
		</div>
		<div class="flex items-center gap-4">
			<CurrencySelector bind:currency={local.currency} />
			<button class="cursor-pointer" onclick={logout}>
				<LogOut size={27} />
			</button>
		</div>
	</div>
	<div
		class="grid grid-rows-[auto_auto] place-items-start justify-items-stretch gap-4 lg:grid-cols-[1fr_2fr] lg:grid-rows-1">
		<div
			class="grid grid-rows-[auto_auto] gap-2 md:grid-cols-2 md:grid-rows-1 lg:grid-cols-1 lg:grid-rows-[auto_auto]">
			<div>
				<Card>
					<Totals totals={page.data.totals} />
				</Card>
				<div class="my-4 flex justify-around">
					<Income />
					<Expense />
					<Withdrawal />
				</div>
			</div>
			<Card>
				<Entries entries={page.data.entries} />
			</Card>
		</div>
		<div>
			<Card class="@container mb-6">
				<Breakdown entries={page.data.entries} />
			</Card>
			<Card>
				<Partners />
			</Card>
		</div>
	</div>
</div>
