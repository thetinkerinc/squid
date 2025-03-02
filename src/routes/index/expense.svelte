<script lang="ts">
import AddEntry from './add-entry.svelte';

const defaultCategories = [
	'rent',
	'groceries',
	'food',
	'transportation',
	'entertainment',
	'home',
	'pets',
	'clothes'
];
</script>

<AddEntry {defaultCategories} entryType="expense" title="Register an expense" />
