import * as k from 'kysely';

import type { DB, EntryTable, InvitationTable } from '$utils/db';

export const EntryType = {
	expense: 'expense',
	income: 'income',
	withdrawal: 'withdrawal'
} as const;

export const AccountType = {
	bank: 'bank',
	cash: 'cash'
} as const;

export const CurrencyType = {
	CAD: 'CAD',
	EUR: 'EUR',
	MXN: 'MXN',
	USD: 'USD'
} as const;

export type EntryValue = (typeof EntryType)[keyof typeof EntryType];
export type AccountValue = (typeof AccountType)[keyof typeof AccountType];
export type CurrencyValue = (typeof CurrencyType)[keyof typeof CurrencyType];

export type Db = k.Kysely<DB>;
export type Tx = k.Transaction<DB>;
export type Entry = k.Selectable<EntryTable>;
export type Invitation = k.Selectable<InvitationTable>;

export type Ctx = {
	db: Db;
	userId: string;
};
