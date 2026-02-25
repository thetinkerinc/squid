<script lang="ts">
let { project }: Props = $props();

import * as m from '$paraglide/messages';

import AddEntry from './add-entry.svelte';

interface Props {
	project: string;
}

const defaultCategories = [
	m.expense_category_rent(),
	m.expense_category_groceries(),
	m.expense_category_food(),
	m.expense_category_transport(),
	m.expense_category_entertainment(),
	m.expense_category_home(),
	m.expense_category_pets(),
	m.expense_category_clothes()
];
</script>

<AddEntry
	{project}
	{defaultCategories}
	entryType="expense"
	title={m.add_entry_expense_title()}
	label={m.add_entry_expense_label()} />
