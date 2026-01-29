<script lang="ts">
let { invitations, partners }: Props = $props();

import { toast } from 'svelte-sonner';
import { UserPlus, Check, X } from '@lucide/svelte';

import * as m from '$paraglide/messages';
import { invite, respond } from '$remote/data.remote';

import formatter from '$utils/formatter';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';

import type { Invitation } from '$types';

interface Props {
	invitations: Invitation[];
	partners: string[];
}

let open = $state<boolean>(false);

async function enhance({ form, submit }: EnhanceParams<typeof invite.enhance>) {
	try {
		await submit();
		open = false;
		form.reset();
		toast.success(m.partner_add_success());
	} catch (_err) {
		toast.error(m.partner_add_error());
	}
}
</script>

<div class="flex flex-wrap items-center gap-3">
	<AlertDialog.Root bind:open>
		<AlertDialog.Trigger>
			{#snippet child({ props })}
				<Button {...props}>
					<UserPlus />
					{m.partner_add_button()}
				</Button>
			{/snippet}
		</AlertDialog.Trigger>
		<AlertDialog.Content class="border border-white/[0.8] bg-white/[0.3] backdrop-blur">
			<AlertDialog.Header>
				<AlertDialog.Title>{m.partner_add_title()}</AlertDialog.Title>
				<AlertDialog.Description>
					{m.partner_add_description()}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<form id="invite-partner" {...invite.enhance(enhance)}>
				<Input placeholder={m.partner_add_email_placeholder()} {...invite.fields.to.as('email')} />
			</form>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action form="invite-partner">
					{m.partner_add_invite()}
				</AlertDialog.Action>
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
		{#each invitations as invitation (invitation.id)}
			<div class="inline-block rounded bg-white/[0.7] px-4 py-1 shadow">
				<div class="underline">{m.invitation_title()}</div>
				<div>{m.invitation_from()} {invitation.fromEmail}</div>
				<div class="flex items-center gap-2">
					<div class="mr-4 flex-auto text-gray-500">
						{m.invitation_sent()}
						{formatter.date(invitation.sent)}
					</div>
					<form {...respond.for('accept')}>
						<input
							class="hidden"
							{...respond.for('accept').fields.id.as('text')}
							value={invitation.id} />
						<input
							class="hidden"
							{...respond.for('accept').fields.accepted.as('text')}
							value={true} />
						<button class="cursor-pointer text-green-500">
							<Check />
						</button>
					</form>
					<form {...respond.for('decline')}>
						<input
							class="hidden"
							{...respond.for('accept').fields.id.as('text')}
							value={invitation.id} />
						<input
							class="hidden"
							{...respond.for('decline').fields.accepted.as('text')}
							value={false} />
						<button class="cursor-pointer text-red-500">
							<X />
						</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
{/if}
