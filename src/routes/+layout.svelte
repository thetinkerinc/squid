<script lang="ts">
let { children }: Props = $props();

import { ParaglideJS } from '@inlang/paraglide-sveltekit';

import { i18n } from '$lib/i18n';

import type { Snippet } from 'svelte';

interface Props {
	children: Snippet;
}

import '../app.css';
</script>

<ParaglideJS {i18n}>
	<div class="relative min-h-[100vh] w-full bg-[#fffde8]">
		<div class="relative z-10">
			{@render children()}
		</div>
		<div class="absolute bottom-0 left-0 w-full overflow-x-clip">
			<div class="grid origin-bottom scale-x-[1.8] scale-y-[4] md:scale-[1.2]">
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
</ParaglideJS>

<style>
.waves {
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2));
}
</style>
