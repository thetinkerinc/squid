import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	const partners = await db.selectFrom('partners').selectAll().execute();

	await db.deleteFrom('partners').execute();

	await db.schema.alterTable('partners').dropConstraint('partners_user_key').execute();

	await db.schema.alterTable('partners').dropColumn('partners').execute();

	await db.schema
		.alterTable('partners')
		.addColumn('partner', 'text', (c) => c.notNull())
		.execute();

	await db.schema
		.alterTable('partners')
		.addUniqueConstraint('user_partners_unique', ['user', 'partner'])
		.execute();

	for (const entry of partners) {
		for (const partner of entry.partners) {
			await db
				.insertInto('partners')
				.values({
					user: entry.user,
					partner
				})
				.execute();
		}
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	const partners = await db.selectFrom('partners').selectAll().execute();

	await db.deleteFrom('partners').execute();

	await db.schema.alterTable('partners').dropConstraint('user_partners_unique').execute();

	await db.schema.alterTable('partners').dropColumn('partner').execute();

	await db.schema
		.alterTable('partners')
		.addColumn('partners', sql`text[]`, (c) => c.notNull())
		.execute();

	await db.schema
		.alterTable('partners')
		.addUniqueConstraint('partners_user_key', ['user'])
		.execute();

	const map = partners.reduce((a, v) => {
		a[v.user] = a[v.user] ?? [];
		a[v.user].push(v.partner);
		return a;
	}, {});

	for (const [user, partners] of Object.entries(map)) {
		await db
			.insertInto('partners')
			.values({
				user,
				partners
			})
			.execute();
	}
}
