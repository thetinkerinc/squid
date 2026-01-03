<script lang="ts">
import { getLocale, setLocale, locales } from '$paraglide/runtime';

import Languages from '@lucide/svelte/icons/languages';

import * as Select from '$components/ui/select';
import { Button } from '$components/ui/button';

import type { Locale } from '$paraglide/runtime';
</script>

<Select.Root type="single" value={getLocale()} onValueChange={(l) => setLocale(l as Locale)}>
	<Select.Trigger>
		{#snippet child({ props })}
			<Button
				variant="ghost"
				{...props}
				class="border-none p-0! hover:cursor-pointer hover:bg-transparent">
				<Languages class="size-[22px] text-black" />
			</Button>
		{/snippet}
	</Select.Trigger>
	<Select.Content>
		{#each locales as l}
			<Select.Item value={l}>{l}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
