import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	const { authenticated, user } = event.locals;
	return {
		authenticated,
		user
	};
};
