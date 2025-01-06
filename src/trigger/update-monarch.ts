import { schedules } from '@trigger.dev/sdk/v3';

import { client } from '$trpc/client';

export const updateMonarchTask = schedules.task({
	id: 'update-monarch-task',
	cron: '0 * * * *',
	run: async () => {
		console.log('updating monarch');
		const resp = await client.monarch.new.mutate();
		console.log(resp);
	}
});
