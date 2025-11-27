<script lang="ts">
import { invalidateAll } from '$app/navigation';

import * as remote from '$remote/data.remote';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';

import AmountInput from './amount-input.svelte';

import { CurrencyType, EntryType, AccountType } from '$prisma/enums';

let open = $state<boolean>(false);
let amount = $state<number>();
let enteredAmount = $state<number>();
let enteredCurrency = $state<CurrencyType>(CurrencyType.CAD);
let description = $state<string>();

let disabled = $derived(amount == null);

function reset() {
	amount = undefined;
	enteredAmount = undefined;
	enteredCurrency = CurrencyType.CAD;
	description = undefined;
}

async function save() {
	if (amount == null || enteredAmount == null) {
		return;
	}
	await remote.addEntry({
		type: EntryType.withdrawal,
		account: AccountType.bank,
		amount,
		enteredAmount,
		enteredCurrency,
		category: 'withdrawal',
		description
	});
	await invalidateAll();
	open = false;
}
</script>

<AlertDialog.Root onOpenChange={reset} bind:open>
	<AlertDialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>Withdrawal</Button>
		{/snippet}
	</AlertDialog.Trigger>
	<AlertDialog.Content class="border border-white/[0.8] bg-white/[0.3] backdrop-blur">
		<AlertDialog.Title>Withdraw cash</AlertDialog.Title>
		<AmountInput bind:amount bind:enteredAmount bind:enteredCurrency />
		<Input type="text" placeholder="Description" bind:value={description} />
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action {disabled} onclick={save}>Save</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
