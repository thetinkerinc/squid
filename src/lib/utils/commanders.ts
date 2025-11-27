import { error } from '@sveltejs/kit';
import { makeCommander } from '@thetinkerinc/commander';

export const Authenticated = makeCommander(({ event }) => {
	const { userId } = event.locals.auth();
	if (!userId) {
		error(403, "You don't have permission to perform this action");
	}
	return userId;
});
