import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	driver: 'pglite',
	dbCredentials: {
		url: './data/db/'
	}
});
