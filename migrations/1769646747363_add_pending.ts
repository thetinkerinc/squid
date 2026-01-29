import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('entries')
		.addColumn('pending', 'boolean', (c) => c.notNull().defaultTo(false))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('entries').dropColumn('pending').execute();
}
