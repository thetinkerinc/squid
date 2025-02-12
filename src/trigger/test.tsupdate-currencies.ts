import { task } from '@trigger.dev/sdk/v3';

export const updateCurrencies = task({
	id: 'update-currencies',
	run: async () => {
		console.log('hello');
	}
});
