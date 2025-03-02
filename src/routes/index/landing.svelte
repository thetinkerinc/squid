<script lang="ts">
import { flip } from 'svelte/animate';
import { fade } from 'svelte/transition';
import { Landmark, Banknote, ArrowUp, ArrowDown, Redo, Info, X } from 'lucide-svelte';
import dayjs from 'dayjs';
import * as _ from 'radashi';

import auth from '$lib/auth';

import formatter from '$utils/formatter';

import { Button } from '$components/ui/button';
import Card from '$components/card.svelte';
import * as Tooltip from '$components/ui/tooltip';

const entries = [
	{
		id: _.uid(8),
		created: new Date(),
		type: 'expense',
		account: 'cash',
		amount: 19,
		enteredAmount: 19,
		enteredCurrency: 'CAD',
		category: 'groceries',
		description: null,
		user: {
			email: 'example@email.com'
		}
	},
	{
		id: _.uid(8),
		created: new Date(),
		type: 'withdrawal',
		account: 'bank',
		amount: 25,
		enteredAmount: 25,
		enteredCurrency: 'CAD',
		category: 'withdrawal',
		description: null,
		user: {
			email: 'example@email.com'
		}
	},
	{
		id: _.uid(8),
		created: new Date(),
		type: 'expense',
		account: 'bank',
		amount: 25,
		enteredAmount: 25,
		enteredCurrency: 'CAD',
		category: 'food',
		description: 'uber eats',
		user: {
			email: 'example@email.com'
		}
	},
	{
		id: _.uid(8),
		created: new Date(),
		type: 'income',
		account: 'bank',
		amount: 2600,
		enteredAmount: 2600,
		enteredCurrency: 'CAD',
		category: 'paycheck',
		description: 'january',
		user: {
			email: 'example@email.com'
		}
	}
];
</script>

<div class="mx-auto w-[80%]">
	<div
		class="grid grid-rows-[repeat(3,auto)] items-center justify-items-center gap-10 p-4 lg:grid-cols-[repeat(3,auto)] lg:grid-rows-1">
		<img src="/squid.png" alt="Cartoon squid with money" class="w-[200px]" />
		<div>
			<div class="mb-2 text-[50px] leading-none">Save quid with squid!</div>
			<div class="text-2xl">
				<div class="ml-2">Easily keep track of your income and expenses</div>
				<div class="ml-4">and collaborate with others to do shared budgeting</div>
			</div>
		</div>
		<div class="self-center">
			<Button href={auth.getBuiltinUIUrl()}>Get started</Button>
		</div>
	</div>
</div>
<div class="grid grid-cols-3 gap-4 mt-10 mx-auto w-[95%]">
	<Card>
		<div class="text-center mb-4 text-lg">See your total balance at a glance</div>
		<div class="mb-4 text-center text-3xl tracking-wider">
			{formatter.money(2586)}
		</div>
		<div class="flex justify-center gap-4">
			<div class="flex items-center gap-2">
				<Landmark />
				<div>{formatter.money(1925)}</div>
			</div>
			<div>/</div>
			<div class="flex items-center gap-2">
				<Banknote />
				<div>{formatter.money(661)}</div>
			</div>
		</div>
	</Card>
	<Card class="aspect-square">
		<div class="text-lg mb-6 text-center">All your income, expenses, and withdrawals</div>
		{#each entries as entry (entry.id)}
			<div
				class="entry mb-2 flex items-center gap-4 rounded bg-white/[0.7] px-4 py-1 shadow leading-tight"
					   animate:flip
				transition:fade={{ duration: 200 }}>
				{@render badge(entry)}
				<div>{formatter.money(entry.amount)}</div>
				<div class="text-gray-500">{formatter.date(entry.created)}</div>
				<div class="capitalize">{entry.category}</div>
				<div class="actions flex flex-auto items-center justify-end gap-1 transition">
					<Tooltip.Root>
						<Tooltip.Trigger class="text-blue-500">
							<Info />
						</Tooltip.Trigger>
						<Tooltip.Content class="flex flex-col gap-2 py-2 text-base">
							<div class="flex items-center gap-2">
								{@render badge(entry)}
								<div>{formatter.money(entry.amount)}</div>
								<div>({entry.enteredAmount} {entry.enteredCurrency})</div>
							</div>
							<div>{formatter.date(entry.created, 'h:mm a ddd MMM D, YYYY')}</div>
							<div class="flex gap-1">
								<div class="capitalize">{entry.category}</div>
								<div>-</div>
								<div class="text-gray-500">{entry.description ?? 'No description'}</div>
							</div>
							<div>{entry.user.email}</div>
						</Tooltip.Content>
					</Tooltip.Root>
					<button class="text-red-500">
						<X />
					</button>
				</div>
			</div>
		{/each}
	</Card>
	<Card class="aspect-square">
		<div class="text-center mb-4 text-lg">Breakdown of all time and monthly expenses</div>
	</Card>
</div>

{#snippet badge(entry: typeof entries[0])}
	{#if entry.type === 'income'}
		<div class="badge from-green-300 to-green-400">
			<ArrowUp size={20} />
		</div>
	{:else if entry.type === 'expense'}
		<div class="badge from-red-300 to-red-400">
			<ArrowDown size={20} />
		</div>
	{:else if entry.type === 'withdrawal'}
		<div class="badge from-blue-300 to-blue-400">
			<Redo size={20} />
		</div>
	{/if}
{/snippet}

<style lang="postcss">
 .badge {
	 @apply rounded bg-gradient-to-br p-[2px] shadow;
 }
 .entry .actions {
	 opacity: 0;
	 pointer-events: none;
 }
 .entry:hover .actions {
	 opacity: 1;
	 pointer-events: unset;
 }
</style>
