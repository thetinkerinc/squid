<script lang="ts">
let { onselect } = $props();

import { now, getLocalTimeZone } from '@internationalized/date';
import { SquarePen } from '@lucide/svelte';

import * as AlertDialog from '$components/ui/alert-dialog';
import { Calendar } from '$components/ui/calendar';

const today = now(getLocalTimeZone());

let open = $state(false);
let date = $state(today);
let hour = $state(today.hour % 12 || 12);
let minute = $state(today.minute);
let afternoon = $state(today.hour >= 12);

function setTime() {
	let h = hour;
	if (afternoon) {
		h += 12;
	}
	h %= 24;
	const newDate = date.set({
		hour: h,
		minute,
		second: 0,
		millisecond: 0
	});
	onselect(newDate.toDate());
	open = false;
}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger>
		<SquarePen />
	</AlertDialog.Trigger>
	<AlertDialog.Content class="w-auto">
		<div class="mx-auto flex items-center gap-1">
			<input
				class="max-w-[4rem] rounded border border-gray-300"
				type="number"
				min={1}
				max={12}
				bind:value={hour} />
			<div class="text-lg">:</div>
			<input
				class="max-w-[4rem] rounded border border-gray-300"
				type="number"
				min={0}
				max={59}
				bind:value={minute} />
			<div class="flex flex-col">
				<button
					class={['rounded px-3 py-1 transition', !afternoon && 'bg-indigo-100']}
					onclick={() => (afternoon = false)}>am</button>
				<button
					class={['rounded px-3 py-1 transition', afternoon && 'bg-indigo-100']}
					onclick={() => (afternoon = true)}>pm</button>
			</div>
		</div>
		<Calendar
			class="rounded border border-gray-300"
			type="single"
			maxValue={today}
			bind:value={date} />
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={setTime}>Set</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
