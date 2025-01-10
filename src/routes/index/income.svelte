<script lang="ts">
import { invalidateAll } from '$app/navigation';

import { client } from '$trpc/client';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';
import { Label } from '$components/ui/label';
import * as RadioGroup from '$components/ui/radio-group';

import type { AccountType } from '$models';

const categories = ['paycheck', 'misc'];

let open = $state<boolean>(false);
let amount = $state<number>();
let account = $state<AccountType>('bank');
let category = $state<string>();
let addingCategory = $state<boolean>(false);
let description = $state<string>();

let disabled = $derived(amount == null || !account || !category);

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
	if (amount == null || !account || category == null) {
		return;
	}
	await client.entry.create.mutate({
		type: 'income',
		account,
		amount,
		category,
		description
	});
	await invalidateAll();
	open = false;
}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>Income</Button>
		{/snippet}
	</AlertDialog.Trigger>
	<AlertDialog.Content class="border border-white/[0.8] bg-white/[0.3] backdrop-blur">
		<AlertDialog.Title>Add income to your account</AlertDialog.Title>
		<Input type="number" min={0} placeholder="Amount" bind:value={amount} />
		<div>
			<RadioGroup.Root class="flex flex-wrap gap-4" bind:value={account}>
				<div class="flex items-center gap-2">
					<RadioGroup.Item value="bank" id="bank" />
					<Label for="bank">Bank</Label>
				</div>
				<div class="flex items-center gap-2">
					<RadioGroup.Item value="cash" id="cash" />
					<Label for="cash">Cash</Label>
				</div>
			</RadioGroup.Root>
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
			<Input type="text" placeholder="Description" bind:value={description} />
		{/if}
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action {disabled} onclick={save}>Save</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
