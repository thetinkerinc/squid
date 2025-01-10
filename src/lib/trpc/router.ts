import { z } from 'zod';

import e from '$eql';

import { router, procedure } from './context';

export const app = router({
	entry: {
		create: procedure
			.input(
				z.object({
					type: z.enum(['income', 'expense', 'withdrawal']),
					account: z.enum(['bank', 'cash']),
					amount: z.number().min(0),
					category: z.string().toLowerCase(),
					description: z.string().optional()
				})
			)
			.mutation(async ({ input, ctx }) => {
				const user = e.select(e.User, () => ({
					filter_single: {
						id: ctx.event.locals.user.id
					}
				}));
				await e
					.insert(e.Entry, {
						...input,
						type: e.cast(e.EntryType, input.type),
						account: e.cast(e.AccountType, input.account),
						user
					})
					.run(ctx.event.locals.client);
			})
	}
});

export type App = typeof app;
