import { withAccelerate } from '@prisma/extension-accelerate';
import { DATABASE_URL } from '$env/static/private';

import { PrismaClient } from '$prisma/client';

export type * from '$prisma/client';

const prisma = new PrismaClient({
	datasourceUrl: DATABASE_URL
}).$extends(withAccelerate());

export { prisma };
