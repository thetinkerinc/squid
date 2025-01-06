import { initTRPC } from '@trpc/server';

import type { RequestEvent } from '@sveltejs/kit';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const createContext = (event: RequestEvent) => (_opts: FetchCreateContextFnOptions) => ({
	event
});

const t = initTRPC.context<ReturnType<typeof createContext>>().create();

export const router = t.router;
export const procedure = t.procedure;
