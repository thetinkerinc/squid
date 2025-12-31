import * as k from 'kysely';
import { Pool, types } from 'pg';

import type { EntryValue, AccountValue, CurrencyValue } from '$types';

export interface DB {
	partners: PartnerTable;
	entries: EntryTable;
	invitations: InvitationTable;
	currencies: CurrencyTable;
}

export interface PartnerTable {
	id: k.Generated<string>;
	user: string;
	partners: string[];
}

export interface EntryTable {
	id: k.Generated<string>;
	user: string;
	userEmail: string;
	created: k.Generated<Date>;
	type: EntryValue;
	account: AccountValue;
	amount: number;
	enteredAmount: number;
	enteredCurrency: CurrencyValue;
	category: string;
	description: string | null;
}

export interface InvitationTable {
	id: k.Generated<string>;
	from: string;
	fromEmail: string;
	to: string;
	sent: k.Generated<Date>;
	accepted: boolean | null;
}

export interface CurrencyTable {
	id: k.Generated<string>;
	code: CurrencyValue;
	name: string;
	symbol: string;
	value: number;
}

export async function getDb() {
	types.setTypeParser(types.builtins.NUMERIC, (v) => Number(v));
	types.setTypeParser(types.builtins.INT8, (v) => Number(v));

	const connectionString = await getConnectionString();

	return new k.Kysely<DB>({
		dialect: new k.PostgresDialect({
			pool: new Pool({
				connectionString
			})
		})
	});
}

async function getConnectionString() {

	console.log('getting connection string');

	let connectionString: string;

	const dev = await getDev();

	console.log({ dev });

	if (dev) {
		try {
			({ DATABASE_URL: connectionString } = await import('$env/static/private'));
		} catch (_err) {
			connectionString = process.env.DATABASE_URL!;
		}
	} else {

		console.log('getting production connection string');

		try {
			const { getRequestEvent } = await import('$app/server');
			const event = getRequestEvent();

			console.log(event.platform);

			connectionString = event.platform!.env.HYPERDRIVE.connectionString;

			console.log(connectionString);
		} catch (_err) {

			console.log('error getting connection string');
			console.log(_err);

			try {
				({ DATABASE_URL: connectionString } = await import('$env/static/private'));
			} catch (_err) {
				connectionString = process.env.DATABASE_URL!;
			}
		}
	}

	if (!connectionString) {
		throw new Error('Could not find connection string');
	}

	return connectionString;
}

async function getDev() {
	let dev: boolean;
	try {
		({ dev } = await import('$app/environment'));
	} catch (_err) {
		({ DEV: dev } = await import('esm-env'));
	}
	return dev;
}
