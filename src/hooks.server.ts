import { sequence } from '@sveltejs/kit/hooks';
import { withClerkHandler } from 'svelte-clerk/server';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { addLocalStorage } from '@thetinkerinc/isolocal';

import { env } from '$env/dynamic/public';

import { CurrencyType } from '$prisma/enums';

import type { Handle } from '@sveltejs/kit';

const debug: Handle = ({ event, resolve }) => {
	console.log('handling request');
	console.log(env.PUBLIC_CLERK_PUBLISHABLE_KEY);
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
	debug,
	handleParaglide,
	withClerkHandler(),
	addLocalStorage({
		currency: CurrencyType.CAD
	})
);
