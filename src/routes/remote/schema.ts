import * as v from 'valibot';

import * as m from '$paraglide/messages';

import { EntryType, AccountType, CurrencyType } from '$types';

export const entry = v.object({
	parent: v.optional(v.pipe(v.string(), v.uuid())),
	type: v.enum(EntryType),
	pending: v.optional(v.boolean(), false),
	account: v.enum(AccountType),
	created: rmEmpty(v.pipe(v.string(), v.isoTimestamp(), v.toDate())),
	amount: v.pipe(v.number(), v.gtValue(0)),
	enteredAmount: v.message(v.pipe(v.number(), v.gtValue(0)), m.add_entry_no_amount()),
	enteredCurrency: v.enum(CurrencyType),
	category: v.pipe(v.string(), v.nonEmpty(m.add_entry_no_category()), v.toLowerCase()),
	description: rmEmpty(v.pipe(v.string(), v.toLowerCase()))
});

export const entryId = v.object({
	id: v.pipe(v.string(), v.uuid())
});

export const invitation = v.object({
	to: v.pipe(v.string(), v.email(), v.toLowerCase())
});

export const response = v.object({
	id: v.pipe(v.string(), v.uuid()),
	accepted: v.pipe(
		v.string(),
		v.transform((a) => (a === 'false' ? false : true))
	)
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rmEmpty<TSchema extends v.BaseSchema<any, any, any>>(schema: TSchema) {
	return v.optional(
		v.union([
			v.pipe(
				v.string(),
				v.trim(),
				v.literal(''),
				v.transform(() => undefined)
			),
			schema
		])
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	) as v.BaseSchema<v.InferInput<TSchema> | string, v.InferOutput<TSchema> | undefined, any>;
}
