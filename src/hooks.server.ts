import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createClient } from 'edgedb';
import serverAuth from '@edgedb/auth-sveltekit/server';

import e from '$eql';
import { i18n } from '$lib/i18n';
import { options } from '$lib/auth';

import type { Handle } from '@sveltejs/kit';
import type { AuthRouteHandlers, TokenData } from '@edgedb/auth-sveltekit/server';

const client = createClient({
	tlsSecurity: 'insecure'
});

const { createServerRequestAuth, createAuthRouteHook } = serverAuth(client, options);

const handleAuth: Handle = async ({ event, resolve }) => {
	event.locals.auth = createServerRequestAuth(event);
	event.locals.client = event.locals.auth.session.client;

	try {
		const user = await e
			.select(e.User, (user) => ({
				id: true,
				email: true,
				is_admin: true,
				is_monarch: true,
				settings: {
					id: true,
					royalty: true
				},
				filter_single: e.op(user.identity, '=', e.ext.auth.global.ClientTokenIdentity)
			}))
			.run(event.locals.client);
		if (!user) {
			throw new Error('No active user found');
		}
		event.locals.authenticated = true;
		event.locals.user = user;
	} catch (_err) {
		event.locals.authenticated = false;
	}

	return await resolve(event);
};

const authRouteHandlers: AuthRouteHandlers = {
	async onBuiltinUICallback({ error, tokenData, provider }) {
		if (error) {
			console.log('error handling auth');
			console.log(error);
		}
		if (provider === 'builtin::oauth_google') {
			await handleGoogle(tokenData);
		} else if (tokenData?.identity_id) {
			await handleMagicLink(tokenData);
		}
		redirect(303, '/');
	},
	async onMagicLinkCallback() {
		console.log('magic link');
		redirect(303, '/');
	},
	onSignout() {
		redirect(303, '/');
	}
};

async function handleGoogle(tokenData: TokenData) {
	const resp = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
		headers: {
			authorization: `Bearer ${tokenData.provider_token}`
		}
	});
	const json = await resp.json();
	await makeUser(tokenData, json.email);
}

async function handleMagicLink(tokenData: TokenData) {
	const signup = await e
		.select(e.ext.auth.MagicLinkFactor, (factor) => ({
			email: true,
			filter_single: e.op(factor.identity.id, '=', e.uuid(tokenData.identity_id!))
		}))
		.run(client);
	if (signup?.email) {
		await makeUser(tokenData, signup.email);
	}
}

async function makeUser(tokenData: TokenData, email: string) {
	const getIdentity = e.select(e.ext.auth.Identity, () => ({
		filter_single: {
			id: tokenData.identity_id
		}
	}));
	await e
		.insert(e.User, {
			email,
			identity: getIdentity,
			settings: e.insert(e.UserSettings, {})
		})
		.unlessConflict((user) => ({
			on: user.email,
			else: e.update(user, () => ({
				set: {
					identity: {
						'+=': getIdentity
					}
				}
			}))
		}))
		.run(client);
}

export const handle: Handle = sequence(
	i18n.handle(),
	handleAuth,
	createAuthRouteHook(authRouteHandlers)
);
