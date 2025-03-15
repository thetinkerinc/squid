import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.rcy_kBkA.js","_app/immutable/chunks/DbNt_nLg.js","_app/immutable/chunks/HK3yEnHC.js","_app/immutable/chunks/DVDHlWwQ.js","_app/immutable/chunks/Bc-3cMQX.js","_app/immutable/chunks/zEEiWdjL.js","_app/immutable/chunks/BdkUs9cw.js"];
export const stylesheets = ["_app/immutable/assets/0.Bv_RPgmn.css","_app/immutable/assets/index.DKF17Rty.css"];
export const fonts = [];
