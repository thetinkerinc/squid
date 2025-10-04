<script lang="ts">
let { value = $bindable() } = $props();

import { fade } from 'svelte/transition';
import { ChevronLeft, ChevronRight } from '@lucide/svelte';

import { Button } from '$components/ui/button';

let atStart = $state<boolean>(true);
let atEnd = $state<boolean>(false);
let container = $state<HTMLDivElement>();

let hasHalfSelected = $derived<boolean>(value !== Math.floor(value));

function isHourSelected(h: number) {
	return value === h || value === h + 0.5;
}

function handleHour(h: number) {
	return () => {
		value = h + +hasHalfSelected * 0.5;
	};
}

function handleHalf() {
	if (hasHalfSelected) {
		value -= 0.5;
	} else {
		value += 0.5;
	}
}

function handleWheel(evt: WheelEvent) {
	if (!container) {
		return;
	}
	evt.preventDefault();
	evt.stopPropagation();
	container.scrollLeft += evt.deltaY;
}

function handleScroll() {
	if (!container) {
		return;
	}
	atStart = container.scrollLeft <= 10;
	atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
}
</script>

<div class="flex items-center gap-3">
	<div class="relative overflow-hidden rounded-lg">
		{#if !atStart}
			<div
				class="pointer-events-none absolute left-0 grid h-full w-[40px] content-center justify-start"
				transition:fade>
				<ChevronLeft />
			</div>
		{/if}
		{#if !atEnd}
			<div
				class="pointer-events-none absolute right-0 grid h-full w-[40px] content-center justify-end"
				transition:fade>
				<ChevronRight />
			</div>
		{/if}
		<div
			class="flex max-w-[250px] items-center gap-1 overflow-x-auto scrollbar-none"
			onwheel={handleWheel}
			onscroll={handleScroll}
			bind:this={container}>
			{#each { length: 12 }, h}
				{@const hour = h + 1}
				<Button variant={isHourSelected(hour) ? 'default' : 'outline'} onclick={handleHour(hour)}>
					{hour}
				</Button>
			{/each}
		</div>
	</div>
	<Button variant={hasHalfSelected ? 'default' : 'outline'} onclick={handleHalf}>+.5</Button>
</div>
