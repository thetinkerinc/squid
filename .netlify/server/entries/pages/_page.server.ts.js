import { E as ExportDefault } from "../../chunks/index3.js";
async function getTotals(client, partners) {
  const entries = ExportDefault.select(ExportDefault.Entry, (entry) => ({
    filter: ExportDefault.op(entry.user, "in", partners)
  }));
  const income = ExportDefault.select(entries, (entry) => ({
    filter: ExportDefault.op(entry.type, "=", ExportDefault.EntryType.income)
  }));
  const bankIncome = ExportDefault.select(income, (entry) => ({
    filter: ExportDefault.op(entry.account, "=", ExportDefault.AccountType.bank)
  }));
  const cashIncome = ExportDefault.select(income, (entry) => ({
    filter: ExportDefault.op(entry.account, "=", ExportDefault.AccountType.cash)
  }));
  const expense = ExportDefault.select(entries, (entry) => ({
    filter: ExportDefault.op(entry.type, "=", ExportDefault.EntryType.expense)
  }));
  const bankExpense = ExportDefault.select(expense, (entry) => ({
    filter: ExportDefault.op(entry.account, "=", ExportDefault.AccountType.bank)
  }));
  const cashExpense = ExportDefault.select(expense, (entry) => ({
    filter: ExportDefault.op(entry.account, "=", ExportDefault.AccountType.cash)
  }));
  const withdrawal = ExportDefault.select(entries, (entry) => ({
    filter: ExportDefault.op(entry.type, "=", ExportDefault.EntryType.withdrawal)
  }));
  return await ExportDefault.select({
    income: ExportDefault.sum(income.amount),
    bankIncome: ExportDefault.sum(bankIncome.amount),
    cashIncome: ExportDefault.sum(cashIncome.amount),
    expense: ExportDefault.sum(expense.amount),
    bankExpense: ExportDefault.sum(bankExpense.amount),
    cashExpense: ExportDefault.sum(cashExpense.amount),
    withdrawal: ExportDefault.sum(withdrawal.amount)
  }).run(client);
}
async function getEntries(client, partners) {
  return await ExportDefault.select(ExportDefault.Entry, (entry) => ({
    id: true,
    created: true,
    type: true,
    account: true,
    amount: true,
    enteredAmount: true,
    enteredCurrency: true,
    category: true,
    description: true,
    user: {
      email: true
    },
    filter: ExportDefault.op(entry.user, "in", partners),
    order_by: {
      expression: entry.created,
      direction: ExportDefault.DESC
    }
  })).run(client);
}
async function getInvitations(client, user) {
  return await ExportDefault.select(ExportDefault.Invitation, (invitation) => ({
    id: true,
    from: {
      email: true
    },
    sent: true,
    filter: ExportDefault.op(
      ExportDefault.op(invitation.to, "=", user),
      "and",
      ExportDefault.op("not", ExportDefault.op("exists", invitation.accepted))
    ),
    order_by: {
      expression: invitation.sent,
      direction: ExportDefault.DESC
    }
  })).run(client);
}
const load = async (event) => {
  if (event.locals.authenticated) {
    const user = ExportDefault.select(ExportDefault.User, () => ({
      filter_single: {
        id: event.locals.user.id
      }
    }));
    const partners = ExportDefault.select(ExportDefault.User, (u) => {
      const isUser = ExportDefault.op(u, "=", user);
      const isPartner = ExportDefault.op(u, "in", user.partners);
      return {
        filter: ExportDefault.op(isUser, "or", isPartner)
      };
    });
    return {
      totals: await getTotals(event.locals.client, partners),
      entries: await getEntries(event.locals.client, partners),
      invitations: await getInvitations(event.locals.client, user)
    };
  }
};
export {
  load
};
