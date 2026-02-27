<script lang="ts">
import { onMount, tick } from 'svelte';
import local from '@thetinkerinc/isolocal';
import events from '@thetinkerinc/sprout/events';
import { makeEnhance } from '@thetinkerinc/sprout/forms';
import { useClerkContext } from 'svelte-clerk/client';
import { ChevronDown, Pencil, Check, X } from '@lucide/svelte';

import { getProjects, addProject, editProject } from '$remote/data.remote';

import { Input } from '$components/ui/input';

onMount(() => {
	if (local.project) {
		return;
	}
	local.project = projects[0].id;
});

const ctx = useClerkContext();

let open = $state(false);
let adding = $state(false);
let editing = $state(false);
let elem = $state<HTMLInputElement | null>(null);

const projects = $derived(await getProjects());
const selected = $derived(projects.find((p) => p.id === local.project));

const addEnhance = makeEnhance(addProject, {
	onSuccess: () => (adding = false)
});
const editEnhance = makeEnhance(addProject, {
	onSuccess: () => (editing = false)
});

async function edit() {
	editing = true;
	await tick();
	elem?.focus();
}

async function add() {
	adding = true;
	await tick();
	elem?.focus();
}
</script>

<svelte:window onclick={() => (open = false)} />
<div class="relative">
	{#if editing}
		<form
			class="flex items-center gap-1"
			onclick={events.stopPropagation()}
			{...editProject.enhance(editEnhance)}>
			<input
				class="hidden"
				{...editProject.fields.id.as('text')}
				value={selected?.id ?? projects[0]?.id} />
			<Input
				bind:ref={elem}
				{...editProject.fields.name.as('text')}
				value={selected?.name ?? projects[0].name} />
			<button class="cursor-pointer text-green-500" type="submit">
				<Check size={18} />
			</button>
			<button class="cursor-pointer text-red-500" type="button" onclick={() => (editing = false)}>
				<X size={18} />
			</button>
		</form>
	{:else}
		<div class="flex items-center rounded border border-gray-200 bg-white px-2 py-1">
			<button class="pr-2 capitalize" onclick={events.stop(() => (open = !open))}>
				{selected?.name ?? projects[0].name}
			</button>
			<button class="text-gray-500" onclick={edit}>
				<Pencil size={17} />
			</button>
			<button class="pl-4 text-gray-400" onclick={events.stop(() => (open = !open))}>
				<ChevronDown size={18} />
			</button>
		</div>
	{/if}
	{#if open}
		<div
			class="absolute top-full left-0 z-10 flex translate-y-[5px] flex-col gap-1 rounded border border-gray-200 bg-white p-2">
			{#each projects as project}
				<button
					class="flex items-center gap-2 rounded p-1 text-left hover:bg-gray-100"
					onclick={() => (local.project = project.id)}>
					<div class="flex-auto">
						<div class="capitalize">
							{project.name}
						</div>
						{#if project.user !== ctx.user?.id}
							<div class="text-sm text-gray-500">
								({project.email})
							</div>
						{/if}
					</div>
					{#if project.id === selected?.id}
						<Check size={18} />
					{/if}
				</button>
			{/each}
			{#if adding}
				<form
					class="flex items-center gap-1"
					onclick={events.stopPropagation()}
					{...addProject.enhance(addEnhance)}>
					<Input class="h-auto" bind:ref={elem} {...addProject.fields.name.as('text')} />
					<button class="cursor-pointer text-green-500" type="submit">
						<Check size={18} />
					</button>
					<button
						class="cursor-pointer text-red-500"
						type="button"
						onclick={() => (adding = false)}>
						<X size={18} />
					</button>
				</form>
			{:else}
				<button class="cursor-pointer" onclick={events.stop(add)}> + </button>
			{/if}
		</div>
	{/if}
</div>
