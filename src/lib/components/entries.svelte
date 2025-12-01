<script lang="ts">
let { entries, canDelete = true }: Props = $props();

import { flip } from 'svelte/animate';
import { fade } from 'svelte/transition';
import { ArrowUp, ArrowDown, Redo, Info, X, Landmark, Banknote } from '@lucide/svelte';

import formatter from '$utils/formatter';

import { rmEntry } from '$remote/data.remote';

import { ScrollArea } from '$components/ui/scroll-area';
import * as Tooltip from '$components/ui/tooltip';

import { EntryType, AccountType } from '$prisma/enums';

import type { Entry } from '$prisma/client';

interface Props {
	entries: Entry[];
	canDelete?: boolean;
}
</script>

<ScrollArea class="flex max-h-[300px] flex-col lg:max-h-[400px]">
	{#each entries as entry (entry.id)}
		<div
			class="entry mb-2 flex items-center gap-4 rounded bg-white/[0.7] px-4 py-1 shadow"
			animate:flip
			transition:fade={{ duration: 200 }}>
			<div class="flex flex-wrap items-center gap-2">
				<div class="flex items-center gap-2">
					{@render badge(entry)}
					<div>{formatter.money(entry.amount)}</div>
				</div>
				<div class="text-gray-500">{formatter.date(entry.created)}</div>
			</div>
			<div class="capitalize">{entry.category}</div>
			<div class="actions flex flex-auto items-center justify-end gap-1 transition">
				<Tooltip.Root disableCloseOnTriggerClick={true}>
					<Tooltip.Trigger class="text-blue-500">
						<Info />
					</Tooltip.Trigger>
					<Tooltip.Content class="flex flex-col gap-2 py-2 text-base">
						<div class="flex items-center gap-2">
							{@render badge(entry)}
							<div>{formatter.money(entry.amount)}</div>
							<div>({entry.enteredAmount} {entry.enteredCurrency})</div>
							{#if entry.account === AccountType.bank}
								<Landmark />
							{:else if entry.account === AccountType.cash}
								<Banknote />
							{/if}
						</div>
						<div>{formatter.date(entry.created, 'h:mm aaa eee MMM d, yyyy')}</div>
						<div class="flex gap-1">
							<div class="capitalize">{entry.category}</div>
							<div>-</div>
							<div class="text-gray-500">{entry.description ?? 'No description'}</div>
						</div>
						<div>{entry.userEmail}</div>
					</Tooltip.Content>
				</Tooltip.Root>
				{#if canDelete}
					<form {...rmEntry.for(entry.id)}>
						<input class="hidden" {...rmEntry.fields.id.as('text')} value={entry.id} />
						<button class="block cursor-pointer text-red-500" type="submit">
							<X />
						</button>
					</form>
				{/if}
			</div>
		</div>
	{:else}
		<div class="rounded bg-white/[0.7] px-4 py-1 shadow text-gray-500 text-center text-lg py-2">
			No entries added yet
		</div>
	{/each}
</ScrollArea>

{#snippet badge(entry: Entry)}
	{#if entry.type === EntryType.income}
		<div class="badge from-green-300 to-green-400">
			<ArrowUp size={20} />
		</div>
	{:else if entry.type === EntryType.expense}
		<div class="badge from-red-300 to-red-400">
			<ArrowDown size={20} />
		</div>
	{:else if entry.type === EntryType.withdrawal}
		<div class="badge from-blue-300 to-blue-400">
			<Redo size={20} />
		</div>
	{/if}
{/snippet}

<style lang="postcss">
@reference 'tailwindcss';

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
