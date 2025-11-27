import * as v from 'valibot';

import { EntryType, AccountType, CurrencyType } from '$prisma/enums';

export const entry = v.object({
	type: v.enum(EntryType),
	account: v.enum(AccountType),
	amount: v.pipe(v.number(), v.minValue(0)),
	created: v.optional(v.date()),
	enteredAmount: v.pipe(v.number(), v.minValue(0)),
	enteredCurrency: v.enum(CurrencyType),
	category: v.pipe(v.string(), v.toLowerCase()),
	description: v.optional(
		v.pipe(
			v.string(),
			v.toLowerCase(),
			v.transform((s) => (s === '' ? undefined : s))
		)
	)
});

export const entryId = v.pipe(v.string(), v.uuid());

export const email = v.pipe(v.string(), v.email());

export const response = v.object({
	id: v.pipe(v.string(), v.uuid()),
	accepted: v.boolean()
});
