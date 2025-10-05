import { error } from '@sveltejs/kit';
import { command, getRequestEvent } from '$app/server';
import { clerkClient } from 'svelte-clerk/server';
import * as v from 'valibot';

import { prisma } from '$utils/prisma';
import auth from '$utils/auth';

import { EntryType, AccountType, CurrencyType } from '$prisma/enums';

export const addEntry = command(
	v.object({
		type: v.enum(EntryType),
		account: v.enum(AccountType),
		amount: v.pipe(v.number(), v.minValue(0)),
		created: v.optional(v.date()),
		enteredAmount: v.pipe(v.number(), v.minValue(0)),
		enteredCurrency: v.enum(CurrencyType),
		category: v.pipe(v.string(), v.toLowerCase()),
		description: v.optional(
			v.pipe(
				v.string(),
				v.toLowerCase(),
				v.transform((s) => (s === '' ? undefined : s))
			)
		)
	}),
	async (data) => {
		const userId = protect();
		const userEmail = await auth.getEmail(userId);
		await prisma.entry.create({
			data: {
				...data,
				user: userId,
				userEmail
			}
		});
	}
);

export const rmEntry = command(v.pipe(v.string(), v.uuid()), async (id) => {
	protect();
	await prisma.entry.delete({
		where: {
			id
		}
	});
});

export const invite = command(v.pipe(v.string(), v.email()), async (to) => {
	const users = await clerkClient.users.getUserList({
		limit: 1,
		emailAddress: [to]
	});
	if (users.data.length !== 1) {
		return;
	}
	const userId = protect();
	const fromEmail = await auth.getEmail(userId);
	await prisma.invitation.create({
		data: {
			from: userId,
			fromEmail,
			to
		}
	});
});

export const respond = command(
	v.object({
		id: v.pipe(v.string(), v.uuid()),
		accepted: v.boolean()
	}),
	async (data) => {
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
	}
);

async function addPartner(
	db: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
	user: string,
	partner: string
) {
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

function protect(): string {
	const event = getRequestEvent();
	const { userId } = event.locals.auth();
	if (!userId) {
		error(403, "You don't have permission to perform this action");
	}
	return userId;
}
