<script lang="ts">
import { SignedIn, SignedOut } from 'svelte-clerk';
import { useClerkContext } from 'svelte-clerk/client';
import { resolve } from '$app/paths';
import { Earth } from '@lucide/svelte';

import * as m from '$paraglide/messages';
import { getLocale, setLocale } from '$paraglide/runtime';

import * as Select from '$components/ui/select';
import { Button } from '$components/ui/button';

type Locale = 'en' | 'es';

const ctx = useClerkContext();

function handleLocale(l: string) {
	setLocale(l as Locale);
}

async function logout() {
	await ctx.clerk?.signOut();
}
</script>

<div class="flex items-center border-b border-black bg-beige px-4 py-2">
	<div class="flex-auto">
		<a href={resolve(ctx.auth.userId ? '/dashboard' : '/')} class="inline-block">
			<img src="/logo.png" alt="Hourglass" class="h-[40px] w-[30px]" />
		</a>
	</div>
	<div class="flex items-center gap-4 font-bold">
		<SignedIn>
			<button class="cursor-pointer hover:underline" onclick={logout}>{m.header_logout()}</button>
		</SignedIn>
		<SignedOut>
			<a class="hover:underline" href={resolve('/login')}>{m.header_login()}</a>
			<a class="hover:underline" href={resolve('/signup')}>{m.header_signup()}</a>
		</SignedOut>
		<Select.Root type="single" value={getLocale()} onValueChange={handleLocale}>
			<Select.Trigger>
				{#snippet child({ props })}
					<Button
						variant="ghost"
						{...props}
						class="border-none p-0! hover:cursor-pointer hover:bg-transparent">
						<Earth class="size-[20px] text-black" />
					</Button>
				{/snippet}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="en">en</Select.Item>
				<Select.Item value="es">es</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
</div>
