<script lang="ts">
let { data }: Props = $props();

import { Landmark, Banknote, LogOut } from 'lucide-svelte';

import auth from '$lib/auth';

import { Button } from '$components/ui/button';
import Card from '$components/card.svelte';

import Breakdown from './breakdown.svelte';

import type { PageData } from './$types';

interface Props {
	data: PageData;
}
</script>

<svelte:head>
	<title>Squid</title>
</svelte:head>
{#if data.authenticated}
	<div class="px-8 pb-10 pt-4">
		<div class="mb-4 flex items-center">
			<div class="flex-auto">
				<img src="/squid.png" alt="Cartoon squid with money" class="w-[70px]" />
			</div>
			<div>
				<a href={auth.getSignoutUrl()}>
					<LogOut size={30} />
				</a>
			</div>
		</div>
		<div class="grid grid-cols-[1fr_2fr] place-items-start justify-items-stretch gap-4">
			<div>
				<Card>
					<div class="mb-4 text-center text-3xl tracking-wider">$2,500</div>
					<div class="flex justify-center gap-4">
						<div class="flex items-center gap-2">
							<Landmark />
							<div>$1,850</div>
						</div>
						<div>/</div>
						<div class="flex items-center gap-2">
							<Banknote />
							<div>$650</div>
						</div>
					</div>
				</Card>
				<div class="my-4 flex justify-around">
					<div>
						<Button>Income</Button>
					</div>
					<div>
						<Button>Expense</Button>
					</div>
					<div>
						<Button>Withdrawal</Button>
					</div>
				</div>
				<Card>Hello there!</Card>
			</div>
			<Card>
				<Breakdown />
			</Card>
		</div>
	</div>
{:else}
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
{/if}
