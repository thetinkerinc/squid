<script lang="ts">
let { entryType }: Props = $props();

import * as _ from 'radashi';
import { Tag, Plus, X } from '@lucide/svelte';

import * as m from '$paraglide/messages';
import { getTags, addEntry } from '$remote/data.remote';

import Autocomplete from '$components/autocomplete.svelte';

import type { EntryValue } from '$types';

interface Props {
	entryType: EntryValue;
}

type Tag = {
	id: string;
	title: string;
	content: string;
};

let tags = $state<Tag[]>([]);

const existingTags = $derived(await getTags({ type: entryType }));
const titles = $derived(Object.keys(existingTags));

function add() {
	tags.push({ id: _.uid(8), title: '', content: '' });
}

function rm(idx: number) {
	return () => {
		tags.splice(idx, 1);
	};
}
</script>

<div class="mt-3">
	<div class="flex items-center gap-1">
		<Tag />
		<button class="cursor-pointer" type="button" onclick={add}>
			<Plus />
		</button>
	</div>
	<div class="my-1 flex flex-col gap-1">
		{#each tags as tag, idx (tag.id)}
			{@const title = tag.title}
			{@const contents = existingTags[title] ?? []}
			<div class="flex items-center gap-1">
				<Autocomplete
					options={titles}
					placeholder={m.tags_title_placeholder()}
					invalid={addEntry.fields.tags[idx].title.as('text')['aria-invalid']}
					onchange={(v) => (tag.title = v ?? '')}>
				</Autocomplete>
				<Autocomplete
					options={contents}
					placeholder={m.tags_content_placeholder()}
					invalid={addEntry.fields.tags[idx].content.as('text')['aria-invalid']}
					onchange={(v) => (tag.content = v ?? '')}>
				</Autocomplete>
				<button class="cursor-pointer" type="button" onclick={rm(idx)}>
					<X />
				</button>
			</div>
			<input class="hidden" {...addEntry.fields.tags[idx].title.as('text')} value={tag.title} />
			<input class="hidden" {...addEntry.fields.tags[idx].content.as('text')} value={tag.content} />
		{/each}
	</div>
	<div>
		{#each addEntry.fields.tags.issues() as issue}
			<div class="text-sm text-red-400">{issue.message}</div>
		{/each}
	</div>
</div>
