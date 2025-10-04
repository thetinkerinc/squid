<script lang="ts">
let { value = $bindable() } = $props();

import dayjs from 'dayjs';
import { parseAbsoluteToLocal, now, getLocalTimeZone } from '@internationalized/date';
import { CalendarDays } from '@lucide/svelte';

import * as Popover from '$components/ui/popover';
import { Button } from '$components/ui/button';
import { Calendar } from '$components/ui/calendar';

import type { DateValue } from '@internationalized/date';

let selectedDate = $state<DateValue>(getInitialValue());

$effect(() => {
	value = selectedDate.toDate(getLocalTimeZone()).toISOString();
});

function getInitialValue() {
	if (!value) {
		return now(getLocalTimeZone());
	}
	let s = value;
	if (value instanceof Date) {
		s = value.toISOString();
	}
	return parseAbsoluteToLocal(s);
}
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button class="flex items-center gap-2" variant="outline" {...props}>
				<CalendarDays />
				<div>{dayjs(value || undefined).format('ddd, MMM D')}</div>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content>
		<Calendar type="single" bind:value={selectedDate} />
	</Popover.Content>
</Popover.Root>
