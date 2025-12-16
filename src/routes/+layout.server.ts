import { buildClerkProps } from 'svelte-clerk/server';
import { getPageData } from '@thetinkerinc/isolocal';
import * as _ from 'radashi';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	return {
		...buildClerkProps(event.locals.auth()),
		...getPageData(event),
		currencies: await getCurrencies()
	};
};

async function getCurrencies() {
	const currencies = [
		{
			id: '123',
			code: 'CAD',
			name: 'Canadian Dollar',
			symbol: '$',
			value: 1
		}
	];
	return _.objectify(currencies, (c) => c.code);
}
