<script lang="ts">
let { class: clazz, children }: Props = $props();

import type { Snippet } from 'svelte';

interface Props {
	class?: string;
	children: Snippet;
}
</script>

<div
	class="rounded-lg border border-white/[0.3] bg-emerald-400/[0.05] p-4 shadow-lg backdrop-blur {clazz}">
	{@render children?.()}
</div>
