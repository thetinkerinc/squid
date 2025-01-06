import { createTRPCClient, httpBatchLink } from '@trpc/client';

import type { App } from './router';

export const client = createTRPCClient<App>({
	links: [httpBatchLink({ url: 'http://localhost:5173/api' })]
});
