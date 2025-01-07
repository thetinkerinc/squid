<script lang="ts">
import { onMount } from 'svelte';
import Chart from 'chart.js/auto';

onMount(() => {
	new Chart(document.getElementById('chart') as HTMLCanvasElement, {
		type: 'pie',
		data: {
			labels: ['a', 'b', 'c'],
			datasets: [
				{
					data: [100, 200, 300]
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
</script>

<div class="w-[400px]">
	<canvas id="chart"></canvas>
</div>
