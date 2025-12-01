import { Authenticated } from '$utils/commanders';
import { prisma } from '$utils/prisma';
import auth from '$utils/auth';

import * as schema from './schema';

import type { PrismaTx } from '$utils/prisma';

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
});

export const addEntry = Authenticated.form(schema.entry, async ({ ctx, data }) => {
	const userEmail = await auth.getEmail(ctx);
	await prisma.entry.create({
		data: {
			...data,
			user: ctx,
			userEmail
		}
	});
});

export const rmEntry = Authenticated.form(schema.entryId, async ({ ctx, data }) => {
	await prisma.entry.delete({
		where: {
			...data,
			user: ctx
		}
	});
});

export const invite = Authenticated.command(schema.email, async ({ ctx: userId, data: to }) => {
	try {
		await auth.getUserId(to);
	} catch (_err) {
		return;
	}
	const fromEmail = await auth.getEmail(userId);
	await prisma.invitation.create({
		data: {
			from: userId,
			fromEmail,
			to
		}
	});
});

export const respond = Authenticated.command(schema.response, async ({ data }) => {
	await prisma.$transaction(async (tx) => {
		const invitation = await tx.invitation.update({
			where: {
				id: data.id
			},
			data: {
				accepted: data.accepted
			}
		});
		if (data.accepted) {
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
	const resp = await prisma.partners.findFirst({
		where: {
			user: userId
		},
		select: {
			partners: true
		}
	});
	return resp?.partners ?? [];
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

async function addPartner(db: PrismaTx, user: string, partner: string) {
	await db.partners.upsert({
		where: {
			user
		},
		create: {
			user,
			partners: [partner]
		},
		update: {
			partners: {
				push: partner
			}
		}
	});
}
