import { browser } from '$app/environment';
import { page } from '$app/state';
import browserCookies from 'js-cookie';
import * as devalue from 'devalue';

import type { Cookies as SvelteKitCookies, Handle, RequestEvent } from '@sveltejs/kit';

type BrowserCookies = typeof browserCookies;
type CookieJar = SvelteKitCookies | BrowserCookies;
type Cookies = CookieJar & { rm: SvelteKitCookies['delete'] | BrowserCookies['remove'] };

class Local {
	private cookies: Cookies | undefined = undefined;

	constructor(cookieJar?: CookieJar) {
		if (browser) {
			(browserCookies as Cookies).rm = browserCookies.remove;
			this.cookies = browserCookies as Cookies;
		} else if (cookieJar) {
			(cookieJar as Cookies).rm = (cookieJar as SvelteKitCookies).delete;
			this.cookies = cookieJar as Cookies;
		}
	}

	get(k: string, fallback?: unknown) {
		const vals = this.getAll();
		return vals[k] ?? fallback;
	}

	set(k: string, val: unknown) {
		const vals = this.getAll();
		vals[k] = val;
		this.save(vals);
	}

	rm(k: string) {
		const vals = this.getAll();
		delete vals[k];
		this.save(vals);
	}

	clear() {
		if (!this.cookies) {
			throw new Error('Local storage can only be cleared in load functions and in the browser');
		}
		this.cookies.rm('_ls', { path: '/' });
	}

	getAll() {
		if (this.cookies) {
			return devalue.parse(this.cookies.get('_ls') ?? '[{}]');
		} else {
			return page.data.localStorage ?? {};
		}
	}

	save(vals: unknown) {
		if (!this.cookies) {
			throw new Error('Local storage can only be set in load functions and in the browser');
		}
		this.cookies.set('_ls', devalue.stringify(vals), {
			expires: nextYear(),
			path: '/'
		});
	}
}

function nextYear() {
	return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
}

const addLocalStorage: Handle = ({ event, resolve }) => {
	event.locals.localStorage = new Local(event.cookies);
	return resolve(event);
};

function getPageData(event: RequestEvent) {
	const { localStorage } = event.locals;
	return {
		localStorage: localStorage.getAll()
	};
}

const local = new Local();

export { addLocalStorage, getPageData };
export default local;
export type LocalStorage = typeof local;
