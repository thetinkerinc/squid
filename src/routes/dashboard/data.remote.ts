import { error } from '@sveltejs/kit';
import { command, getRequestEvent } from '$app/server';

import { prisma } from '$utils/prisma';

import schema from './schema';

export const addEntry = command(schema.entry, async (data) => {
	const userId = protect();
	await prisma.entry.create({
		data: {
			user: userId,
			...data
		}
	});
});

export const updateEntry = command(schema.updateEntry, async (data) => {
	protect();
	await prisma.entry.update({
		where: {
			id: data.id
		},
		data: data.data
	});
});

function protect(): string {
	const event = getRequestEvent();
	const { userId } = event.locals.auth();
	if (!userId) {
		error(403, "You don't have permission to perform this action");
	}
	return userId;
}
