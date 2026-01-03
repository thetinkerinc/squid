<script lang="ts">
import * as m from '$paraglide/messages';

import AddEntry from './add-entry.svelte';

const defaultCategories = [m.income_category_paycheck(), m.income_category_misc()];
</script>

<AddEntry
	{defaultCategories}
	entryType="income"
	title={m.add_entry_income_title()}
	label={m.add_entry_income_label()} />
