import { z } from 'zod';

import { router, procedure } from './context';

export const app = router({
	hello: procedure.input(z.string()).query(()=>{
		console.log('hello');
	})
});

export type App = typeof app;
