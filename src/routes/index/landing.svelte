<script lang="ts">
import auth from '$lib/auth';

import { Button } from '$components/ui/button';
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
