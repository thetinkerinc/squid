<script lang="ts">
let { class: clazz, children }: Props = $props();

import type { Snippet } from 'svelte';

interface Props {
	class?: string;
	children: Snippet;
}
</script>

<div class="rounded-lg bg-white shadow-lg {clazz}">
	{@render children()}
</div>
