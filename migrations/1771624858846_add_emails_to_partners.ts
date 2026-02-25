import { createClerkClient } from '@clerk/backend';

import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

	const partners = await db.selectFrom('partners').selectAll().execute();

	await db.schema
		.alterTable('partners')
		.addColumn('user_email', 'text')
		.addColumn('partner_email', 'text')
		.execute();

	for (const partner of partners) {
		const userEmail = (await clerk.users.getUser(partner.user)).emailAddresses[0].emailAddress;
		const partnerId = (
			await clerk.users.getUserList({
				limit: 1,
				emailAddress: [partner.partner]
			})
		).data[0].id;

		await db
			.updateTable('partners')
			.where('id', '=', partner.id)
			.set((s) => ({
				user_email: userEmail,
				partner_email: s.ref('partner'),
				partner: partnerId
			}))
			.execute();
	}

	await db.schema
		.alterTable('partners')
		.alterColumn('user_email', (c) => c.setNotNull())
		.alterColumn('partner_email', (c) => c.setNotNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	const partners = await db.selectFrom('partners').selectAll().execute();

	await db.schema
		.alterTable('partners')
		.dropColumn('user_email')
		.dropColumn('partner_email')
		.execute();

	for (const partner of partners) {
		await db
			.updateTable('partners')
			.where('id', '=', partner.id)
			.set({
				partner: partner.partnerEmail
			})
			.execute();
	}
}
