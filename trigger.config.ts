import { defineConfig } from '@trigger.dev/sdk/v3';
import { syncEnvVars } from '@trigger.dev/build/extensions/core';
import { InfisicalSDK } from '@infisical/sdk';

export default defineConfig({
	project: 'proj_ogmcdcbnihfklsakogcn',
	runtime: 'node',
	logLevel: 'log',
	maxDuration: 3600,
	retries: {
		enabledInDev: true,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true
		}
	},
	build: {
		extensions: [
			syncEnvVars(async (ctx) => {
				const client = new InfisicalSDK();

				await client.auth().universalAuth.login({
					clientId: ctx.env.INFISICAL_CLIENT_ID,
					clientSecret: ctx.env.INFISICAL_CLIENT_SECRET
				});

				const { secrets } = await client.secrets().listSecrets({
					environment: ctx.environment,
					projectId: ctx.env.INFISICAL_PROJECT_ID
				});

				return secrets.map((s) => ({
					name: s.secretKey,
					value: s.secretValue
				}));
			})
		]
	},
	dirs: ['./src/trigger']
});
