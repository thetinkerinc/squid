<script lang="ts">
import { LogOut } from 'lucide-svelte';

import auth from '$lib/auth';

import Card from '$components/card.svelte';

import Totals from './totals.svelte';
import Income from './income.svelte';
import Expense from './expense.svelte';
import Withdrawal from './withdrawal.svelte';
import Breakdown from './breakdown.svelte';
import Entries from './entries.svelte';
</script>

<div class="px-8 pb-10 pt-4">
	<div class="mb-4 flex items-center">
		<div class="flex-auto">
			<img src="/squid.png" alt="Cartoon squid with money" class="w-[70px]" />
		</div>
		<div>
			<a href={auth.getSignoutUrl()}>
				<LogOut size={30} />
			</a>
		</div>
	</div>
	<div class="grid grid-cols-[1fr_2fr] place-items-start justify-items-stretch gap-4">
		<div>
			<Card>
				<Totals />
			</Card>
			<div class="my-4 flex justify-around">
				<Income />
				<Expense />
				<Withdrawal />
			</div>
			<Card>
				<Entries />
			</Card>
		</div>
		<Card>
			<Breakdown />
		</Card>
	</div>
</div>
