<script lang="ts">
let { defaultCategories, entryType, title }: Props = $props();

import { toast } from 'svelte-sonner';

import { getEntriesAndPartners, addEntry } from '$remote/data.remote';
import * as schema from '$remote/schema';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Label } from '$components/ui/label';
import * as RadioGroup from '$components/ui/radio-group';

import AmountInput from './amount-input.svelte';
import DatetimeInput from './datetime-input.svelte';
import CategoryInput from './category-input.svelte';

import { EntryType } from '$prisma/enums';

interface Props {
	defaultCategories: string[];
	entryType: EntryType;
	title: string;
}

let open = $state<boolean>(false);

let entriesAndPartners = $derived(await getEntriesAndPartners());
let entries = $derived(entriesAndPartners.entries.filter((e) => e.type === entryType));

async function enhance({ form, submit }: Parameters<Parameters<typeof addEntry.enhance>[0]>[0]) {
	try {
		await submit();
		form.reset();
		open = false;
	} catch (_err) {
		toast.error(
			'Something went wrong while saving your entry. Please try again or reach out if the issue persists'
		);
	}
}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger>
		{#snippet child({ props })}
			<Button class="capitalize" {...props}>{entryType}</Button>
		{/snippet}
	</AlertDialog.Trigger>
	<AlertDialog.Content class="border border-white/[0.8] bg-white/[0.3] backdrop-blur">
		<AlertDialog.Title>{title}</AlertDialog.Title>
		<form id="add-entry" {...addEntry.preflight(schema.entry).enhance(enhance)}>
			<input class="hidden" {...addEntry.fields.type.as('text')} value={entryType} />
			<AmountInput />
			<div class="my-2 flex flex-wrap items-center gap-4">
				<RadioGroup.Root
					class="flex flex-auto flex-wrap items-center gap-4"
					name={addEntry.fields.account.as('text').name}>
					<div class="flex items-center gap-2">
						<RadioGroup.Item {...addEntry.fields.account.as('text')} value="bank" id="bank" />
						<Label for="bank">Bank</Label>
					</div>
					<div class="flex items-center gap-2">
						<RadioGroup.Item {...addEntry.fields.account.as('text')} value="cash" id="cash" />
						<Label for="cash">Cash</Label>
					</div>
				</RadioGroup.Root>
				<DatetimeInput {...addEntry.fields.created.as('text')} />
			</div>
			<CategoryInput {entries} {defaultCategories} />
		</form>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action {...addEntry.buttonProps.enhance(enhance)} form="add-entry"
				>Save</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
