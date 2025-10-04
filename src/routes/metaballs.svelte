<script lang="ts">
/*
   Thanks to Antony Garand for the svg metaballs implementation!
   https://dev.to/antogarand/svg-metaballs-35pj
 */

import Metaball from './metaball.svelte';

let innerWidth = $state<number>(0);
</script>

<svelte:window bind:innerWidth />
<div class="pointer-events-none fixed top-0 left-0 h-full w-full">
	<svg height="100%" width="100%">
		<defs>
			<filter id="metaball" width="400%" x="-150%" height="400%" y="-150%">
				<feGaussianBlur id="blurElement" in="SourceGraphic" stdDeviation="10" result="blur"
				></feGaussianBlur>
				<feColorMatrix
					id="colorMatrixElement"
					in="blur"
					mode="matrix"
					values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 28 -15.9"
					result="matrix"></feColorMatrix>
			</filter>
		</defs>
		<g filter="url(#metaball)">
			{#each { length: 3 }}
				<Metaball />
			{/each}
			{#each { length: 1 }}
				<Metaball visible={innerWidth > 900} />
			{/each}
			{#each { length: 1 }}
				<Metaball visible={innerWidth > 1000} />
			{/each}
			{#each { length: 2 }}
				<Metaball visible={innerWidth > 1200} />
			{/each}
		</g>
	</svg>
</div>
