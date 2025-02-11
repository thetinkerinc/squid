import e from '$eql';

import type { Client } from 'edgedb';
import type { $expr_Select } from '$eql/select';
import type { Cardinality, ObjectType } from '$eql/reflection';
import type { PageServerLoad } from './$types';

type Users = $expr_Select<{
	__element__: ObjectType<'default::User'>;
	__cardinality__: Cardinality.Many;
}>;

async function getTotals(client: Client, user: Users) {
	const entries = e.select(e.Entry, (entry) => ({
		filter: e.op(entry.user, '=', user)
	}));
	const income = e.select(entries, (entry) => ({
		filter: e.op(entry.type, '=', e.EntryType.income)
	}));
	const bankIncome = e.select(income, (entry) => ({
		filter: e.op(entry.account, '=', e.AccountType.bank)
	}));
	const cashIncome = e.select(income, (entry) => ({
		filter: e.op(entry.account, '=', e.AccountType.cash)
	}));
	const expense = e.select(entries, (entry) => ({
		filter: e.op(entry.type, '=', e.EntryType.expense)
	}));
	const bankExpense = e.select(expense, (entry) => ({
		filter: e.op(entry.account, '=', e.AccountType.bank)
	}));
	const cashExpense = e.select(expense, (entry) => ({
		filter: e.op(entry.account, '=', e.AccountType.cash)
	}));
	const withdrawal = e.select(entries, (entry) => ({
		filter: e.op(entry.type, '=', e.EntryType.withdrawal)
	}));
	return await e
		.select({
			income: e.sum(income.amount),
			bankIncome: e.sum(bankIncome.amount),
			cashIncome: e.sum(cashIncome.amount),
			expense: e.sum(expense.amount),
			bankExpense: e.sum(bankExpense.amount),
			cashExpense: e.sum(cashExpense.amount),
			withdrawal: e.sum(withdrawal.amount)
		})
		.run(client);
}

async function getEntries(client: Client, user: Users) {
	return await e
		.select(e.Entry, (entry) => ({
			id: true,
			created: true,
			type: true,
			account: true,
			amount: true,
			category: true,
			description: true,
			user: {
				email: true
			},
			filter: e.op(entry.user, '=', user),
			order_by: {
				expression: entry.created,
				direction: e.DESC
			}
		}))
		.run(client);
}

async function getInvitations(client: Client, user: Users) {
	return await e
		.select(e.Invitation, (invitation) => ({
			id: true,
			from: {
				email: true
			},
			sent: true,
			filter: e.op(
				e.op(invitation.to, '=', user),
				'and',
				e.op('not', e.op('exists', invitation.accepted))
			),
			order_by: {
				expression: invitation.sent,
				direction: e.DESC
			}
		}))
		.run(client);
}

export const load: PageServerLoad = async (event) => {
	if (event.locals.authenticated) {
		const user = e.select(e.User, () => ({
			filter_single: {
				id: event.locals.user.id
			}
		}));
		const users = e.select(e.User, (u) => {
			const isUser = e.op(u, '=', user);
			const isPartner = e.op(u, 'in', user.partners);
			return {
				filter: e.op(isUser, 'or', isPartner)
			};
		});
		return {
			totals: await getTotals(event.locals.client, users),
			entries: await getEntries(event.locals.client, users),
			invitations: await getInvitations(event.locals.client, users)
		};
	}
};
