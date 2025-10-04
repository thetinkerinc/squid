/// <reference types="svelte-clerk/env" />

import type { Local } from '@thetinkerinc/isolocal';

import { CurrencyType } from '$prisma/enums';

declare global {
	namespace App {
		interface Locals {
			localStorage: Local & {
				currency: CurrencyType;
			};
		}
	}
}

export {};
