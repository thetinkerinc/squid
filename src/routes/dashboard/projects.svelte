<script lang="ts">
import { onMount } from 'svelte';
import local from '@thetinkerinc/isolocal';
import { useClerkContext } from 'svelte-clerk/client';

import { getProjects } from '$remote/data.remote';

import * as Select from '$components/ui/select';

onMount(() => {
	if (local.project) {
		return;
	}
	local.project = projects[0].id;
});

const ctx = useClerkContext();

const projects = $derived(await getProjects());
const selected = $derived(projects.find((p) => p.id === local.project));
</script>

<Select.Root type="single" value={selected?.id} onValueChange={(p) => (local.project = p)}>
	<Select.Trigger class="capitalize">{selected?.name ?? projects[0].name}</Select.Trigger>
	<Select.Content>
		{#each projects as project}
			<Select.Item value={project.id}>
				<div class="capitalize">
					{project.name}
				</div>
				{#if project.user !== ctx.user?.id}
					<div>
						({project.email})
					</div>
				{/if}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
