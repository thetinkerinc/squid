<script lang="ts">
let { entries, canDelete = true }: Props = $props();

import { flip } from 'svelte/animate';
import { fade, slide } from 'svelte/transition';
import { watch } from 'runed';
import { toast } from 'svelte-sonner';
import { ArrowUp, ArrowDown, Redo, Clock, Landmark, Banknote } from '@lucide/svelte';

import formatter from '$utils/formatter';

import * as m from '$paraglide/messages';
import { getPayments, addEntry, markReceived, rmEntry } from '$remote/data.remote';

import { ScrollArea } from '$components/ui/scroll-area';
import * as Dialog from '$components/ui/dialog';
import { Button } from '$components/ui/button';
import AmountInput from '$components/amount-input.svelte';

import { EntryType, AccountType, type Entry } from '$types';

interface Props {
	entries: Entry[];
	canDelete?: boolean;
}

let showReceiptControls = $state(false);
let selectedIdx = $state<number>();

let selectedEntry = $derived<Entry | undefined>(
	selectedIdx == null ? undefined : entries[selectedIdx]
);
let entryId = $derived(selectedEntry?.id);

$effect(() => {
	if (!selectedEntry?.pending) {
		showReceiptControls = false;
	}
});

watch(
	() => entryId,
	(curr, prev) => {
		const wasRemoved = prev && !curr;
		const changed = prev && curr && prev !== curr;
		if (wasRemoved || changed) {
			selectedIdx = undefined;
		}
	}
);

function handleCloseDetails(open: boolean) {
	if (!open) {
		showReceiptControls = false;
		selectedIdx = undefined;
	}
}

async function enhance({ form, submit }: EnhanceParams<typeof addEntry.enhance>) {
	try {
		await submit();
		form.reset();
		showReceiptControls = false;
	} catch (_err) {
		toast.error(m.add_entry_error());
	}
}
</script>

