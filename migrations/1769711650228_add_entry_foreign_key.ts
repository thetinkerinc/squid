import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('entries').addColumn('parent', 'uuid').execute();

	await db.schema
		.alterTable('entries')
		.addForeignKeyConstraint('entry_parent', ['parent'], 'entries', ['id'], (c) =>
			c.onDelete('cascade')
		)
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('entries').dropConstraint('entry_parent').execute();

	await db.schema.alterTable('entries').dropColumn('parent').execute();
}
