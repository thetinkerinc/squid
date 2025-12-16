import * as v from 'valibot';

import { EntryType, AccountType, CurrencyType } from '$utils/db';

export const entry = v.object({
	type: v.enum(EntryType),
	account: v.enum(AccountType),
	created: rmEmpty(v.pipe(v.string(), v.isoTimestamp(), v.toDate())),
	amount: v.pipe(v.number(), v.minValue(0)),
	enteredAmount: v.pipe(v.number(), v.minValue(0)),
	enteredCurrency: v.enum(CurrencyType),
	category: v.pipe(v.string(), v.nonEmpty('Choose a category for this entry'), v.toLowerCase()),
	description: rmEmpty(v.pipe(v.string(), v.toLowerCase()))
});

export const entryId = v.object({
	id: v.pipe(v.string(), v.uuid())
});

export const invitation = v.object({
	to: v.pipe(v.string(), v.email())
});

export const response = v.object({
	id: v.pipe(v.string(), v.uuid()),
	accepted: v.boolean()
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
