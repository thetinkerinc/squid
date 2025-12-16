import * as date from 'date-fns';
import * as _ from 'radashi';

import { EntryType, AccountType, CurrencyType } from '$types';

const entries = [
	{
		id: _.uid(8),
		created: date.sub(new Date(), { hours: 1 }),
		type: EntryType.expense,
		account: AccountType.bank,
		amount: 12,
		enteredAmount: 12,
		enteredCurrency: CurrencyType.CAD,
		category: 'transportation',
		description: 'uber',
		user: 'user123',
		userEmail: 'example@email.com'
	},
	{
		id: _.uid(8),
		created: date.sub(new Date(), { hours: 3 }),
		type: EntryType.expense,
		account: AccountType.cash,
		amount: 19,
		enteredAmount: 270,
		enteredCurrency: CurrencyType.MXN,
		category: 'groceries',
		description: null,
		user: 'user321',
		userEmail: 'partner@email.com'
	},
	{
		id: _.uid(8),
		created: date.sub(new Date(), { hours: 12 }),
		type: EntryType.withdrawal,
		account: AccountType.bank,
		amount: 100,
		enteredAmount: 100,
		enteredCurrency: CurrencyType.CAD,
		category: 'withdrawal',
		description: null,
		user: 'user123',
		userEmail: 'example@email.com'
	},
	{
		id: _.uid(8),
		created: date.sub(new Date(), { days: 3.2 }),
		type: EntryType.expense,
		account: AccountType.bank,
		amount: 25,
		enteredAmount: 25,
		enteredCurrency: CurrencyType.CAD,
		category: 'food',
		description: 'uber eats',
		user: 'user123',
		userEmail: 'example@email.com'
	},
	{
		id: _.uid(8),
		created: date.sub(new Date(), { days: 15.1 }),
		type: EntryType.income,
		account: AccountType.bank,
		amount: 2600,
		enteredAmount: 2600,
		enteredCurrency: CurrencyType.CAD,
		category: 'paycheck',
		description: date.format(date.sub(new Date(), { days: 15.1 }), 'MMMM'),
		user: 'user123',
		userEmail: 'example@email.com'
	}
];

export default {
	entries
};
