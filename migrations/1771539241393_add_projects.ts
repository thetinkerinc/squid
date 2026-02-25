import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('projects')
		.ifNotExists()
		.addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('user', 'text', (c) => c.notNull())
		.addColumn('name', 'text', (c) => c.notNull())
		.execute();

	await db.schema.alterTable('entries').addColumn('project', 'uuid').execute();

	await db.schema.alterTable('partners').addColumn('project', 'uuid').execute();

	const allUsers = [
		...(await db.selectFrom('entries').select('user').distinct().execute()),
		...(await db.selectFrom('partners').select('user').distinct().execute())
	];
	const users = Array.from(new Set(allUsers.map((u) => u.user)));

	for (const user of users) {
		const project = await db
			.insertInto('projects')
			.values({
				user,
				name: 'default'
			})
			.returning('id')
			.executeTakeFirstOrThrow();

		await db
			.updateTable('entries')
			.where('user', '=', user)
			.set({
				project: project.id
			})
			.execute();

		await db
			.updateTable('partners')
			.where('user', '=', user)
			.set({
				project: project.id
			})
			.execute();
	}

	await db.schema
		.alterTable('entries')
		.alterColumn('project', (c) => c.setNotNull())
		.execute();

	await db.schema
		.alterTable('partners')
		.alterColumn('project', (c) => c.setNotNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('entries').dropColumn('project').execute();

	await db.schema.alterTable('partners').dropColumn('project').execute();

	await db.schema.dropTable('projects').execute();
}
