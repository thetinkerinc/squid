import { sequence } from '@sveltejs/kit/hooks';
import { withClerkHandler } from 'svelte-clerk/server';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { addLocalStorage } from '@thetinkerinc/isolocal';

import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

import { CurrencyType } from '$prisma/enums';

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
		publishableKey: publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY,
		secretKey: privateEnv.CLERK_SECRET_KEY
	}),
	addLocalStorage({
		currency: CurrencyType.CAD
	})
);
