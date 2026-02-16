<script lang="ts">
let { options }: Props = $props();

import * as m from '$paraglide/messages';
import { addEntry } from '$remote/data.remote';

import Autocomplete from '$components/autocomplete.svelte';

interface Props {
	options: string[];
}
</script>

<Autocomplete placeholder={m.add_entry_description_placeholder()} {options}>
	{#snippet form(value)}
		<input {...addEntry.fields.description.as('text')} {value} />
	{/snippet}
</Autocomplete>
