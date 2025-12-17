import { Pool } from 'pg';
import { PostgresDialect } from 'kysely';
import { defineConfig } from 'kysely-ctl';

const dialect = new PostgresDialect({
	pool: new Pool({
		connectionString: process.env.DATABASE_URL
	})
});

export default defineConfig({
	dialect,
	migrations: {
		migrationFolder: './migrations'
	}
});
