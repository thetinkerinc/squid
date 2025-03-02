import { getPageData } from '@thetinkerinc/isolocal';
import * as _ from 'radashi';

import e from '$eql';

import type { Client } from 'gel';
import type { LayoutServerLoad } from './$types';

async function getCurrencies(client: Client) {
	const currencies = await e
		.select(e.Currency, () => ({
			code: true,
			symbol: true,
			name: true,
			value: true
		}))
		.run(client);
	return _.objectify(currencies, (c) => c.code);
}

export const load: LayoutServerLoad = async (event) => {
	const { authenticated, user } = event.locals;
	return {
		...getPageData(event),
		currencies: await getCurrencies(event.locals.client),
		authenticated,
		user
	};
};
