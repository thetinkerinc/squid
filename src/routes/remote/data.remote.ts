import { error, invalid } from '@sveltejs/kit';
import { sql } from 'kysely';
import { getEmail, getUserId } from '@thetinkerinc/sprout/auth';
import { Authenticated } from '@thetinkerinc/sprout/commanders';

import * as m from '$paraglide/messages';

import * as schema from './schema';

import { type Tx, type Db, AccountType, EntryType, type CurrencyValue } from '$types';

export const getEntries = Authenticated.query(async ({ ctx }) => {
	return await ctx.db
		.selectFrom('entries')
		.selectAll()
		.where('parent', 'is', null)
		.where((w) =>
			w.or([
				w('entries.user', '=', ctx.userId),
				w(
					'userEmail',
					'in',
					ctx.db.selectFrom('partners').select('partner').where('partners.user', '=', ctx.userId)
				)
			])
		)
		.orderBy('created', 'desc')
		.execute();
});

export const getPartners = Authenticated.query(async ({ ctx }) => {
	const resp = await ctx.db
		.selectFrom('partners')
		.where('user', '=', ctx.userId)
		.select('partner')
		.execute();
	return resp.map((r) => r.partner);
});

export const getPaymentsTotals = Authenticated.query(async ({ ctx }) => {
	return await ctx.db
		.selectFrom('entries as p')
		.select([
			sql<number>`coalesce(sum(c.amount) filter (where c.account=${AccountType.bank}), 0)`.as(
				'bank'
			),
			sql<number>`coalesce(sum(c.amount) filter (where c.account=${AccountType.cash}), 0)`.as(
				'cash'
			)
		])
		.innerJoin('entries as c', 'p.id', 'c.parent')
		.where('c.parent', 'is not', null)
		.where('p.pending', '=', true)
		.where((w) =>
			w.or([
				w('p.user', '=', ctx.userId),
				w(
					'p.userEmail',
					'in',
					ctx.db.selectFrom('partners').select('partner').where('partners.user', '=', ctx.userId)
				)
			])
		)
		.executeTakeFirstOrThrow();
});

export const getPayments = Authenticated.query(schema.entryId, async ({ ctx, params }) => {
	return await ctx.db
		.selectFrom('entries')
		.selectAll()
		.where('parent', '=', params.id)
		.where((w) =>
			w.or([
				w('entries.user', '=', ctx.userId),
				w(
					'userEmail',
					'in',
					ctx.db.selectFrom('partners').select('partner').where('partners.user', '=', ctx.userId)
				)
			])
		)
		.orderBy('created', 'desc')
		.execute();
});

export const getInvitations = Authenticated.query(async ({ ctx }) => {
	const email = await getEmail(ctx.userId);
	return await ctx.db
		.selectFrom('invitations')
		.selectAll()
		.where('to', '=', email)
		.where('accepted', 'is', null)
		.orderBy('sent', 'desc')
		.execute();
});

export const addEntry = Authenticated.form(schema.entry, async ({ ctx, data, issue }) => {
	await ctx.db.transaction().execute(async (tx) => {
		if (data.parent) {
			const paid = (await getAmountPaid(tx, data.parent)) + data.enteredAmount;
			const { enteredAmount } = await tx
				.selectFrom('entries')
				.select('enteredAmount')
				.where('id', '=', data.parent)
				.executeTakeFirstOrThrow();
			if (paid > enteredAmount) {
				invalid(issue.enteredAmount(m.payment_value_exceeded_error()));
			} else if (paid === enteredAmount) {
				await tx
					.updateTable('entries')
					.where('id', '=', data.parent!)
					.set({
						pending: false
					})
					.execute();
			}
		}
		const userEmail = await getEmail(ctx.userId);
		await tx
			.insertInto('entries')
			.values({
				...data,
				user: ctx.userId,
				userEmail
			})
			.execute();
	});
});

export const markReceived = Authenticated.form(schema.entryId, async ({ ctx, data }) => {
	await ctx.db.transaction().execute(async (tx) => {
		const userEmail = await getEmail(ctx.userId);

		const parent = await tx
			.updateTable('entries')
			.where('id', '=', data.id)
			.where('user', '=', ctx.userId)
			.set({
				pending: false
			})
			.returning(['account', 'enteredAmount', 'enteredCurrency'])
			.executeTakeFirstOrThrow();

		const paid = await getAmountPaid(tx, data.id);
		const remaining = parent.enteredAmount - paid;

		await tx
			.insertInto('entries')
			.values({
				parent: data.id,
				type: EntryType.income,
				pending: false,
				account: parent.account,
				created: new Date(),
				amount: await convert(tx, parent.enteredCurrency, remaining),
				enteredAmount: remaining,
				enteredCurrency: parent.enteredCurrency,
				category: m.add_payment_category(),
				user: ctx.userId,
				userEmail
			})
			.execute();
	});
});

export const rmEntry = Authenticated.form(schema.entryId, async ({ ctx, data }) => {
	await ctx.db
		.deleteFrom('entries')
		.where('id', '=', data.id)
		.where('user', '=', ctx.userId)
		.execute();
});

export const invite = Authenticated.form(schema.invitation, async ({ ctx, data }) => {
	try {
		await getUserId(data.to);
	} catch (_err) {
		return;
	}
	const fromEmail = await getEmail(ctx.userId);
	const exists = await ctx.db
		.selectFrom('invitations')
		.where('from', '=', ctx.userId)
		.where('to', '=', data.to)
		.select(({ fn }) => [fn.count<number>('id').as('count')])
		.executeTakeFirst();
	if (exists?.count ?? 0 > 0) {
		return;
	}
	await ctx.db
		.insertInto('invitations')
		.values({
			from: ctx.userId,
			fromEmail,
			to: data.to
		})
		.execute();
});

export const respond = Authenticated.form(schema.response, async ({ ctx, data }) => {
	await ctx.db.transaction().execute(async (tx) => {
		const userEmail = await getEmail(ctx.userId);
		const invitation = await tx
			.updateTable('invitations')
			.set({
				accepted: data.accepted
			})
			.where('id', '=', data.id)
			.returningAll()
			.executeTakeFirst();

		if (!invitation || invitation.to !== userEmail) {
			error(400, 'You can not respond to this invitation');
		}

		if (data.accepted && invitation) {
			const fromEmail = await getEmail(invitation.from);
			const fromId = invitation.from;
			const toEmail = invitation.to;
			const toId = await getUserId(invitation.to);
			await addPartner(tx, fromId, toEmail);
			await addPartner(tx, toId, fromEmail);
		}
	});
});

async function getAmountPaid(db: Db, id: string) {
	const { paid } = await db
		.selectFrom('entries')
		.select(({ fn }) => fn.sum<number>('enteredAmount').as('paid'))
		.where('parent', '=', id)
		.executeTakeFirstOrThrow();
	return paid ?? 0;
}

async function addPartner(tx: Tx, user: string, partner: string) {
	await tx
		.insertInto('partners')
		.values({
			user,
			partner
		})
		.execute();
}

async function convert(db: Db, currency: CurrencyValue, amount: number) {
	if (currency === 'CAD') {
		return amount;
	}
	const { value } = await db
		.selectFrom('currencies')
		.select('value')
		.where('code', '=', currency)
		.executeTakeFirstOrThrow();
	return amount / value;
}
