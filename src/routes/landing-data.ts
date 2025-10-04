import * as date from 'date-fns';
import * as _ from 'radashi';

const totals = {
	bankExpense: 25,
	bankIncome: 2600,
	cashExpense: 19,
	cashIncome: 0,
	expense: 44,
	income: 2600,
	withdrawal: 100
};

const entries = [
	{
		id: _.uid(8),
		created: date.sub(new Date(), { hours: 1 }),
		type: 'expense',
		account: 'bank',
		amount: 12,
		enteredAmount: 12,
		enteredCurrency: 'CAD',
		category: 'transportation',
		description: 'uber',
		user: {
			email: 'example@email.com'
		}
	},
	{
		id: _.uid(8),
		created: date.sub(new Date(), { hours: 3 }),
		type: 'expense',
		account: 'cash',
		amount: 19,
		enteredAmount: 270,
		enteredCurrency: 'MXN',
		category: 'groceries',
		description: null,
		user: {
			email: 'partner@email.com'
		}
	},
	{
		id: _.uid(8),
		created: date.sub(new Date(), { hours: 12 }),
		type: 'withdrawal',
		account: 'bank',
		amount: 100,
		enteredAmount: 100,
		enteredCurrency: 'CAD',
		category: 'withdrawal',
		description: null,
		user: {
			email: 'example@email.com'
		}
	},
	{
		id: _.uid(8),
		created: date.sub(new Date(), { days: 3.2 }),
		type: 'expense',
		account: 'bank',
		amount: 25,
		enteredAmount: 25,
		enteredCurrency: 'CAD',
		category: 'food',
		description: 'uber eats',
		user: {
			email: 'example@email.com'
		}
	},
	{
		id: _.uid(8),
		created: date.sub(new Date(), { days: 15.1 }),
		type: 'income',
		account: 'bank',
		amount: 2600,
		enteredAmount: 2600,
		enteredCurrency: 'CAD',
		category: 'paycheck',
		description: date.format(date.sub(new Date(), { days: 15.1 }), 'MMMM'),
		user: {
			email: 'example@email.com'
		}
	}
];

export default {
	totals,
	entries
};
