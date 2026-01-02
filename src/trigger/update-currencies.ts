import { schedules } from '@trigger.dev/sdk/v3';
import { getDb } from '@thetinkerinc/sprout/db';

import { CurrencyType, type CurrencyValue } from '$types';

type CurrencyInfo = {
	symbol: string;
	name: string;
	symbol_native: string;
	decimal_digits: number;
	rounding: number;
	code: CurrencyValue;
	name_plural: string;
	type: string;
};
type CurrencyInfoResponse = Record<CurrencyValue, CurrencyInfo>;
type CurrencyValueResponse = Record<CurrencyValue, number>;

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
			code: CurrencyType[data.code],
			name: data.name,
			symbol: data.symbol_native,
			value: values[data.code]
		}));
		const db = await getDb();
		await db.transaction().execute(async (tx) => {
			await tx.deleteFrom('currencies').execute();
			await tx.insertInto('currencies').values(currencies).execute();
		});
	}
});

async function getCurrencyInfo(): Promise<CurrencyInfoResponse> {
	const resp = await fetch(
		`https://api.freecurrencyapi.com/v1/currencies?apikey=${process.env.CURRENCY_API_KEY}&currencies=EUR%2CUSD%2CCAD%2CMXN`
	);
	const json = (await resp.json()) as { data: CurrencyInfoResponse };
	return json.data;
}

async function getCurrencyValues(): Promise<CurrencyValueResponse> {
	const resp = await fetch(
		`https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.CURRENCY_API_KEY}&currencies=EUR%2CUSD%2CCAD%2CMXN&base_currency=CAD`
	);
	const json = (await resp.json()) as { data: CurrencyValueResponse };
	return json.data;
}
