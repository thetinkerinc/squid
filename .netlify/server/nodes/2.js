import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.CE0I6xf8.js","_app/immutable/chunks/DbNt_nLg.js","_app/immutable/chunks/HK3yEnHC.js","_app/immutable/chunks/Bc-3cMQX.js","_app/immutable/chunks/BdkUs9cw.js","_app/immutable/chunks/DVDHlWwQ.js","_app/immutable/chunks/DSKFzVKS.js"];
export const stylesheets = ["_app/immutable/assets/2.mgrrIxE-.css","_app/immutable/assets/index.DKF17Rty.css"];
export const fonts = [];
