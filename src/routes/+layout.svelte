<script lang="ts">
import { ClerkProvider } from 'svelte-clerk';
import { setDefaultOptions } from 'date-fns';
import { enUS as clerkEn } from '@clerk/localizations';
import { enUS as dateEn } from 'date-fns/locale';
import { getLocale } from '$paraglide/runtime';

import { Toaster } from '$components/ui/sonner';
import * as Tooltip from '$components/ui/tooltip';

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
				<svg
					class="cell-1 waves origin-bottom translate-x-[200px] scale-x-[1.5] scale-y-[1.4] lg:translate-x-[100px] lg:scale-x-[1] lg:scale-y-[1.8]"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 1440 320">
					<path
						fill="#e4d5b7"
						fill-opacity="1"
						d="M0,224L30,186.7C60,149,120,75,180,69.3C240,64,300,128,360,160C420,192,480,192,540,202.7C600,213,660,235,720,218.7C780,203,840,149,900,149.3C960,149,1020,203,1080,229.3C1140,256,1200,256,1260,234.7C1320,213,1380,171,1410,149.3L1440,128L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z">
					</path>
				</svg>
				<svg class="cell-1 waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<path
						fill="#fff0db"
						fill-opacity="1"
						d="M0,288L34.3,256C68.6,224,137,160,206,144C274.3,128,343,160,411,192C480,224,549,256,617,234.7C685.7,213,754,139,823,117.3C891.4,96,960,128,1029,128C1097.1,128,1166,96,1234,74.7C1302.9,53,1371,43,1406,37.3L1440,32L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z">
					</path>
				</svg>
				<svg class="cell-1 waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<path
						fill="#faf0e6"
						fill-opacity="1"
						d="M0,128L34.3,128C68.6,128,137,128,206,154.7C274.3,181,343,235,411,245.3C480,256,549,224,617,224C685.7,224,754,256,823,272C891.4,288,960,288,1029,261.3C1097.1,235,1166,181,1234,181.3C1302.9,181,1371,235,1406,261.3L1440,288L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z">
					</path>
				</svg>
			</div>
		</div>
	</div>
{/snippet}

<style>
.waves {
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2));
}
</style>
