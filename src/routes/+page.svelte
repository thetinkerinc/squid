<script lang="ts">
let { data }: Props = $props();

import Dashboard from './index/dashboard.svelte';
import Landing from './index/landing.svelte';

import type { PageData } from './$types';

interface Props {
	data: PageData;
}
</script>

<svelte:head>
	<title>Squid</title>
</svelte:head>
{#if data.authenticated}
	<Dashboard />
{:else}
	<Landing />
{/if}
