<script lang="ts">
let { entries, canDelete = true } = $props();

import { invalidateAll } from '$app/navigation';
import { flip } from 'svelte/animate';
import { fade } from 'svelte/transition';
import { ArrowUp, ArrowDown, Redo, Info, X, Landmark, Banknote } from '@lucide/svelte';

import formatter from '$utils/formatter';
import { client } from '$trpc/client';

import { ScrollArea } from '$components/ui/scroll-area';
import * as Tooltip from '$components/ui/tooltip';

import type { Entry } from '$models';

function rm(id: string) {
	return async () => {
		if (!canDelete) {
			return;
		}
		await client.entry.delete.mutate({ id });
		await invalidateAll();
	};
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
							{#if entry.account === 'bank'}
								<Landmark />
							{:else if entry.account === 'cash'}
								<Banknote />
							{/if}
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
				<button class="text-red-500" onclick={rm(entry.id)}>
					<X />
				</button>
			</div>
		</div>
	{:else}
		<div class="rounded bg-white/[0.7] px-4 py-1 shadow text-gray-500 text-center text-lg py-2">
			No entries added yet
		</div>
	{/each}
</ScrollArea>

{#snippet badge(entry: Entry)}
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
