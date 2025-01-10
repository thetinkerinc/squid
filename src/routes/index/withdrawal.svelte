<script lang="ts">
import { invalidateAll } from '$app/navigation';

import { client } from '$trpc/client';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';

let open = $state<boolean>(false);
let amount = $state<number>();
let description = $state<string>();

let disabled = $derived(amount == null);

async function save() {
	if (amount == null) {
		return;
	}
	await client.entry.create.mutate({
		type: 'withdrawal',
		account: 'bank',
		amount,
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
		<Input type="number" min={0} placeholder="Amount" bind:value={amount} />
		<Input type="text" placeholder="Description" bind:value={description} />
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action {disabled} onclick={save}>Save</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
