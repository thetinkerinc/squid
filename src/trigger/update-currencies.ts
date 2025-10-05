import { schedules } from '@trigger.dev/sdk/v3';

import { getPrisma } from './utils/prisma';

import { CurrencyType } from '$prisma/enums';

type CurrencyInfo = {
	symbol: string;
	name: string;
	symbol_native: string;
	decimal_digits: number;
	rounding: number;
	code: keyof typeof CurrencyType;
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
			code: CurrencyType[data.code],
			name: data.name,
			symbol: data.symbol_native,
			value: values[data.code]
		}));
		const prisma = getPrisma();
		await prisma.$transaction([
			prisma.currency.deleteMany({}),
			prisma.currency.createMany({
				data: currencies
			})
		]);
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
