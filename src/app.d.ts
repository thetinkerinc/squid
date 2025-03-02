import type { ServerRequestAuth, Client } from '@gel/auth-sveltekit/server';
import type { LocalStorage } from '@thetinkerinc/isolocal';
import type { User } from '$models';

declare global {
	namespace App {
		interface Locals {
			auth: ServerRequestAuth;
			client: Client;
			authenticated: boolean;
			user?: Omit<User, 'identity', 'partners'>;
			localStorage: LocalStorage;
		}
	}
}

export {};
