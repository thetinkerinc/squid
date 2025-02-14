<script lang="ts">
import { onMount } from 'svelte';
import { page } from '$app/state';
import * as echarts from 'echarts';
import * as _ from 'radashi';

import formatter from '$utils/formatter';

import { ScrollArea } from '$components/ui/scroll-area';

import type { Entry } from '$models';
import type { ECharts } from 'echarts';

onMount(() => {
	chart = echarts.init(document.getElementById('chart'), null, {
		height: 300
	});
	chart.setOption({
		legend: {
			orient: 'vertical',
			top: 'center',
			right: 0,
			formatter: _.capitalize
		},
		tooltip: {
			trigger: 'item',
			valueFormatter: formatter.money
		},
		series: [
			{
				type: 'pie',
				name: 'breakdown',
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

let expenses = $derived<Entry[]>(page.data.entries.filter((e: Entry) => e.type === 'expense'));
let amounts = $derived(
	expenses.reduce((a: { [key: string]: Record<string, number> }, v: Entry) => {
		const description = v.description ?? 'No description';
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
				name: 'breakdown',
				data: slices
			}
		]
	});
});
</script>

<div class="grid grid-cols-2">
	<div id="chart" class="h-[300px] w-[400px]"></div>
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
							<span class="capitalize text-gray-500">{sub.name}</span>
							<span>-</span>
							<span>{formatter.money(sub.value)}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</ScrollArea>
</div>
