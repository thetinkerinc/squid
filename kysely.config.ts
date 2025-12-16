import { KyselyPGlite } from 'kysely-pglite';
import { defineConfig } from 'kysely-ctl';

const { dialect } = await KyselyPGlite.create('./data/db');

export default defineConfig({
	dialect,
	migrations: {
		migrationFolder: './migrations'
	}
});
