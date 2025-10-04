<script lang="ts">
import * as m from '$paraglide/messages';
</script>

<svelte:head>
	<title>Tempo</title>
</svelte:head>
<div class="flex justify-center text-[25px] md:text-[40px]">
	<div class="flex -translate-x-[6%] items-center">
		<div>{m.landing_title_start()}</div>
		<img class="w-[120px] md:w-[200px]" src="/logo.png" alt="Hourglass" />
		<div>Tempo</div>
	</div>
</div>
<div class="mt-4 text-center text-xl italic">{m.landing_tagline()}</div>
<div class="mx-auto mt-8 max-w-[400px] rounded-lg bg-white/20 p-6 text-center text-lg">
	{m.landing_description()}
</div>
