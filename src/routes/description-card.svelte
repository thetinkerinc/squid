<script lang="ts">
let { title, children } = $props();

import Card from '$components/card.svelte';
</script>

<Card class="grid w-[95%] max-w-[430px] grid-rows-[auto_1fr]">
	<div class="mb-4 text-center text-lg">{title}</div>
	{@render children()}
</Card>
