import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { PUBLIC_APP_URL } from '$env/static/public';

import type { App } from './router';

export const client = createTRPCClient<App>({
	links: [httpBatchLink({ url: new URL('/api', PUBLIC_APP_URL).toString() })]
});
