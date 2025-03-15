import createClientAuth from '@gel/auth-sveltekit/client';
import { PUBLIC_APP_URL } from '$env/static/public';

import type { AuthOptions } from '@gel/auth-sveltekit/client';

const options: AuthOptions = {
	baseUrl: PUBLIC_APP_URL
};

const auth = createClientAuth(options);

export default auth;
export { options };
