import { buildClerkProps } from 'svelte-clerk/server';
import { getPageData } from '@thetinkerinc/isolocal';
import * as _ from 'radashi';

import { prisma } from '$utils/prisma';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	return {
		...buildClerkProps(event.locals.auth()),
		...getPageData(event),
		currencies: await getCurrencies()
	};
};

async function getCurrencies() {
	const currencies = await prisma.currency.findMany();
	return _.objectify(currencies, (c) => c.code);
}
