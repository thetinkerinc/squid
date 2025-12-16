<script lang="ts">
let { entries, detailed = true }: Props = $props();

import { onMount } from 'svelte';
import * as date from 'date-fns';
import * as echarts from 'echarts';
import * as _ from 'radashi';

import formatter from '$utils/formatter';

import { ScrollArea } from '$components/ui/scroll-area';

import type { ECharts } from 'echarts';
import { EntryType, type Entry } from '$types';

interface Props {
	entries: Entry[];
	detailed?: boolean;
}

let all = $state(true);

onMount(() => {
	chart = echarts.init(document.getElementById('chart'), null, {
		width: 300
	});
	chart.setOption({
		legend: {
			orient: 'horizontal',
			top: '2%',
			left: 'center',
			formatter: _.capitalize
		},
		tooltip: {
			trigger: 'item',
			valueFormatter: formatter.money
		},
		series: [
			{
				type: 'pie',
				name: 'Breakdown',
				radius: [0, 90],
				center: [150, '50%'],
				label: {
					show: false
				},
				itemStyle: {
					borderRadius: 5,
					borderWidth: 2,
					borderColor: '#fff'
				},
				data: slices
			}
		]
	});

	return () => {
		chart.dispose();
	};
});

let chart: ECharts;

let expenses = $derived<Entry[]>(
	entries.filter((e: Entry) => {
		const isExpense = e.type === EntryType.expense;
		const isInRange = all ? true : date.isSameMonth(new Date(), e.created);
		return isExpense && isInRange;
	})
);
let amounts = $derived(
	expenses.reduce((a: { [key: string]: Record<string, number> }, v: Entry) => {
		const description = (v.description ?? 'no description').toLocaleLowerCase();
		a[v.category] = a[v.category] ?? {};
		a[v.category].total = a[v.category].total ?? 0;
		a[v.category][description] = a[v.category][description] ?? 0;
		a[v.category].total += v.amount;
		a[v.category][description] += v.amount;
		return a;
	}, {})
);
let slices = $derived(
	_.listify(amounts, (name, values) => ({ name, value: values.total })).toSorted(
		(a, b) => b.value - a.value
	)
);
let details = $derived(
	_.listify(amounts, (name, values) => {
		const breakdown = _.listify(_.omit(values, ['total']), (name, value) => ({
			name,
			value
		})).toSorted((a, b) => {
			return b.value - a.value;
		});
		return {
			name,
			total: values.total,
			breakdown
		};
	}).toSorted((a, b) => b.total - a.total)
);

$effect(() => {
	chart.setOption({
		series: [
			{
				name: 'Breakdown',
				data: slices
			}
		]
	});
});
</script>

<div class="flex items-center gap-2 text-lg">
	<button
		class={['rounded px-4 py-2', all && 'bg-white/[0.7] shadow']}
		onclick={() => (all = true)}>
		All time
	</button>
	<button
		class={['rounded px-4 py-2', !all && 'bg-white/[0.7] shadow']}
		onclick={() => (all = false)}>
		This month
	</button>
</div>
<div class="grid grid-rows-[auto_auto] @3xl:grid-cols-[auto_1fr] @3xl:grid-rows-1">
	<div id="chart" class="mt-2 min-h-[300px] w-[300px] justify-self-center"></div>
	{#if detailed}
		<ScrollArea class="flex max-h-[300px] flex-col">
			{#each details as cat}
				<div class="mb-3 rounded bg-white/[0.7] px-4 py-2 shadow">
					<div class="flex items-center gap-2 text-lg">
						<div class="capitalize">{cat.name}</div>
						<div>-</div>
						<div>{formatter.money(cat.total)}</div>
					</div>
					<div class="ml-4">
						{#each cat.breakdown as sub}
							<div class="flex items-center gap-2">
								<span class="text-gray-500 capitalize">{sub.name}</span>
								<span>-</span>
								<span>{formatter.money(sub.value)}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</ScrollArea>
	{/if}
</div>
