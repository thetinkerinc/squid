import { buildClerkProps } from 'svelte-clerk/server';
import { getPageData } from '@thetinkerinc/isolocal';
import { getDb } from '@thetinkerinc/sprout/db';
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
	const db = await getDb();
	const currencies = await db.selectFrom('currencies').selectAll().execute();
	return _.objectify(currencies, (c) => c.code);
}
