import { g as getPageData } from "../../chunks/index.svelte.js";
import * as _ from "radashi";
import { E as ExportDefault } from "../../chunks/index3.js";
async function getCurrencies(client) {
  const currencies = await ExportDefault.select(ExportDefault.Currency, () => ({
    code: true,
    symbol: true,
    name: true,
    value: true
  })).run(client);
  return _.objectify(currencies, (c) => c.code);
}
const load = async (event) => {
  const { authenticated, user } = event.locals;
  return {
    ...getPageData(event),
    currencies: await getCurrencies(event.locals.client),
    authenticated,
    user
  };
};
export {
  load
};
