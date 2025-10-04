/// <reference types="svelte-clerk/env" />

import type { Local } from '@thetinkerinc/isolocal';

declare global {
	namespace App {
		interface Locals {
			localStorage: Local & {
				sessionStarted?: number;
				sessionPauses: number[];
			};
		}
	}
}

export {};
