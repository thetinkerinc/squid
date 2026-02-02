<script lang="ts">
let { defaultCategories, entryType, canBePending = false, title, label }: Props = $props();

import { toast } from 'svelte-sonner';

import * as m from '$paraglide/messages';
import { getEntriesAndPartners, addEntry } from '$remote/data.remote';
import * as schema from '$remote/schema';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Label } from '$components/ui/label';
import { Checkbox } from '$components/ui/checkbox';
import * as RadioGroup from '$components/ui/radio-group';
import AmountInput from '$components/amount-input.svelte';

import DatetimeInput from './datetime-input.svelte';
import CategoryInput from './category-input.svelte';

import type { EntryValue } from '$types';

interface Props {
	defaultCategories: string[];
	entryType: EntryValue;
	canBePending?: boolean;
	title: string;
	label: string;
}

let open = $state<boolean>(false);

let entriesAndPartners = $derived(await getEntriesAndPartners());
let entries = $derived(entriesAndPartners.entries.filter((e) => e.type === entryType));

async function enhance({ form, submit }: EnhanceParams<typeof addEntry.enhance>) {
	try {
		await submit();
		form.reset();
		open = false;
	} catch (_err) {
		toast.error(m.add_entry_error());
	}
}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>{label}</Button>
		{/snippet}
	</AlertDialog.Trigger>
	<AlertDialog.Content class="border border-white/[0.8] bg-white/[0.3] backdrop-blur">
		<AlertDialog.Title>{title}</AlertDialog.Title>
		<form {...addEntry.preflight(schema.entry).enhance(enhance)} id="add-entry">
			<input class="hidden" {...addEntry.fields.type.as('text')} value={entryType} />
			<AmountInput />
			<div class="my-2 flex flex-wrap items-center gap-4">
				<RadioGroup.Root
					class="flex flex-auto flex-wrap items-center gap-4"
					name={addEntry.fields.account.as('text').name}>
					<div class="flex items-center gap-2">
						<RadioGroup.Item {...addEntry.fields.account.as('text')} value="bank" id="bank" />
						<Label for="bank">{m.account_bank()}</Label>
					</div>
					<div class="flex items-center gap-2">
						<RadioGroup.Item {...addEntry.fields.account.as('text')} value="cash" id="cash" />
						<Label for="cash">{m.account_cash()}</Label>
					</div>
				</RadioGroup.Root>
				<DatetimeInput {...addEntry.fields.created.as('text')} />
			</div>
			{#if canBePending}
				<div class="my-2 flex items-center gap-2">
					<Checkbox {...addEntry.fields.pending.as('checkbox')} type="button" id="pending" />
					<Label for="pending">{m.entry_pending()}</Label>
				</div>
			{:else}
				<input class="hidden" {...addEntry.fields.pending.as('checkbox')} value={false} />
			{/if}
			<CategoryInput {entries} {defaultCategories} />
		</form>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.add_entry_cancel()}</AlertDialog.Cancel>
			<AlertDialog.Action form="add-entry">
				{m.add_entry_save()}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
