<script lang="ts">
import { ClerkProvider } from 'svelte-clerk';
import { setDefaultOptions } from 'date-fns';
import { enUS as clerkEn } from '@clerk/localizations';
import { enUS as dateEn } from 'date-fns/locale';
import { getLocale } from '$paraglide/runtime';

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

<ClerkProvider localization={clerkLocale}>
	{@render children?.()}
</ClerkProvider>
