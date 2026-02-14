<script lang="ts">
import { onMount } from 'svelte';
import { Tag, Plus, X } from '@lucide/svelte';

import * as m from '$paraglide/messages';
import { addEntry } from '$remote/data.remote';

import { Input } from '$components/ui/input';

onMount(() => {
	addEntry.fields.tags.set([]);
});

function add() {
	const tags = addEntry.fields.tags.value();
	addEntry.fields.tags.set([...tags, { title: '', content: '' }]);
}

function rm(idx: number) {
	return () => {
		const tags = addEntry.fields.tags.value();
		tags.splice(idx, 1);
		addEntry.fields.tags.set(tags);
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
		{#each addEntry.fields.tags.value() as _tag, idx}
			<div class="flex items-center gap-1">
				<Input
					{...addEntry.fields.tags[idx].title.as('text')}
					placeholder={m.tags_title_placeholder()} />
				<Input
					{...addEntry.fields.tags[idx].content.as('text')}
					placeholder={m.tags_content_placeholder()} />
				<button class="cursor-pointer" type="button" onclick={rm(idx)}>
					<X />
				</button>
			</div>
		{/each}
	</div>
</div>
