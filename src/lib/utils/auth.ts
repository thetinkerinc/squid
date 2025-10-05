import { clerkClient } from 'svelte-clerk/server';

async function getEmail(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	return user.emailAddresses[0].emailAddress;
}

async function getUserId(email: string) {
	const users = await clerkClient.users.getUserList({
		limit: 1,
		emailAddress: [email]
	});
	return users.data[0].id;
}

export default {
	getEmail,
	getUserId
};
