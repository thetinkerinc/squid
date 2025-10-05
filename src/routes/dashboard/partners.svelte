<script lang="ts">
let { invitations, partners }: Props = $props();

import { invalidateAll } from '$app/navigation';
import { toast } from 'svelte-sonner';
import { UserPlus, Check, X } from '@lucide/svelte';

import * as remote from '$remote/data.remote';

import formatter from '$utils/formatter';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';

import type { Invitation } from '$prisma/client';

interface Props {
	invitations: Invitation[];
	partners: string[];
}

let open = $state<boolean>(false);
let email = $state<string>('');

function reset() {
	email = '';
}

async function invite() {
	if (email === '') {
		return;
	}
	try {
		await remote.invite(email);
		toast.success('Invitation sent!');
		open = false;
	} catch (_err) {
		const msg =
			"We couldn't send your invitation. Make " +
			'sure your partner has an account and that ' +
			'you spelled their email correctly.';
		toast.error(msg);
	}
}

function respond(id: string, accepted: boolean) {
	return async () => {
		await remote.respond({
			id,
			accepted
		});
		await invalidateAll();
	};
}
</script>

<div class="flex flex-wrap items-center gap-3">
	<AlertDialog.Root onOpenChange={reset} bind:open>
		<AlertDialog.Trigger>
			{#snippet child({ props })}
				<Button {...props}>
					<UserPlus />
					Add a partner
				</Button>
			{/snippet}
		</AlertDialog.Trigger>
		<AlertDialog.Content class="border border-white/[0.8] bg-white/[0.3] backdrop-blur">
			<AlertDialog.Header>
				<AlertDialog.Title>Add a partner to your account</AlertDialog.Title>
				<AlertDialog.Description>
					Partners will be able to see and edit all information you've added up to this point.
					Likewise, you'll be able to see and edit any information they have added.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<Input type="email" placeholder="Email" bind:value={email} />
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action onclick={invite}>Invite</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
	{#each partners as partner}
		<div class="inline-block rounded bg-white/[0.7] px-4 py-1 shadow">
			{partner}
		</div>
	{/each}
</div>
{#if invitations.length}
	<div class="mt-3 flex flex-wrap items-center gap-3">
		{#each invitations as invitation}
			<div class="inline-block rounded bg-white/[0.7] px-4 py-1 shadow">
				<div class="underline">Invitation</div>
				<div>From {invitation.fromEmail}</div>
				<div class="flex items-center gap-2">
					<div class="mr-4 flex-auto text-gray-500">Sent {formatter.date(invitation.sent)}</div>
					<button class="cursor-pointer text-green-500" onclick={respond(invitation.id, true)}>
						<Check />
					</button>
					<button class="cursor-pointer text-red-500" onclick={respond(invitation.id, false)}>
						<X />
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
