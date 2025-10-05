import { error } from '@sveltejs/kit';
import { command, getRequestEvent } from '$app/server';
import { clerkClient } from 'svelte-clerk/server';
import * as v from 'valibot';

import { prisma } from '$utils/prisma';

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
		const user = await clerkClient.users.getUser(userId);
		await prisma.entry.create({
			data: {
				...data,
				user: userId,
				userEmail: user.emailAddresses[0].emailAddress
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
	await prisma.invitation.create({
		data: {
			from: userId,
			to: users.data[0].emailAddresses[0].emailAddress
		}
	});
});

export const respond = command(
	v.object({
		id: v.pipe(v.string(), v.uuid()),
		from: v.string(),
		to: v.string(),
		accepted: v.boolean()
	}),
	async (data) => {
		await prisma.$transaction(async (tx) => {
			await tx.invitation.update({
				where: {
					id: data.id
				},
				data: {
					accepted: data.accepted
				}
			});
			if (data.accepted) {
				await tx.partners.upsert({
					where: {
						user: data.from
					},
					create: {
						user: data.from,
						partners: [data.to]
					},
					update: {
						partners: {
							push: data.to
						}
					}
				});
				await tx.partners.upsert({
					where: {
						user: data.to
					},
					create: {
						user: data.to,
						partners: [data.from]
					},
					update: {
						partners: {
							push: data.from
						}
					}
				});
			}
		});
	}
);

function protect(): string {
	const event = getRequestEvent();
	const { userId } = event.locals.auth();
	if (!userId) {
		error(403, "You don't have permission to perform this action");
	}
	return userId;
}
