<script lang="ts">
let { options, value = $bindable() }: Props = $props();

import { Input } from '$components/ui/input';

interface Props {
	options: string[];
	value: string;
}

let keepOpen = false;

let open = $state<boolean>(false);
let highlighted = $state<number>(0);

let filtered = $derived(filterOptions());

$effect(() => {
	const elem = document.getElementById('description');
	if (!elem) {
		return;
	}
	const stopper = (evt: KeyboardEvent) => {
		if (!open || evt.key !== 'Escape') {
			return;
		}
		open = false;
		evt.stopPropagation();
		evt.preventDefault();
	};
	const opener = (evt: KeyboardEvent) => {
		if (evt.key === 'Escape') {
			return;
		}
		open = filtered.length !== 0;
	};
	elem.addEventListener('keydown', stopper, true);
	elem.addEventListener('keyup', opener);
});

function filterOptions() {
	if (!value) {
		return options;
	}
	return options.filter((o) => o.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
}

function focus() {
	keepOpen = true;
	setTimeout(() => {
		document.getElementById('description')?.focus();
	}, 10);
}

function close() {
	setTimeout(() => {
		if (keepOpen) {
			keepOpen = false;
			return;
		}
		open = false;
	}, 50);
}

function handleKeydown(evt: KeyboardEvent) {
	if (!open) {
		return;
	}
	const actions: Record<string, () => void> = {
		ArrowUp: changeHighlighted.bind(null, -1),
		ArrowDown: changeHighlighted.bind(null, 1),
		Enter: select
	};
	if (actions[evt.key]) {
		stopEvent(evt);
		actions[evt.key]();
	}
}

function changeHighlighted(dir: number) {
	highlighted = wrap(highlighted + dir, 0, filtered.length - 1);
}

function select(idx?: number) {
	if (idx != null) {
		value = filtered[idx];
	} else {
		value = filtered[highlighted];
	}
	close();
}

function wrap(num: number, min: number, max: number) {
	if (num > max) {
		return min;
	}
	if (num < min) {
		return max;
	}
	return num;
}

function stopEvent(evt: Event) {
	evt.stopPropagation();
	evt.preventDefault();
}
</script>

<div class="relative">
	<Input
		id="description"
		placeholder="Description"
		autocomplete="off"
		onfocus={() => (open = filtered.length !== 0)}
		onblur={close}
		onkeydown={handleKeydown}
		bind:value />
	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute top-full z-10 flex w-full translate-y-2 flex-col gap-1 rounded-md border border-gray-200 bg-white p-2 text-left shadow-md"
			onmousedown={focus}>
			{#each filtered as opt, idx}
				{@const hl = idx === highlighted}
				<button
					class={['rounded px-2 py-1 text-left capitalize hover:bg-gray-100', hl && 'bg-gray-100']}
					tabindex="-1"
					onmouseenter={() => (highlighted = idx)}
					onclick={() => select(idx)}>
					{opt}
				</button>
			{/each}
		</div>
	{/if}
</div>
