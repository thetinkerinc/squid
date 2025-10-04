<script lang="ts">
import { flip } from 'svelte/animate';
import { page } from '$app/state';
import { invalidate } from '$app/navigation';
import dayjs from 'dayjs';
import * as v from 'valibot';
import * as _ from 'radashi';

import error from '$utils/error';

import * as m from '$paraglide/messages';
import * as remote from './data.remote';
import schema from './schema';

import { ScrollArea } from '$components/ui/scroll-area';
import * as AlertDialog from '$components/ui/alert-dialog';
import DatePicker from '$components/date-picker.svelte';
import HoursPicker from '$components/hours-picker.svelte';
import Autocomplete from '$components/autocomplete.svelte';

import DateRange from './date-range.svelte';
import CustomDateRange from './custom-date-range.svelte';
import ProjectSelect from './project-select.svelte';

import type { Entry } from '$utils/prisma';
import type { PageData } from './$types';

let editing = $state<boolean>(false);
let id = $state<string>('');
let date = $state<string>('');
let hours = $state<number>(0);
let project = $state<string>();

let data = $derived(page.data as PageData);
let hoursWorked = $derived(_.sum(data.entries, (e) => e.hours));

function edit(entry: Entry) {
	return () => {
		id = entry.id;
		date = entry.date.toISOString();
		hours = entry.hours;
		project = entry.project ?? undefined;
		editing = true;
	};
}

async function save() {
	try {
		const entry = v.parse(schema.updateEntry, {
			id,
			data: {
				date,
				hours,
				project
			}
		});
		await remote.updateEntry(entry);
		await invalidate('dashboard');
		editing = false;
	} catch (err) {
		error.notify(err);
	}
}
</script>

<div class="text-xl font-bold">{m.breakdown_hours_worked()}: {hoursWorked}</div>
<div class="flex items-center gap-2">
	<div>{dayjs(data.start).format('MMM D, YYYY')}</div>
	<div>-</div>
	<div>{dayjs(data.end).format('MMM D, YYYY')}</div>
</div>
<div class="my-2 flex flex-wrap items-center gap-1">
	<DateRange>
		{m.breakdown_this_month()}
	</DateRange>
	<DateRange
		period="last-month"
		start={dayjs().subtract(1, 'month').startOf('month').toISOString()}
		end={dayjs().subtract(1, 'month').endOf('month').toISOString()}>
		{m.breakdown_last_month()}
	</DateRange>
	<DateRange
		period="ytd"
		start={dayjs().startOf('year').toISOString()}
		end={dayjs().endOf('year').toISOString()}>
		{m.breakdown_ytd()}
	</DateRange>
	<CustomDateRange />
	<ProjectSelect />
</div>
<ScrollArea type="auto">
	<div class="max-h-[300px]">
		{#each data.entries as entry (entry.id)}
			<button
				class="mb-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-1 text-left last:mb-0 hover:bg-gray-100"
				onclick={edit(entry)}
				animate:flip={{ duration: 200 }}>
				<div class="flex items-center gap-4">
					<div>{dayjs(entry.date).format('dddd MMM D')}</div>
					<div>-</div>
					<div>{m.breakdown_entry_hours({ hours: entry.hours })}</div>
				</div>
				<div class="text-gray-500 italic">{entry.project ?? m.breakdown_entry_no_project()}</div>
			</button>
		{/each}
	</div>
</ScrollArea>
<AlertDialog.Root bind:open={editing}>
	<AlertDialog.Content>
		<div>
			<DatePicker bind:value={date} />
		</div>
		<HoursPicker bind:value={hours} />
		<div class="max-w-[350px]">
			<Autocomplete
				placeholder={m.project_select_placeholder()}
				options={data.projects}
				bind:value={project} />
		</div>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.breakdown_edit_cancel()}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={save}>{m.breakdown_edit_save()}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
