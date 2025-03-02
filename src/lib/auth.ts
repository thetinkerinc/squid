import createClientAuth from '@gel/auth-sveltekit/client';

import type { AuthOptions } from '@gel/auth-sveltekit/client';

const options: AuthOptions = {
	baseUrl: 'http://localhost:5173'
};

const auth = createClientAuth(options);

export default auth;
export { options };
