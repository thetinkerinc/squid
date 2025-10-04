import { buildClerkProps } from 'svelte-clerk/server';
import { getPageData } from '@thetinkerinc/isolocal';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	return {
		...buildClerkProps(event.locals.auth()),
		...getPageData(event)
	};
};
