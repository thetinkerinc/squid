import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { createContext } from '$trpc/context';
import { app } from '$trpc/router';

import type { RequestHandler } from '@sveltejs/kit';

function makeHandler(): RequestHandler {
	return (event) =>
		fetchRequestHandler({
			req: event.request,
			router: app,
			endpoint: '/api',
			createContext: createContext(event)
		});
}

export const GET = makeHandler();
export const POST = makeHandler();
