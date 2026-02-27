<script lang="ts">
import local from '@thetinkerinc/isolocal';
import { useClerkContext } from 'svelte-clerk/client';
import { LogOut } from '@lucide/svelte';

import {
	getProjects,
	getEntries,
	getPartners,
	getPaymentsTotals,
	getInvitations
} from '$remote/data.remote';

import Card from '$components/card.svelte';
import CurrencySelector from '$components/currency-selector.svelte';
import LocaleSelector from '$components/locale-selector.svelte';
import Totals from '$components/totals.svelte';
import Entries from '$components/entries.svelte';
import Breakdown from '$components/breakdown.svelte';

import Projects from './projects.svelte';
import Income from './income.svelte';
import Expense from './expense.svelte';
import Withdrawal from './withdrawal.svelte';
import Search from './search.svelte';
import Partners from './partners.svelte';

const ctx = useClerkContext();

const projects = $derived(await getProjects());
const project = $derived(local.project ?? projects[0].id);
const entries = $derived(await getEntries({ project }));
const filteredEntries = $derived(getFilteredEntries());
const partners = $derived(await getPartners({ project }));
const paymentsTotals = $derived(await getPaymentsTotals({ project }));
const invitations = $derived(await getInvitations());

function getFilteredEntries() {
	const search = local.search;
	if (!search) {
		return entries;
	} else {
		const normalizedSearch = search.toLocaleLowerCase();
		return entries.filter((e) => {
			return (
				e.category.includes(normalizedSearch) ||
				e.description?.includes(normalizedSearch) ||
				e.tags.some((t) => t.content.includes(normalizedSearch))
			);
		});
	}
}

async function logout() {
	await ctx.clerk?.signOut();
}
</script>

<svelte:head>
	<title>Squid</title>
</svelte:head>
<div class="px-8 pt-4 pb-10">
	<div class="mb-4 flex items-center">
		<div class="flex flex-auto items-center gap-4">
			<img src="/logo.png" alt="Cartoon squid with money" class="w-[70px]" />
			<Projects />
		</div>
		<div class="flex items-center gap-4">
			<CurrencySelector bind:currency={local.currency} />
			<LocaleSelector />
			<button class="cursor-pointer" onclick={logout}>
				<LogOut size={27} />
			</button>
		</div>
	</div>
	<div
		class="grid grid-rows-[auto_auto] place-items-start justify-items-stretch gap-4 lg:grid-cols-[1fr_2fr] lg:grid-rows-1">
		<div
			class="grid grid-rows-[auto_auto] gap-2 md:grid-cols-2 md:grid-rows-1 lg:grid-cols-1 lg:grid-rows-[auto_auto]">
			<div>
				<Card>
					<Totals {entries} {paymentsTotals} />
				</Card>
				<div class="my-4 flex justify-around">
					<Income {project} />
					<Expense {project} />
					<Withdrawal {project} />
				</div>
				<Card>
					<Search />
				</Card>
			</div>
			<Card>
				<Entries entries={filteredEntries} />
			</Card>
		</div>
		<div>
			<Card class="@container mb-6">
				<Breakdown {entries} />
			</Card>
			<Card>
				<Partners {invitations} {partners} />
			</Card>
		</div>
	</div>
</div>
