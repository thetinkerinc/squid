import * as date from 'date-fns';
import * as m from '$paraglide/messages';
import * as _ from 'radashi';

import { EntryType, AccountType, CurrencyType } from '$types';

const entries = [
	{
		id: _.uid(8),
		parent: null,
		created: date.sub(new Date(), { hours: 1 }),
		type: EntryType.expense,
		pending: false,
		account: AccountType.bank,
		amount: 12,
		enteredAmount: 12,
		enteredCurrency: CurrencyType.CAD,
		category: m.expense_category_transport(),
		description: 'uber',
		user: 'user123',
		userEmail: 'example@email.com'
	},
	{
		id: _.uid(8),
		parent: null,
		created: date.sub(new Date(), { hours: 3 }),
		type: EntryType.expense,
		pending: false,
		account: AccountType.cash,
		amount: 19,
		enteredAmount: 270,
		enteredCurrency: CurrencyType.MXN,
		category: m.expense_category_groceries(),
		description: null,
		user: 'user321',
		userEmail: 'partner@email.com'
	},
	{
		id: _.uid(8),
		parent: null,
		created: date.sub(new Date(), { hours: 12 }),
		type: EntryType.withdrawal,
		pending: false,
		account: AccountType.bank,
		amount: 100,
		enteredAmount: 100,
		enteredCurrency: CurrencyType.CAD,
		category: m.withdrawal_category(),
		description: null,
		user: 'user123',
		userEmail: 'example@email.com'
	},
	{
		id: _.uid(8),
		parent: null,
		created: date.sub(new Date(), { days: 3.2 }),
		type: EntryType.expense,
		pending: false,
		account: AccountType.bank,
		amount: 25,
		enteredAmount: 25,
		enteredCurrency: CurrencyType.CAD,
		category: m.expense_category_food(),
		description: 'uber eats',
		user: 'user123',
		userEmail: 'example@email.com'
	},
	{
		id: _.uid(8),
		parent: null,
		created: date.sub(new Date(), { days: 15.1 }),
		type: EntryType.income,
		pending: false,
		account: AccountType.bank,
		amount: 2600,
		enteredAmount: 2600,
		enteredCurrency: CurrencyType.CAD,
		category: m.income_category_paycheck(),
		description: date.format(date.sub(new Date(), { days: 15.1 }), 'MMMM'),
		user: 'user123',
		userEmail: 'example@email.com'
	}
];

export default {
	entries
};
