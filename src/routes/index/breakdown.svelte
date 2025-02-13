<script lang="ts">
import { onMount } from 'svelte';
import { page } from '$app/state';
import * as echarts from 'echarts';
import * as _ from 'radashi';

import formatter from '$utils/formatter';

import type { Entry } from '$models';
import type { ECharts } from 'echarts';

onMount(() => {
	chart = echarts.init(document.getElementById('chart'));
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
				data: entries
			}
		]
	});

	return () => {
		chart.dispose();
	};
});

let chart: ECharts;

let expenses = $derived(page.data.entries.filter((e: Entry) => e.type === 'expense'));
let amounts = $derived<Record<string, number>>(
	expenses.reduce((a: { [key: string]: number }, v: Entry) => {
		a[v.category] = a[v.category] ?? 0;
		a[v.category] += v.amount;
		return a;
	}, {})
);
let entries = $derived(
	_.listify(amounts, (name, value) => ({ name, value })).toSorted((a, b) => b.value - a.value)
);

$effect(() => {
	chart.setOption({
		series: [
			{
				name: 'breakdown',
				data: entries
			}
		]
	});
});
</script>

<div id="chart" class="h-[300px] w-[400px]"></div>
