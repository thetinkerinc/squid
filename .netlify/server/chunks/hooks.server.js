import { r as redirect } from "./index2.js";
import { createClient } from "gel";
import serverAuth from "@gel/auth-sveltekit/server";
import { a as addLocalStorage } from "./index.svelte.js";
import { E as ExportDefault } from "./index3.js";
import { i as i18n } from "./i18n.js";
import { o as options } from "./auth.js";
function sequence(...handlers) {
  const length = handlers.length;
  if (!length) return ({ event, resolve }) => resolve(event);
  return ({ event, resolve }) => {
    return apply_handle(0, event, {});
    function apply_handle(i, event2, parent_options) {
      const handle2 = handlers[i];
      return handle2({
        event: event2,
        resolve: (event3, options2) => {
          const transformPageChunk = async ({ html, done }) => {
            if (options2?.transformPageChunk) {
              html = await options2.transformPageChunk({ html, done }) ?? "";
            }
            if (parent_options?.transformPageChunk) {
              html = await parent_options.transformPageChunk({ html, done }) ?? "";
            }
            return html;
          };
          const filterSerializedResponseHeaders = parent_options?.filterSerializedResponseHeaders ?? options2?.filterSerializedResponseHeaders;
          const preload = parent_options?.preload ?? options2?.preload;
          return i < length - 1 ? apply_handle(i + 1, event3, {
            transformPageChunk,
            filterSerializedResponseHeaders,
            preload
          }) : resolve(event3, { transformPageChunk, filterSerializedResponseHeaders, preload });
        }
      });
    }
  };
}
const client = createClient({
  tlsSecurity: "insecure"
});
const { createServerRequestAuth, createAuthRouteHook } = serverAuth(client, options);
const handleAuth = async ({ event, resolve }) => {
  event.locals.auth = createServerRequestAuth(event);
  event.locals.client = event.locals.auth.session.client;
  try {
    const user = await ExportDefault.select(ExportDefault.User, (user2) => ({
      id: true,
      email: true,
      is_admin: true,
      partners: {
        email: true
      },
      filter_single: ExportDefault.op(ExportDefault.ext.auth.global.ClientTokenIdentity, "in", user2.identity)
    })).run(event.locals.client);
    if (!user) {
      throw new Error("No active user found");
    }
    event.locals.authenticated = true;
    event.locals.user = user;
  } catch (_err) {
    event.locals.authenticated = false;
  }
  return await resolve(event);
};
const authRouteHandlers = {
  async onBuiltinUICallback({ error, tokenData, provider }) {
    if (error) {
      console.log("error handling auth");
      console.log(error);
    }
    if (provider === "builtin::oauth_google") {
      await handleGoogle(tokenData);
    } else if (tokenData?.identity_id) {
      await handleMagicLink(tokenData);
    }
    redirect(303, "/");
  },
  onSignout() {
    redirect(303, "/");
  }
};
async function handleGoogle(tokenData) {
  const resp = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
    headers: {
      authorization: `Bearer ${tokenData.provider_token}`
    }
  });
  const json = await resp.json();
  await makeUser(tokenData, json.email);
}
async function handleMagicLink(tokenData) {
  const signup = await ExportDefault.select(ExportDefault.ext.auth.MagicLinkFactor, (factor) => ({
    email: true,
    filter_single: ExportDefault.op(factor.identity.id, "=", ExportDefault.uuid(tokenData.identity_id))
  })).run(client);
  if (signup?.email) {
    await makeUser(tokenData, signup.email);
  }
}
async function makeUser(tokenData, email) {
  const getIdentity = ExportDefault.select(ExportDefault.ext.auth.Identity, () => ({
    filter_single: {
      id: tokenData.identity_id
    }
  }));
  await ExportDefault.insert(ExportDefault.User, {
    email,
    identity: getIdentity
  }).unlessConflict((user) => ({
    on: user.email,
    else: ExportDefault.update(user, () => ({
      set: {
        identity: {
          "+=": getIdentity
        }
      }
    }))
  })).run(client);
}
const handle = sequence(
  i18n.handle(),
  addLocalStorage({ currency: "CAD" }),
  handleAuth,
  createAuthRouteHook(authRouteHandlers)
);
export {
  handle
};
