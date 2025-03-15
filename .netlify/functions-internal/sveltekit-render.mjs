import { init } from '../serverless.js';

export const handler = init((() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["bg.jpg","favicon.png","squid.png"]),
	mimeTypes: {".jpg":"image/jpeg",".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.CKy-PuOB.js",app:"_app/immutable/entry/app.S2OTd31_.js",imports:["_app/immutable/entry/start.CKy-PuOB.js","_app/immutable/chunks/HK3yEnHC.js","_app/immutable/entry/app.S2OTd31_.js","_app/immutable/chunks/zEEiWdjL.js","_app/immutable/chunks/DbNt_nLg.js","_app/immutable/chunks/HK3yEnHC.js","_app/immutable/chunks/Bc-3cMQX.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js')),
			__memo(() => import('../server/nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/[...paths]",
				pattern: /^\/api(?:\/(.*))?\/?$/,
				params: [{"name":"paths","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/_...paths_/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})());
