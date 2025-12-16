import * as k from 'kysely';
import { NeonDialect } from 'kysely-neon';
import { neon, types } from '@neondatabase/serverless';
import { dev } from '$app/environment';
import { DATABASE_URL } from '$env/static/private';

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

export const db = await initDb();

async function initDb() {
	if (dev) {
		const { KyselyPGlite } = await import('kysely-pglite');
		const { types } = await import('@electric-sql/pglite');
		const { dialect } = await KyselyPGlite.create('./data/db/', {
			parsers: {
				[types.NUMERIC]: (v) => Number(v)
			}
		});
		return new k.Kysely<DB>({
			dialect
		});
	} else {
		types.setTypeParser(types.builtins.NUMERIC, (v) => Number(v));
		return new k.Kysely<DB>({
			dialect: new NeonDialect({
				neon: neon(DATABASE_URL)
			})
		});
	}
}
