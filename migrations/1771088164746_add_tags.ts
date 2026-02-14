import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('tags')
		.addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('entry_id', 'uuid', (c) => c.notNull().references('entries.id').onDelete('cascade'))
		.addColumn('title', 'text', (c) => c.notNull())
		.addColumn('content', 'text', (c) => c.notNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('tags').execute();
}
