<script lang="ts">
import { page } from '$app/state';
import local from '@thetinkerinc/isolocal';
import { Search, X } from '@lucide/svelte';

import { Input } from '$components/ui/input';

let elem = $state<HTMLInputElement | null>(null);
let search = $state(page.url.searchParams.get('search') ?? '');

$effect(() => {
	local.search = search;
});

function clear() {
	search = '';
	focus();
}

function focus() {
	elem?.focus();
}
</script>

<div class="flex items-center gap-1 rounded bg-white/70 px-2">
	<button onclick={focus}>
		<Search />
	</button>
	<Input class="border-none bg-transparent p-0 shadow-none" bind:value={search} bind:ref={elem} />
	<button class="cursor-pointer" onclick={clear}>
		<X />
	</button>
</div>
