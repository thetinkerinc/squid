import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	const invitations = await db.selectFrom('invitations').selectAll().execute();

	await db.schema.alterTable('invitations').addColumn('project', 'uuid').execute();

	for (const invitation of invitations) {
		const project = await db
			.selectFrom('projects')
			.select(['id'])
			.where('user', '=', invitation.from)
			.limit(1)
			.executeTakeFirstOrThrow();

		await db
			.updateTable('invitations')
			.where('id', '=', invitation.id)
			.set({ project: project.id })
			.execute();
	}

	await db.schema
		.alterTable('invitations')
		.alterColumn('project', (c) => c.setNotNull())
		.execute();

	await db
		.deleteFrom('partners')
		.where((w) =>
			w.not(
				w.exists(
					w
						.selectFrom('invitations')
						.whereRef('invitations.from', '=', 'partners.user')
						.whereRef('invitations.to', '=', 'partners.partner_email')
				)
			)
		)
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('invitations').dropColumn('project').execute();
}
