import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { withClerkHandler } from 'svelte-clerk/server';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { addLocalStorage } from '@thetinkerinc/isolocal';

import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import { CLERK_SECRET_KEY } from '$env/static/private';

import { CurrencyType } from '$types';

import type { Handle } from '@sveltejs/kit';

const handleRedirect: Handle = ({ event, resolve }) => {
	const { userId } = event.locals.auth();
	if (event.url.pathname === '/' && userId) {
		redirect(307, '/dashboard');
	}
	if (event.url.pathname === '/dashboard' && !userId) {
		redirect(307, '/');
	}
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle: Handle = sequence(
	handleParaglide,
	withClerkHandler({
		publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY,
		secretKey: CLERK_SECRET_KEY
	}),
	addLocalStorage({
		currency: CurrencyType.CAD
	}),
	handleRedirect
);
