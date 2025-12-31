import { error } from '@sveltejs/kit';
import { makeCommander } from '@thetinkerinc/commander';

import { getDb } from '$utils/db';

export const Anonymous = makeCommander(async () => {
	const db = await getDb();
	return {
		db
	};
});

export const Authenticated = makeCommander(async ({ event }) => {
	const { userId } = event.locals.auth();
	if (!userId) {
		error(403, "You don't have permission to perform this action");
	}
	const db = await getDb();
	return {
		userId,
		db
	};
});
