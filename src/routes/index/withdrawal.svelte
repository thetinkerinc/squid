<script lang="ts">
import { invalidateAll } from '$app/navigation';

import { client } from '$trpc/client';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';

import AmountInput from './amount-input.svelte';

import type { Currency } from '$utils/currencies';

let open = $state<boolean>(false);
let amount = $state<number>();
let enteredAmount = $state<number>();
let enteredCurrency = $state<Currency>('CAD');
let description = $state<string>();

let disabled = $derived(amount == null);

async function save() {
	if (amount == null || enteredAmount == null) {
		return;
	}
	await client.entry.create.mutate({
		type: 'withdrawal',
		account: 'bank',
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

<AlertDialog.Root bind:open>
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
