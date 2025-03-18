import { dev } from '$app/environment';
import { createClient as createGelClient } from 'gel';
import { GEL_INSTANCE, GEL_SECRET_KEY } from '$env/static/private';

function createClient() {
	if (dev) {
		return createGelClient({
			tlsSecurity: 'insecure'
		});
	}
	return createGelClient({
		instanceName: GEL_INSTANCE,
		secretKey: GEL_SECRET_KEY
	});
}

export { createClient };
