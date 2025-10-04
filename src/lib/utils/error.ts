import * as v from 'valibot';
import { toast } from 'svelte-sonner';

import * as m from '$paraglide/messages';

function notify(err: unknown) {
	if (v.isValiError(err)) {
		toast.error(err.message);
	} else {
		toast.error(m.error_generic_message(), {
			action: {
				label: m.error_generic_action(),
				onClick: () => {
					window.open('https://github.com/thetinkerinc/tempo/issues/new', '_blank')?.focus();
				}
			}
		});
	}
}

export default {
	notify
};
