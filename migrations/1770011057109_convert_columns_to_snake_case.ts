import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('entries').renameColumn('userEmail', 'user_email').execute();

	await db.schema.alterTable('entries').renameColumn('enteredAmount', 'entered_amount').execute();

	await db.schema
		.alterTable('entries')
		.renameColumn('enteredCurrency', 'entered_currency')
		.execute();

	await db.schema.alterTable('invitations').renameColumn('fromEmail', 'from_email').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('entries').renameColumn('user_email', 'userEmail').execute();

	await db.schema.alterTable('entries').renameColumn('entered_amount', 'enteredAmount').execute();

	await db.schema
		.alterTable('entries')
		.renameColumn('entered_currency', 'enteredCurrency')
		.execute();

	await db.schema.alterTable('invitations').renameColumn('from_email', 'fromEmail').execute();
}
