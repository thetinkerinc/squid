<script lang="ts">
import { ClerkProvider } from 'svelte-clerk';
import { enUS, esMX } from '@clerk/localizations';
import { getLocale } from '$paraglide/runtime';
import dayjs from 'dayjs';

import { Toaster } from '$components/ui/sonner';

import Header from './header.svelte';
import Metaballs from './metaballs.svelte';

import 'dayjs/locale/es';

import '../app.css';

let { children } = $props();

dayjs.locale(getLocale());
const clerkLocale = {
	en: enUS,
	es: esMX
}[getLocale()];
</script>

<Toaster position="top-right" richColors closeButton />
<ClerkProvider localization={clerkLocale}>
	<div class="grid min-h-[100dvh] grid-rows-[auto_1fr]">
		<Header />
		<div id="bg" class="bg-linear-160 from-[#ffd3ac] to-[#ff8559] px-3 py-10">
			<Metaballs />
			<div class="relative">
				{@render children?.()}
			</div>
		</div>
	</div>
</ClerkProvider>
