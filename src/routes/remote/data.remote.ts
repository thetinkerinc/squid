import { sql } from 'kysely';
import auth from '@thetinkerinc/sprout/auth';
import { Authenticated } from '@thetinkerinc/sprout/commanders';

import * as schema from './schema';

import type { Tx, Ctx } from '$types';

export const getEntriesAndPartners = Authenticated.query(async ({ ctx }) => {
	const partners = await getPartners(ctx);
	const entries = await getEntries(ctx, partners);

	return {
		partners,
		entries
	};
});

export const getInvitations = Authenticated.query(async ({ ctx }) => {
	const email = await auth.getEmail(ctx.userId);
	return await ctx.db
		.selectFrom('invitations')
		.selectAll()
		.where('to', '=', email)
		.where('accepted', 'is', null)
		.orderBy('sent', 'desc')
		.execute();
});

export const addEntry = Authenticated.form(schema.entry, async ({ ctx, data }) => {
	const userEmail = await auth.getEmail(ctx.userId);
	await ctx.db
		.insertInto('entries')
		.values({
			...data,
			user: ctx.userId,
			userEmail
		})
		.execute();
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
		await auth.getUserId(data.to);
	} catch (_err) {
		return;
	}
	const fromEmail = await auth.getEmail(ctx.userId);
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
		const invitation = await tx
			.updateTable('invitations')
			.set({
				accepted: data.accepted
			})
			.where('id', '=', data.id)
			.returningAll()
			.executeTakeFirst();
		if (data.accepted && invitation) {
			const fromEmail = await auth.getEmail(invitation.from);
			const fromId = invitation.from;
			const toEmail = invitation.to;
			const toId = await auth.getUserId(invitation.to);
			await addPartner(tx, fromId, toEmail);
			await addPartner(tx, toId, fromEmail);
		}
	});
});

async function getPartners({ db, userId }: Ctx) {
	const resp = await db
		.selectFrom('partners')
		.where('user', '=', userId)
		.select(['partners'])
		.executeTakeFirst();
	return resp?.partners ?? [];
}

async function getEntries({ db, userId }: Ctx, partners: string[]) {
	return await db
		.selectFrom('entries')
		.selectAll()
		.$if(partners.length === 0, (q) => q.where('user', '=', userId))
		.$if(partners.length > 0, (q) =>
			q.where((w) => w.or([w('user', '=', userId), w('userEmail', 'in', partners)]))
		)
		.orderBy('created', 'desc')
		.execute();
}

async function addPartner(tx: Tx, user: string, partner: string) {
	await tx
		.insertInto('partners')
		.values({
			user,
			partners: [partner]
		})
		.onConflict((c) =>
			c.column('user').doUpdateSet({
				partners: sql`array_append(partners.partners, ${partner})`
			})
		)
		.execute();
}
