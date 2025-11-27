import { createClerkClient } from 'svelte-clerk/server';

import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import { CLERK_SECRET_KEY } from '$env/static/private';

async function getEmail(userId: string) {
	const clerk = getClerk();
	const user = await clerk.users.getUser(userId);
	return user.emailAddresses[0].emailAddress;
}

async function getUserId(email: string) {
	const clerk = getClerk();
	const users = await clerk.users.getUserList({
		limit: 1,
		emailAddress: [email]
	});
	if (users.totalCount === 0) {
		throw new Error(`No user found with email ${email}`);
	}
	return users.data[0].id;
}

function getClerk() {
	return createClerkClient({
		publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY,
		secretKey: CLERK_SECRET_KEY
	});
}

export default {
	getEmail,
	getUserId
};
