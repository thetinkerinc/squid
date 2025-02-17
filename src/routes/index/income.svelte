<script lang="ts">
import Entry from './entry.svelte';

const defaultCategories = ['paycheck', 'misc'];
</script>

<Entry {defaultCategories} entryType="income" title="Add income to your account" />
