<script lang="ts">
import auth from '$lib/auth';

import landingData from './landing-data';

import { Button } from '$components/ui/button';

import DescriptionCard from './description-card.svelte';
import Totals from './totals.svelte';
import Entries from './entries.svelte';
import Breakdown from './breakdown.svelte';
</script>

<div class="mx-auto w-[80%]">
	<div
		class="grid grid-rows-[repeat(3,auto)] items-center justify-items-center gap-10 p-4 lg:grid-cols-[repeat(3,auto)] lg:grid-rows-1">
		<img src="/squid.png" alt="Cartoon squid with money" class="w-[200px]" />
		<div>
			<div class="mb-2 text-[50px] leading-none">Save quid with squid!</div>
			<div class="text-2xl">
				<div class="ml-2">Easily keep track of your income and expenses</div>
				<div class="ml-4">and collaborate with others to do shared budgeting</div>
			</div>
		</div>
		<div class="self-center">
			<Button href={auth.getBuiltinUIUrl()}>Get started</Button>
		</div>
	</div>
</div>
<div class="mx-auto mt-10 flex w-[95%] flex-wrap justify-evenly gap-4">
	<DescriptionCard title="See your total balance at a glance">
		<div class="place-self-center lg:mb-10">
			<Totals totals={landingData.totals} />
		</div>
	</DescriptionCard>
	<DescriptionCard title="All your income, expenses, and withdrawals">
		<div class="place-self-center">
			<Entries canDelete={false} entries={landingData.entries} />
		</div>
	</DescriptionCard>
	<DescriptionCard title="Breakdown of all time and monthly expenses">
		<div class="w-[300px] place-self-center overflow-hidden">
			<Breakdown entries={landingData.entries} detailed={false} />
		</div>
	</DescriptionCard>
</div>
