import { sequence } from '@sveltejs/kit/hooks';
import { withClerkHandler } from 'svelte-clerk/server';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { addLocalStorage } from '@thetinkerinc/isolocal';

import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import { CLERK_SECRET_KEY } from '$env/static/private';

import type { Handle } from '@sveltejs/kit';

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
	addLocalStorage({})
);
