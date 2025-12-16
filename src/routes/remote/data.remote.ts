import { sql } from 'kysely';

import { Authenticated } from '$utils/commanders';
import { db } from '$utils/db';
import auth from '$utils/auth';

import * as schema from './schema';

import type { Tx } from '$utils/db';

export const getEntriesAndPartners = Authenticated.query(async ({ ctx }) => {
	const partners = await getPartners(ctx);
	const entries = await getEntries(ctx, partners);

	return {
		partners,
		entries
	};
});

export const getInvitations = Authenticated.query(async ({ ctx }) => {
	const email = await auth.getEmail(ctx);
	return await db
		.selectFrom('invitations')
		.selectAll()
		.where('to', '=', email)
		.where('accepted', 'is', null)
		.orderBy('sent', 'desc')
		.execute();
});

export const addEntry = Authenticated.form(schema.entry, async ({ ctx, data }) => {
	const userEmail = await auth.getEmail(ctx);
	await db
		.insertInto('entries')
		.values({
			...data,
			user: ctx,
			userEmail
		})
		.execute();
});

export const rmEntry = Authenticated.form(schema.entryId, async ({ ctx, data }) => {
	await db.deleteFrom('entries').where('id', '=', data.id).where('user', '=', ctx).execute();
});

export const invite = Authenticated.form(schema.invitation, async ({ ctx: userId, data }) => {
	try {
		await auth.getUserId(data.to);
	} catch (_err) {
		return;
	}
	const fromEmail = await auth.getEmail(userId);
	await db.insertInto('invitations').values({
		from: userId,
		fromEmail,
		to: data.to
	});
});

export const respond = Authenticated.form(schema.response, async ({ data }) => {
	await db.transaction().execute(async (tx) => {
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

async function getPartners(userId: string) {
	const resp = await db
		.selectFrom('partners')
		.where('user', '=', userId)
		.select(['partners'])
		.executeTakeFirst();
	return resp?.partners ?? [];
}

async function getEntries(userId: string, partners: string[]) {
	return await db
		.selectFrom('entries')
		.selectAll()
		.where((w) => w.or([w('user', '=', userId), w('userEmail', 'in', partners)]))
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
				partners: sql`array_append(partners, ${partner})`
			})
		)
		.execute();
}
