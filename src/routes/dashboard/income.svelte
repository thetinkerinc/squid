<script lang="ts">
let { project }: Props = $props();

import * as m from '$paraglide/messages';

import AddEntry from './add-entry.svelte';

interface Props {
	project: string;
}

const defaultCategories = [m.income_category_paycheck(), m.income_category_misc()];
</script>

<AddEntry
	{project}
	{defaultCategories}
	entryType="income"
	canBePending={true}
	title={m.add_entry_income_title()}
	label={m.add_entry_income_label()} />
