import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from '$prisma/client';

export type * from '$prisma/client';

function getPrisma() {
	return new PrismaClient({
		datasourceUrl: process.env.DATABASE_URL!
	}).$extends(withAccelerate());
}

export { getPrisma };
