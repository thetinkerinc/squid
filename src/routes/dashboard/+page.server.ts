import { redirect } from '@sveltejs/kit';
import * as _ from 'radashi';

import { prisma } from '$utils/prisma';
import auth from '$utils/auth';

import { EntryType, AccountType } from '$prisma/enums';
import type { Entry } from '$prisma/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { userId } = event.locals.auth();
	if (!userId) {
		redirect(307, '/');
	}
	const partners = await getPartners(userId);
	const entries = await getEntries(userId, partners);
	return {
		entries,
		partners,
		totals: await getTotals(entries),
		invitations: await getInvitations(userId)
	};
};

async function getTotals(entries: Entry[]) {
	const income = entries.filter((e) => e.type === EntryType.income);
	const bankIncome = income.filter((e) => e.account === AccountType.bank);
	const cashIncome = income.filter((e) => e.account === AccountType.cash);
	const expense = entries.filter((e) => e.type === EntryType.expense);
	const bankExpense = expense.filter((e) => e.account === AccountType.bank);
	const cashExpense = expense.filter((e) => e.account === AccountType.cash);
	const withdrawal = entries.filter((e) => e.type === EntryType.withdrawal);
	return {
		income: _.sum(income, (e) => e.amount),
		bankIncome: _.sum(bankIncome, (e) => e.amount),
		cashIncome: _.sum(cashIncome, (e) => e.amount),
		expense: _.sum(expense, (e) => e.amount),
		bankExpense: _.sum(bankExpense, (e) => e.amount),
		cashExpense: _.sum(cashExpense, (e) => e.amount),
		withdrawal: _.sum(withdrawal, (e) => e.amount)
	};
}

async function getEntries(userId: string, partners: string[]) {
	return await prisma.entry.findMany({
		where: {
			OR: [{ user: userId }, { userEmail: { in: partners } }]
		},
		orderBy: {
			created: 'desc'
		}
	});
}

async function getInvitations(userId: string) {
	const email = await auth.getEmail(userId);
	return await prisma.invitation.findMany({
		where: {
			to: email,
			accepted: {
				equals: null
			}
		},
		orderBy: {
			sent: 'desc'
		}
	});
}

async function getPartners(userId: string) {
	const resp = await prisma.partners.findFirst({
		where: {
			user: userId
		}
	});
	return resp?.partners ?? [];
}
