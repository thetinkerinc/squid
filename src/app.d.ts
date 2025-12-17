/// <reference types="svelte-clerk/env" />

import type { Local } from '@thetinkerinc/isolocal';

import { CurrencyValue } from '$types';

declare global {
	type EnhanceParams<T> = Parameters<Parameters<T>[0]>[0];

	namespace App {
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
		interface Locals {
			localStorage: Local & {
				currency: CurrencyValue;
			};
		}
	}
}

export {};
