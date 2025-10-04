<script lang="ts">
import AddEntry from './add-entry.svelte';
import Breakdown from './breakdown.svelte';
import RecordSession from './record-session.svelte';
</script>

<svelte:head>
	<title>Tempo</title>
</svelte:head>
<div
	class="mx-auto grid max-w-[1000px] grid-rows-[auto_auto] gap-4 rounded-lg bg-white/20 px-6 pt-4 pb-6 lg:grid-cols-[auto_1fr] lg:grid-rows-1 lg:gap-8 lg:pr-8">
	<div>
		<AddEntry />
	</div>
	<div>
		<Breakdown />
	</div>
</div>
<RecordSession />
