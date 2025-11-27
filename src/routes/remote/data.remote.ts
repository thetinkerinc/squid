import { Authenticated } from '$utils/commanders';
import { prisma } from '$utils/prisma';
import auth from '$utils/auth';

import * as schema from './schema';

import type { PrismaTx } from '$utils/prisma';

export const addEntry = Authenticated.command(schema.entry, async ({ ctx, data }) => {
	const userEmail = await auth.getEmail(ctx);
	await prisma.entry.create({
		data: {
			...data,
			user: ctx,
			userEmail
		}
	});
});

export const rmEntry = Authenticated.command(schema.entryId, async ({ data }) => {
	await prisma.entry.delete({
		where: {
			id: data
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
