import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import { dev } from '$app/environment';
import { DATABASE_URL } from '$env/static/private';

import { PrismaClient } from '$prisma/client';

export type * from '$prisma/client';

let prisma: PrismaClient;

if (dev) {
	const adapter = new PrismaPg({
		connectionString: DATABASE_URL,
		ssl: false,
		max: 1,
		connectionTimeoutMillis: 0,
		idleTimeoutMillis: 1
	});
	prisma = new PrismaClient({ adapter });
} else {
	neonConfig.webSocketConstructor = WebSocket;
	neonConfig.poolQueryViaFetch = true;

	const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
	prisma = new PrismaClient({ adapter });
}

export { prisma };
