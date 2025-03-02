<script lang="ts">
import AddEntry from './add-entry.svelte';

const defaultCategories = ['paycheck', 'misc'];
</script>

<AddEntry {defaultCategories} entryType="income" title="Add income to your account" />
