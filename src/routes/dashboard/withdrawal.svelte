<script lang="ts">
import { toast } from 'svelte-sonner';
import * as _ from 'radashi';

import * as m from '$paraglide/messages';
import { getEntriesAndPartners, addEntry } from '$remote/data.remote';
import * as schema from '$remote/schema';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';

import AmountInput from './amount-input.svelte';
import DescriptionInput from './description-input.svelte';

import { EntryType, AccountType } from '$types';

let open = $state(false);

let entriesAndPartners = $derived(await getEntriesAndPartners());
let entries = $derived(entriesAndPartners.entries.filter((e) => e.type === EntryType.withdrawal));
let descriptions = $derived(
	_.unique(_.sift(entries.filter((e) => e.category === 'withdrawal').map((e) => e.description)))
);

async function enhance({ form, submit }: Parameters<Parameters<typeof addEntry.enhance>[0]>[0]) {
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
			<Button {...props}>{m.add_entry_withrawal_label()}</Button>
		{/snippet}
	</AlertDialog.Trigger>
	<AlertDialog.Content class="border border-white/[0.8] bg-white/[0.3] backdrop-blur">
		<AlertDialog.Title>{m.add_entry_withrawal_title()}</AlertDialog.Title>
		<form id="add-entry" {...addEntry.preflight(schema.entry).enhance(enhance)}>
			<input class="hidden" {...addEntry.fields.type.as('text')} value={EntryType.withdrawal} />
			<input class="hidden" {...addEntry.fields.account.as('text')} value={AccountType.bank} />
			<input class="hidden" {...addEntry.fields.category.as('text')} value="withdrawal" />
			<AmountInput />
			<div class="my-2"></div>
			<DescriptionInput options={descriptions} />
		</form>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.add_entry_cancel()}</AlertDialog.Cancel>
			<AlertDialog.Action {...addEntry.buttonProps.enhance(enhance)} form="add-entry">
				{m.add_entry_save()}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
