import * as k from 'kysely';

import type { EntryValue, AccountValue, CurrencyValue } from '$types';

declare module '@thetinkerinc/sprout/db' {
	interface DB {
		partners: PartnerTable;
		projects: ProjectTable;
		entries: EntryTable;
		tags: TagTable;
		invitations: InvitationTable;
		currencies: CurrencyTable;
	}

	export interface PartnerTable {
		id: k.Generated<string>;
		user: string;
		userEmail: string;
		partner: string;
		partnerEmail: string;
		project: string;
	}

	export interface ProjectTable {
		id: k.Generated<string>;
		user: string;
		name: string;
	}

	export interface EntryTable {
		id: k.Generated<string>;
		project: string;
		parent: string | null;
		user: string;
		userEmail: string;
		created: k.Generated<Date>;
		type: EntryValue;
		account: AccountValue;
		pending: boolean;
		amount: number;
		enteredAmount: number;
		enteredCurrency: CurrencyValue;
		category: string;
		description: string | null;
	}

	export interface TagTable {
		id: k.Generated<string>;
		entryId: string;
		title: string;
		content: string;
	}

	export interface InvitationTable {
		id: k.Generated<string>;
		project: string;
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
}
