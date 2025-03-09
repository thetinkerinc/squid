import type { ServerRequestAuth, Client } from '@gel/auth-sveltekit/server';
import type { Local } from '@thetinkerinc/isolocal';
import type { User } from '$models';
import type { Currency } from '$types';

declare global {
	namespace App {
		interface Locals {
			auth: ServerRequestAuth;
			client: Client;
			authenticated: boolean;
			user?: Omit<User, 'identity', 'partners'>;
			localStorage: Local & {
				currency: Currency;
			};
		}
	}
}

export {};
