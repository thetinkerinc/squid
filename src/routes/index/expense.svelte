<script lang="ts">
import Entry from './entry.svelte';

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

<Entry {defaultCategories} entryType="expense" title="Register an expense" />
