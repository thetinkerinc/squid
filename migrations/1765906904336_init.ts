import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createType('entry').asEnum(['expense', 'income', 'withrawal']).execute();
	await db.schema.createType('account').asEnum(['bank', 'cash']).execute();
	await db.schema.createType('currency').asEnum(['CAD', 'EUR', 'MXN', 'USD']).execute();

	await db.schema
		.createTable('partners')
		.ifNotExists()
		.addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('user', 'text', (c) => c.notNull())
		.addColumn('partners', sql`text[]`, (c) => c.notNull())
		.execute();

	await db.schema
		.createTable('entries')
		.ifNotExists()
		.addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('user', 'text', (c) => c.notNull())
		.addColumn('userEmail', 'text', (c) => c.notNull())
		.addColumn('created', 'timestamp', (c) => c.notNull().defaultTo(sql`now()`))
		.addColumn('type', sql`entry`, (c) => c.notNull())
		.addColumn('account', sql`account`, (c) => c.notNull())
		.addColumn('amount', 'numeric', (c) => c.notNull())
		.addColumn('enteredAmount', 'numeric', (c) => c.notNull())
		.addColumn('enteredCurrency', sql`currency`, (c) => c.notNull())
		.addColumn('category', 'text', (c) => c.notNull())
		.addColumn('description', 'text')
		.execute();

	await db.schema
		.createTable('invitations')
		.ifNotExists()
		.addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('from', 'text', (c) => c.notNull())
		.addColumn('fromEmail', 'text', (c) => c.notNull())
		.addColumn('to', 'text', (c) => c.notNull())
		.addColumn('sent', 'timestamp', (c) => c.notNull().defaultTo(sql`now()`))
		.addColumn('accepted', 'boolean')
		.execute();

	await db.schema
		.createTable('currencies')
		.ifNotExists()
		.addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('code', sql`currency`, (c) => c.notNull())
		.addColumn('name', 'text', (c) => c.notNull())
		.addColumn('symbol', 'text', (c) => c.notNull())
		.addColumn('value', 'numeric', (c) => c.notNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('partners').execute();
	await db.schema.dropTable('entries').execute();
	await db.schema.dropTable('invitations').execute();
	await db.schema.dropTable('currencies').execute();
}
