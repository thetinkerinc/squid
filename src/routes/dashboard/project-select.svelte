<script lang="ts">
import { page } from '$app/state';

import navigation from '$utils/navigation';

import * as m from '$paraglide/messages';

import * as Select from '$components/ui/select';

let open = $state<boolean>(false);
let value = $state<string | undefined>(page.url.searchParams.get('project') ?? undefined);

async function handleProject(project: string) {
	open = false;
	await navigation.updateSearch({
		project
	});
}
</script>

<Select.Root type="single" allowDeselect={true} onValueChange={handleProject} bind:open bind:value>
	<Select.Trigger class="bg-white">
		{value || m.project_select_placeholder()}
	</Select.Trigger>
	<Select.Content>
		{#each page.data.projects as project}
			<Select.Item value={project}>{project}</Select.Item>
		{:else}
			<div class="text-sm text-gray-500 italic px-2 py-1">
				{m.project_select_empty()}
			</div>
		{/each}
	</Select.Content>
</Select.Root>
