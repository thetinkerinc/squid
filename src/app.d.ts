import type { ServerRequestAuth, Client } from '@edgedb/auth-sveltekit/server';
import type { User } from '$models';

declare global {
	namespace App {
		interface Locals {
			auth: ServerRequestAuth;
			client: Client;
			authenticated: boolean;
			user?: Omit<User, 'identity'>;
		}
	}
}

export {};
