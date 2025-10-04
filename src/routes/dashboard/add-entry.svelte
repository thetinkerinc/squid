<script lang="ts">
import { page } from '$app/state';
import { invalidate } from '$app/navigation';
import * as v from 'valibot';

import error from '$utils/error';

import * as m from '$paraglide/messages';
import * as remote from './data.remote';
import schema from './schema';

import DatePicker from '$components/date-picker.svelte';
import HoursPicker from '$components/hours-picker.svelte';
import Autocomplete from '$components/autocomplete.svelte';
import { Button } from '$components/ui/button';

import type { PageData } from './$types';

let date = $state<string>(new Date().toISOString());
let hours = $state<number>(0);
let project = $state<string>();

let data = $derived(page.data as PageData);

async function addEntry() {
	try {
		const entry = v.parse(schema.entry, {
			date,
			hours,
			project
		});
		await remote.addEntry(entry);
		date = new Date().toISOString();
		hours = 0;
		project = undefined;
		await invalidate('dashboard');
	} catch (err) {
		error.notify(err);
	}
}
</script>

<div class="flex flex-col gap-2">
	<div class="text-xl font-bold">{m.add_entry_title()}</div>
	<div>
		<DatePicker bind:value={date} />
	</div>
	<HoursPicker bind:value={hours} />
	<div class="max-w-[350px]">
		<Autocomplete placeholder="Project" options={data.projects} bind:value={project} />
	</div>
	<div>
		<Button onclick={addEntry}>{m.add_entry_button()}</Button>
	</div>
</div>
