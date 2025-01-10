<script>
import { page } from '$app/state';
import { ArrowUp, ArrowDown, Redo } from 'lucide-svelte';

import formatter from '$utils/formatter';

import * as Tooltip from '$components/ui/tooltip';
</script>

<div class="flex flex-col gap-2">
	{#each page.data.entries as entry (entry.id)}
		<div class="flex items-center gap-4 rounded bg-white/[0.7] px-4 py-1 shadow">
			{#if entry.type === 'income'}
				<div class="badge from-green-300 to-green-400">
					<ArrowUp size={20} />
				</div>
			{:else if entry.type === 'expense'}
				<div class="badge from-red-300 to-red-400">
					<ArrowDown size={20} />
				</div>
			{:else if entry.type === 'withdrawal'}
				<div class="badge from-blue-300 to-blue-400">
					<Redo size={20} />
				</div>
			{/if}
			<div>{formatter.money(entry.amount)}</div>
			<Tooltip.Root delayDuration={100}>
				<Tooltip.Trigger>
					<div class="text-gray-500">{formatter.date(entry.created)}</div>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<div>{formatter.date(entry.created, 'h:mm a ddd MMM D, YYYY')}</div>
				</Tooltip.Content>
			</Tooltip.Root>
			<div class="capitalize">{entry.category}</div>
		</div>
	{/each}
</div>

<style lang="postcss">
.badge {
	@apply rounded bg-gradient-to-br p-[2px] shadow;
}
</style>
