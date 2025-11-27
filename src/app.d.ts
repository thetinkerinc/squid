/// <reference types="svelte-clerk/env" />

import type { Local } from '@thetinkerinc/isolocal';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
		interface Locals {
			localStorage: Local;
		}
	}
}

export {};
