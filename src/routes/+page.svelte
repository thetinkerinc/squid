<script lang="ts">
import landingData from './landing-data';

import * as m from '$paraglide/messages';

import LocaleSelector from '$components/locale-selector.svelte';
import { Button } from '$components/ui/button';
import Totals from '$components/totals.svelte';
import Entries from '$components/entries.svelte';
import Breakdown from '$components/breakdown.svelte';

import DescriptionCard from './description-card.svelte';
</script>

<svelte:head>
	<title>Squid</title>
</svelte:head>
<div class="mx-auto w-[80%]">
	<div
		class="grid grid-rows-[repeat(3,auto)] items-center justify-items-center gap-10 p-4 lg:grid-cols-[repeat(3,auto)] lg:grid-rows-1">
		<img src="/logo.png" alt="Cartoon squid with money" class="w-[200px]" />
		<div>
			<div class="mb-2 text-[50px] leading-none">{m.landing_title()}</div>
			<div class="text-2xl">
				<div class="ml-2">{m.landing_description_top()}</div>
				<div class="ml-4">{m.landing_description_bottom()}</div>
			</div>
		</div>
		<div class="self-center">
			<div class="flex items-center gap-5">
				<Button href="/login">{m.landing_auth_button()}</Button>
				<LocaleSelector />
			</div>
		</div>
	</div>
</div>
<div class="mx-auto mt-10 flex w-[95%] flex-wrap justify-evenly gap-4">
	<DescriptionCard title={m.landing_example_balance_title()}>
		<div class="place-self-center lg:mb-10">
			<Totals entries={landingData.entries} />
		</div>
	</DescriptionCard>
	<DescriptionCard title={m.landing_example_entries_title()}>
		<div class="place-self-center">
			<Entries canDelete={false} entries={landingData.entries} />
		</div>
	</DescriptionCard>
	<DescriptionCard title={m.landing_example_breakdown_title()}>
		<div class="w-[300px] place-self-center overflow-hidden">
			<Breakdown entries={landingData.entries} detailed={false} />
		</div>
	</DescriptionCard>
</div>
