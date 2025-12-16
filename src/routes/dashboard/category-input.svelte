<script lang="ts">
let { entries, defaultCategories }: Props = $props();

import * as _ from 'radashi';

import { addEntry } from '$remote/data.remote';

import { Input } from '$components/ui/input';

import DescriptionInput from './description-input.svelte';

import type { Entry } from '$utils/db';

let category = $state<string>();
let addingCategory = $state<boolean>(false);

let categories = $derived(_.unique(defaultCategories.concat(entries.map((e) => e.category))));
let descriptions = $derived(
	_.unique(_.sift(entries.filter((e) => e.category === category).map((e) => e.description)))
);

interface Props {
	entries: Entry[];
	defaultCategories: string[];
}

function setCategory(cat: string) {
	return () => {
		if (category === cat) {
			category = undefined;
		} else {
			category = cat;
		}
		addingCategory = false;
	};
}

function addCategory() {
	if (addingCategory) {
		addingCategory = false;
	} else {
		addingCategory = true;
		category = undefined;
	}
}
</script>

<div class="flex flex-wrap gap-2">
	{#each categories as cat}
		{@const isSelected = cat === category}
		<button
			type="button"
			class={[
				'rounded border border-gray-200 px-4 py-1 capitalize',
				isSelected && 'bg-black text-white',
				!isSelected && 'bg-white hover:bg-gray-100'
			]}
			onclick={setCategory(cat)}>
			{cat}
		</button>
	{/each}
	<button
		type="button"
		class={[
			'rounded border border-gray-200 px-4 py-1',
			!addingCategory && 'bg-white hover:bg-gray-100',
			addingCategory && 'bg-black text-white'
		]}
		onclick={addCategory}>
		+
	</button>
</div>
<div class="my-2">
	{#each addEntry.fields.category.issues() as issue}
		<div class="text-sm text-red-600">{issue.message}</div>
	{/each}
</div>
{#if addingCategory}
	<Input class="mb-1" type="text" placeholder="New category" bind:value={category} />
{/if}
{#if category || addingCategory}
	<DescriptionInput options={descriptions} />
{/if}
<input class="hidden" {...addEntry.fields.category.as('text')} value={category} />
