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
	},
	invitation: {
		send: procedure
			.input(
				z.object({
					to: z.string().email()
				})
			)
			.mutation(async ({ input, ctx }) => {
				const user = e.select(e.User, () => ({
					filter_single: {
						id: ctx.event.locals.user.id
					}
				}));
				const to = e.select(e.User, () => ({
					filter_single: {
						email: input.to
					}
				}));
				await e
					.insert(e.Invitation, {
						from: user,
						to
					})
					.run(ctx.event.locals.client);
			}),
		respond: procedure
			.input(
				z.object({
					id: z.string().uuid(),
					accepted: z.boolean()
				})
			)
			.mutation(async ({ input, ctx }) => {
				const { id, accepted } = input;
				await ctx.event.locals.client.transaction(async (tx) => {
					const user = e.select(e.User, () => ({
						filter_single: {
							id: ctx.event.locals.user.id
						}
					}));
					const partner = e.select(e.Invitation, () => ({
						filter_single: {
							id
						}
					})).from;
					await e
						.update(e.Invitation, () => ({
							filter_single: {
								id
							},
							set: {
								accepted
							}
						}))
						.run(tx);
					if (accepted) {
						await e
							.update(e.User, (u) => ({
								filter_single: e.op(u.id, '=', partner.id),
								set: {
									partners: {
										'+=': user
									}
								}
							}))
							.run(tx);
						await e
							.update(e.User, () => ({
								filter_single: {
									id: ctx.event.locals.user.id
								},
								set: {
									partners: {
										'+=': partner
									}
								}
							}))
							.run(tx);
					}
				});
			})
	}
});

export type App = typeof app;
