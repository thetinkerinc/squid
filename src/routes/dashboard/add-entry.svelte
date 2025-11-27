<script lang="ts">
let { defaultCategories, entryType, title }: Props = $props();

import { page } from '$app/state';
import { invalidateAll } from '$app/navigation';
import local from '@thetinkerinc/isolocal';
import * as _ from 'radashi';

import * as remote from '$remote/data.remote';

import formatter from '$utils/formatter';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';
import { Label } from '$components/ui/label';
import * as RadioGroup from '$components/ui/radio-group';

import AmountInput from './amount-input.svelte';
import DatetimeInput from './datetime-input.svelte';
import DescriptionInput from './description-input.svelte';

import { AccountType, EntryType, CurrencyType } from '$prisma/enums';
import type { Entry } from '$prisma/client';

interface Props {
	defaultCategories: string[];
	entryType: EntryType;
	title: string;
}

let open = $state<boolean>(false);
let amount = $state<number>();
let enteredAmount = $state<number>();
let enteredCurrency = $state<CurrencyType>(local.currency);
let account = $state<AccountType>(AccountType.bank);
let created = $state<Date>();
let category = $state<string>();
let addingCategory = $state<boolean>(false);
let description = $state<string>('');

let entries = $derived<Entry[]>(page.data.entries.filter((e: Entry) => e.type === entryType));
let categories = $derived<string[]>(
	_.unique(defaultCategories.concat(entries.map((e) => e.category)))
);
let descriptions = $derived<string[]>(
	_.unique(_.sift(entries.filter((e) => e.category === category).map((e) => e.description)))
);
let disabled = $derived(amount == null || !account || !category);

function reset() {
	amount = undefined;
	enteredAmount = undefined;
	enteredCurrency = local.currency;
	account = AccountType.bank;
	created = undefined;
	category = undefined;
	addingCategory = false;
	description = '';
}

function setCategory(cat: string) {
	return () => {
		if (category === cat) {
			category = undefined;
		} else {
			category = cat;
		}
		addingCategory = false;
	};
}

function addCategory() {
	if (addingCategory) {
		addingCategory = false;
	} else {
		addingCategory = true;
		category = undefined;
	}
}

async function save() {
	if (amount == null || enteredAmount == null || !account || category == null) {
		return;
	}
	await remote.addEntry({
		type: entryType,
		account,
		created,
		amount,
		enteredAmount,
		enteredCurrency,
		category,
		description
	});
	await invalidateAll();
	open = false;
}
</script>

<AlertDialog.Root onOpenChange={reset} bind:open>
	<AlertDialog.Trigger>
		{#snippet child({ props })}
			<Button class="capitalize" {...props}>{entryType}</Button>
		{/snippet}
	</AlertDialog.Trigger>
	<AlertDialog.Content class="border border-white/[0.8] bg-white/[0.3] backdrop-blur">
		<AlertDialog.Title>{title}</AlertDialog.Title>
		<AmountInput bind:amount bind:enteredAmount bind:enteredCurrency />
		<div class="flex flex-wrap items-center gap-4">
			<RadioGroup.Root class="flex flex-auto flex-wrap items-center gap-4" bind:value={account}>
				<div class="flex items-center gap-2">
					<RadioGroup.Item value="bank" id="bank" />
					<Label for="bank">Bank</Label>
				</div>
				<div class="flex items-center gap-2">
					<RadioGroup.Item value="cash" id="cash" />
					<Label for="cash">Cash</Label>
				</div>
			</RadioGroup.Root>
			<div class="flex items-center gap-2">
				<div>{formatter.date(created, 'eee MMM d, h:mm aaa')}</div>
				<DatetimeInput onselect={(d: Date) => (created = d)} />
			</div>
		</div>
		<div class="flex flex-wrap gap-2">
			{#each categories as cat}
				{@const isSelected = cat === category}
				<button
					class={[
						'rounded border border-gray-200 px-4 py-1 capitalize',
						isSelected && 'bg-black text-white',
						!isSelected && 'bg-white hover:bg-gray-100'
					]}
					onclick={setCategory(cat)}>
					{cat}
				</button>
			{/each}
			<button
				class={[
					'rounded border border-gray-200 px-4 py-1',
					!addingCategory && 'bg-white hover:bg-gray-100',
					addingCategory && 'bg-black text-white'
				]}
				onclick={addCategory}>
				+
			</button>
		</div>
		{#if addingCategory}
			<Input type="text" placeholder="New category" bind:value={category} />
		{/if}
		{#if category || addingCategory}
			<DescriptionInput options={descriptions} bind:value={description} />
		{/if}
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action {disabled} onclick={save}>Save</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
