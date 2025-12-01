import local from '@thetinkerinc/isolocal';
import * as date from 'date-fns';

import { page } from '$app/state';

function _date(d: Date | string | undefined, format?: string): string {
	if (d === undefined || d === '') {
		d = new Date();
	} else if (typeof d === 'string') {
		d = new Date(d);
	}
	if (!format) {
		if (date.isSameDay(new Date(), d)) {
			format = 'h:mm aaa';
		} else {
			format = 'eee MMM d';
		}
	}
	return date.format(d, format);
}

function money(amount: number): string {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currencyDisplay: 'narrowSymbol',
		currency: local.currency
	}).format(amount * page.data.currencies[local.currency].value);
}

export default {
	date: _date,
	money
};
