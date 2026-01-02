<script lang="ts">
import { ClerkProvider } from 'svelte-clerk';
import { setDefaultOptions } from 'date-fns';
import { enUS as clerkEn } from '@clerk/localizations';
import { enUS as dateEn } from 'date-fns/locale';
import { getLocale } from '$paraglide/runtime';

import { Toaster } from '$components/ui/sonner';
import * as Tooltip from '$components/ui/tooltip';

import Lines from './lines.svelte';

import '../app.css';

let { children } = $props();

setDefaultOptions({
	locale: {
		en: dateEn
	}[getLocale()]
});
const clerkLocale = {
	en: clerkEn
}[getLocale()];
</script>

<Toaster position="top-right" richColors closeButton />
<ClerkProvider localization={clerkLocale}>
	<Tooltip.Provider>
		<div class="grid">
			<div class="cell-1 z-10 mb-10">
				{@render children()}
			</div>
			<div class="cell-1 fixed bottom-0 left-0 h-[120vh] w-full bg-[#fffde8]">
				{@render bg()}
			</div>
		</div>
	</Tooltip.Provider>
</ClerkProvider>

{#snippet bg()}
	<div class="relative h-full w-full">
		<div class="absolute bottom-0 w-full overflow-x-clip">
			<div class="grid origin-bottom scale-x-[1.8] scale-y-[4] md:scale-[1.5]">
				<Lines />
			</div>
		</div>
	</div>
{/snippet}
