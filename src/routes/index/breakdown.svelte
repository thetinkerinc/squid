<script lang="ts">
import { onMount } from 'svelte';
import { page } from '$app/state';
import Chart from 'chart.js/auto';

import type { Chart as ChartType } from 'chart.js';
import type { Entry } from '$models';

onMount(() => {
	chart = new Chart(document.getElementById('chart') as HTMLCanvasElement, {
		type: 'pie',
		data: {
			labels: categories,
			datasets: [
				{
					data: categories.map((c) => amounts[c])
				}
			]
		},
		options: {
			plugins: {
				legend: {
					display: true,
					position: 'right'
				}
			}
		}
	});
});

let chart: ChartType;

let expenses = $derived(page.data.entries.filter((e: Entry) => e.type === 'expense'));
let amounts = $derived(
	expenses.reduce((a: { [key: string]: number }, v: Entry) => {
		a[v.category] = a[v.category] ?? 0;
		a[v.category] += v.amount;
		return a;
	}, {})
);
let categories = $derived(Object.keys(amounts));

$effect(() => {
	chart.data.labels = categories;
	chart.data.datasets[0].data = categories.map((c) => amounts[c]);
	chart.update();
});
</script>

<div class="h-[300px] w-[300px]">
	<canvas id="chart"></canvas>
</div>
