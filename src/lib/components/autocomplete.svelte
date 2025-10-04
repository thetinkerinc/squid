<script lang="ts">
let { value = $bindable(), options, ...rest }: Props = $props();

import { fade } from 'svelte/transition';

import { Input } from '$components/ui/input';

interface Props {
	value: string | undefined;
	options: string[];
	id?: string;
	placeholder?: string;
}

let elem = $state<HTMLInputElement | null>(null);
let open = $state<boolean>(false);
let isUsingKeyboard = $state<boolean>(false);
let highlighted = $state<number>(0);

function close() {
	setTimeout(() => {
		open = false;
		isUsingKeyboard = false;
		highlighted = 0;
	}, 100);
}

function changeHighlighted(delta: number) {
	if (!isUsingKeyboard) {
		isUsingKeyboard = true;
		return;
	}
	highlighted += delta;
	if (highlighted < 0) {
		highlighted = options.length - 1;
	}
	if (highlighted >= options.length) {
		highlighted = 0;
	}
}

function select() {
	value = options[highlighted];
	open = false;
	console.log(elem);
	elem?.blur();
}

function handleKeydown(evt: KeyboardEvent) {
	if (!open) {
		return;
	}
	const actions: { [key: string]: () => void } = {
		ArrowUp: () => changeHighlighted(-1),
		ArrowDown: () => changeHighlighted(1),
		Enter: select
	};
	if (actions[evt.key]) {
		evt.stopPropagation();
		evt.preventDefault();
		actions[evt.key]();
	}
}
</script>

<div class="relative">
	<Input
		type="text"
		autocomplete="off"
		onfocus={() => (open = true)}
		onblur={close}
		onkeydown={handleKeydown}
		{...rest}
		bind:ref={elem}
		bind:value />
	{#if open}
		<div
			class="absolute top-full flex w-full translate-y-2 flex-col gap-1 rounded-md border border-gray-200 bg-white p-2 text-left shadow-md"
			transition:fade={{ duration: 100 }}>
			{#each options as opt, idx}
				{@const hl = isUsingKeyboard && idx === highlighted}
				<button
					class={['rounded px-3 py-1 text-left text-sm hover:bg-gray-100', hl && 'bg-gray-100']}
					tabindex="-1"
					onclick={() => (value = opt)}>
					{opt}
				</button>
			{:else}
				<div class="text-sm text-gray-500 italic">No previously saved projects</div>
			{/each}
		</div>
	{/if}
</div>
