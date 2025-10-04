<script lang="ts">
import { page } from '$app/state';
import { getLocalTimeZone } from '@internationalized/date';

import navigation from '$utils/navigation';

import * as m from '$paraglide/messages';

import * as Popover from '$components/ui/popover';
import { RangeCalendar } from '$components/ui/range-calendar';
import { Button } from '$components/ui/button';

import type { DateRange } from 'bits-ui';

let selectedPeriod = $derived(page.url.searchParams.get('period'));
let variant = $derived<'default' | 'outline'>(selectedPeriod === 'custom' ? 'default' : 'outline');

async function setDateRange(range: DateRange) {
	if (!range.start || !range.end) {
		return;
	}
	const start = range.start.toDate(getLocalTimeZone()).toISOString();
	const end = range.end.toDate(getLocalTimeZone()).toISOString();
	await navigation.updateSearch({
		period: 'custom',
		start,
		end
	});
}
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {variant} {...props}>
				{m.breakdown_custom()}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<RangeCalendar numberOfMonths={2} onValueChange={setDateRange} />
	</Popover.Content>
</Popover.Root>
