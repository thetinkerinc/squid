import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import dayjs from "dayjs";
import { E as ExportDefault } from "../../../../chunks/index3.js";
const createContext = (event) => (_opts) => ({
  event
});
const t = initTRPC.context().create();
const router = t.router;
const procedure = t.procedure;
const app = router({
  entry: {
    create: procedure.input(
      z.object({
        type: z.enum(["income", "expense", "withdrawal"]),
        account: z.enum(["bank", "cash"]),
        amount: z.number().min(0),
        created: z.union([z.string().datetime(), z.date()]).optional().transform((d) => dayjs(d).toDate()),
        enteredAmount: z.number().min(0),
        enteredCurrency: z.string(),
        category: z.string().toLowerCase(),
        description: z.string().toLowerCase().optional().transform((d) => d === "" ? void 0 : d)
      })
    ).mutation(async ({ input, ctx }) => {
      const user = ExportDefault.select(ExportDefault.User, () => ({
        filter_single: {
          id: ctx.event.locals.user.id
        }
      }));
      await ExportDefault.insert(ExportDefault.Entry, {
        ...input,
        type: ExportDefault.cast(ExportDefault.EntryType, input.type),
        account: ExportDefault.cast(ExportDefault.AccountType, input.account),
        created: ExportDefault.cast(ExportDefault.datetime, input.created),
        user
      }).run(ctx.event.locals.client);
    }),
    delete: procedure.input(
      z.object({
        id: z.string().uuid()
      })
    ).mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ExportDefault.delete(ExportDefault.Entry, () => ({
        filter_single: {
          id
        }
      })).run(ctx.event.locals.client);
    })
  },
  invitation: {
    send: procedure.input(
      z.object({
        to: z.string().email()
      })
    ).mutation(async ({ input, ctx }) => {
      const user = ExportDefault.select(ExportDefault.User, () => ({
        filter_single: {
          id: ctx.event.locals.user.id
        }
      }));
      const to = ExportDefault.select(ExportDefault.User, () => ({
        filter_single: {
          email: input.to
        }
      }));
      await ExportDefault.insert(ExportDefault.Invitation, {
        from: user,
        to
      }).run(ctx.event.locals.client);
    }),
    respond: procedure.input(
      z.object({
        id: z.string().uuid(),
        accepted: z.boolean()
      })
    ).mutation(async ({ input, ctx }) => {
      const { id, accepted } = input;
      await ctx.event.locals.client.transaction(async (tx) => {
        const user = ExportDefault.select(ExportDefault.User, () => ({
          filter_single: {
            id: ctx.event.locals.user.id
          }
        }));
        const partner = ExportDefault.select(ExportDefault.Invitation, () => ({
          filter_single: {
            id
          }
        })).from;
        await ExportDefault.update(ExportDefault.Invitation, () => ({
          filter_single: {
            id
          },
          set: {
            accepted
          }
        })).run(tx);
        if (accepted) {
          await ExportDefault.update(ExportDefault.User, (u) => ({
            filter_single: ExportDefault.op(u.id, "=", partner.id),
            set: {
              partners: {
                "+=": user
              }
            }
          })).run(tx);
          await ExportDefault.update(ExportDefault.User, () => ({
            filter_single: {
              id: ctx.event.locals.user.id
            },
            set: {
              partners: {
                "+=": partner
              }
            }
          })).run(tx);
        }
      });
    })
  }
});
function makeHandler() {
  return (event) => fetchRequestHandler({
    req: event.request,
    router: app,
    endpoint: "/api",
    createContext: createContext(event)
  });
}
const GET = makeHandler();
const POST = makeHandler();
export {
  GET,
  POST
};