<ScrollArea class="flex max-h-[300px] flex-col lg:max-h-[400px]">
	{#each entries as entry, idx (entry.id)}
		<div
			class="entry mb-2 rounded bg-white/[0.7] shadow last:mb-0"
			animate:flip
			transition:fade={{ duration: 200 }}>
			<button
				class="flex w-full cursor-pointer items-center gap-4 px-4 py-1 hover:bg-gray-100/50"
				onclick={() => (selectedIdx = idx)}>
				<div class="flex flex-wrap items-center gap-2">
					<div class="flex items-center gap-2">
						{@render badge(entry)}
						<div>{formatter.money(entry.amount)}</div>
					</div>
					<div class="text-gray-500">{formatter.date(entry.created)}</div>
				</div>
				<div class="capitalize">{entry.category}</div>
			</button>
		</div>
	{:else}
		<div class="rounded bg-white/[0.7] px-4 py-1 shadow text-gray-500 text-center text-lg py-2">
			{m.entries_empty()}
		</div>
	{/each}
</ScrollArea>

{#if selectedEntry}
	<Dialog.Root onOpenChangeComplete={handleCloseDetails} open={!!selectedEntry}>
		<Dialog.Content class="flex flex-col gap-2 bg-primary py-2 py-4 text-base text-white">
			<div class="flex items-center gap-3">
				{@render badge(selectedEntry)}
				<div>
					<div class="flex items-center gap-2">
						<div>{formatter.money(selectedEntry.amount)}</div>
						<div>({selectedEntry.enteredAmount} {selectedEntry.enteredCurrency})</div>
					</div>
					{#if selectedEntry.pending}
						<div class="text-center">
							<svelte:boundary>
								{@const payments = await getPayments({ id: selectedEntry.id })}
								{@const received = payments.reduce((a, v) => a + v.amount, 0)}
								<div>{formatter.money(received)} {m.payments_total_received()}</div>

								{#snippet pending()}
									<div>-- {m.payments_total_received()}</div>
								{/snippet}
							</svelte:boundary>
						</div>
					{/if}
				</div>
				{#if selectedEntry.account === AccountType.bank}
					<Landmark />
				{:else if selectedEntry.account === AccountType.cash}
					<Banknote />
				{/if}
			</div>
			<div>{formatter.date(selectedEntry.created, 'h:mm aaa eee MMM d')}</div>
			<div class="flex gap-1">
				<div class="capitalize">{selectedEntry.category}</div>
				<div>-</div>
				<div class="text-gray-500">{selectedEntry.description ?? m.breakdown_no_description()}</div>
			</div>
			<div>{selectedEntry.userEmail}</div>
			<div class="my-2 flex items-center gap-2">
				{#if selectedEntry.pending}
					<Button
						variant="outline"
						class="text-black"
						onclick={() => (showReceiptControls = !showReceiptControls)}>
						{m.payments_register_button()}
					</Button>
				{/if}
				{#if canDelete}
					<form {...rmEntry.for(selectedEntry.id)}>
						<input class="hidden" {...rmEntry.fields.id.as('text')} value={selectedEntry.id} />
						<Button variant="destructive" type="submit">{m.delete()}</Button>
					</form>
				{/if}
			</div>
			{#if showReceiptControls}
				<div class="rounded bg-slate-800 p-2" transition:slide>
					<form
						{...addEntry.for(selectedEntry.id).enhance(enhance)}
						class="flex items-center gap-1 text-black">
						<input class="hidden" {...addEntry.fields.parent.as('text')} value={selectedEntry.id} />
						<input class="hidden" {...addEntry.fields.type.as('text')} value={EntryType.income} />
						<input
							class="hidden"
							{...addEntry.fields.account.as('text')}
							value={selectedEntry.account} />
						<input
							class="hidden"
							{...addEntry.fields.category.as('text')}
							value={m.add_payment_category()} />
						<AmountInput currency={selectedEntry.enteredCurrency} />
						<input
							class="hidden"
							{...addEntry.fields.enteredCurrency.as('text')}
							value={selectedEntry.enteredCurrency} />
						<input
							class="hidden"
							{...addEntry.fields.created.as('text')}
							value={new Date().toISOString()} />
						<Button variant="outline" class="text-black" type="submit">
							{m.payments_add_button()}
						</Button>
					</form>
					<div class="mb-1">
						{#each addEntry.for(selectedEntry.id).fields.enteredAmount.issues() as issue}
							<div class="text-sm text-red-400">{issue.message}</div>
						{/each}
					</div>
					<form {...markReceived.for(selectedEntry.id)}>
						<input class="hidden" {...markReceived.fields.id.as('text')} value={selectedEntry.id} />
						<Button variant="outline" class="text-black" type="submit">
							{m.payments_received_button()}
						</Button>
					</form>
				</div>
			{/if}
			<div>{m.payments_title()}</div>
			<svelte:boundary>
				<ScrollArea class="flex max-h-[200px] flex-col rounded bg-slate-800 p-2">
					{#each await getPayments({ id: selectedEntry.id }) as payment (payment.id)}
						<div
							class="mb-2 flex items-center gap-4 rounded bg-gray-600 px-4 py-1 last:mb-0"
							animate:flip>
							{@render badge(payment)}
							<div>{formatter.money(payment.amount)}</div>
							<div>{formatter.date(payment.created, 'h:mm aaa eee MMM d')}</div>
						</div>
					{:else}
						<div class="text-center">{m.payments_empty()}</div>
					{/each}
				</ScrollArea>

				{#snippet pending()}
					<div class="rounded bg-slate-800 p-2">
						{#each { length: 3 }}
							<div class="mb-2 h-8 animate-pulse rounded bg-gray-600"></div>
						{/each}
					</div>
				{/snippet}
			</svelte:boundary>
		</Dialog.Content>
	</Dialog.Root>
{/if}

{#snippet badge(entry: Entry)}
	{#if entry.type === EntryType.income}
		<div class="badge relative from-green-300 to-green-400">
			<ArrowUp size={20} />
			{#if entry.pending}
				<div
					class="absolute top-0 right-0 translate-x-[3px] -translate-y-[3px] rounded-full bg-amber-400">
					<Clock size={13} />
				</div>
			{/if}
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
</style>
