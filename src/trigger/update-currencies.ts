import { schedules } from '@trigger.dev/sdk/v3';

import e from '$eql';
import { createClient } from 'gel';

import type { CurrencyType } from '$models';

type CurrencyInfo = {
	symbol: string;
	name: string;
	symbol_native: string;
	decimal_digits: number;
	rounding: number;
	code: CurrencyType;
	name_plural: string;
	type: string;
};
type CurrencyInfoResponse = Record<CurrencyType, CurrencyInfo>;
type CurrencyValueResponse = Record<CurrencyType, number>;

export const updateCurrencies = schedules.task({
	id: 'update-currencies',
	machine: 'medium-1x',
	cron: {
		pattern: '0 6 * * *',
		timezone: 'America/Edmonton'
	},
	run: async () => {
		const info = await getCurrencyInfo();
		const values = await getCurrencyValues();
		const currencies = Object.values(info).map((data) => ({
			code: data.code,
			name: data.name,
			symbol: data.symbol_native,
			value: values[data.code]
		}));
		const client = createClient({
			instanceName: process.env.GEL_INSTANCE,
			secretKey: process.env.GEL_SECRET_KEY
		});
		await client.transaction(async (tx) => {
			await e.delete(e.Currency).run(tx);
			for (const currency of currencies) {
				await e.insert(e.Currency, currency).run(tx);
			}
		});
	}
});

async function getCurrencyInfo(): Promise<CurrencyInfoResponse> {
	const resp = await fetch(
		`https://api.freecurrencyapi.com/v1/currencies?apikey=${process.env.CURRENCY_API_KEY}&currencies=EUR%2CUSD%2CCAD%2CMXN`
	);
	const json = await resp.json();
	return json.data;
}

async function getCurrencyValues(): Promise<CurrencyValueResponse> {
	const resp = await fetch(
		`https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.CURRENCY_API_KEY}&currencies=EUR%2CUSD%2CCAD%2CMXN&base_currency=CAD`
	);
	const json = await resp.json();
	return json.data;
}
