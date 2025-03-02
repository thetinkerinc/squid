<script lang="ts">
import { page } from '$app/state';
import { invalidateAll } from '$app/navigation';
import local from '@thetinkerinc/isolocal';
import { LogOut } from 'lucide-svelte';

import auth from '$lib/auth';

import Card from '$components/card.svelte';
import CurrencySelector from '$components/currency-selector.svelte';

import Totals from './totals.svelte';
import Income from './income.svelte';
import Expense from './expense.svelte';
import Withdrawal from './withdrawal.svelte';
import Entries from './entries.svelte';
import Breakdown from './breakdown.svelte';
import Partners from './partners.svelte';

async function updateCurrency(newCurrency: string) {
	local.set('currency', newCurrency);
	await invalidateAll();
}
</script>

<div class="px-8 pb-10 pt-4">
	<div class="mb-4 flex items-center">
		<div class="flex-auto">
			<img src="/squid.png" alt="Cartoon squid with money" class="w-[70px]" />
		</div>
		<div class="flex items-center gap-4">
			<CurrencySelector onupdate={updateCurrency} />
			<a href={auth.getSignoutUrl()}>
				<LogOut size={30} />
			</a>
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
			<Card class="mb-6 @container">
				<Breakdown entries={page.data.entries} />
			</Card>
			<Card>
				<Partners />
			</Card>
		</div>
	</div>
</div>
