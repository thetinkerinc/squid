import { page } from '$app/state';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

import type { Pathname } from '$app/types';

async function updateSearch(params: { [key: string]: string | undefined }) {
	const currentParams = page.url.searchParams;
	Object.entries(params).forEach(([k, v]) => {
		if (v) {
			currentParams.set(k, v);
		} else {
			currentParams.delete(k);
		}
	});
	let query = currentParams.toString();
	if (query) {
		query = '?' + query;
	}
	await goto(resolve((page.url.pathname + query) as Pathname), {
		invalidateAll: true,
		replaceState: true
	});
}

export default {
	updateSearch
};
