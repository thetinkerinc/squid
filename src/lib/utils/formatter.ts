import * as date from 'date-fns';

import { page } from '$app/state';
import local from '@thetinkerinc/isolocal';

function _date(d: Date, format?: string): string {
	if (!format) {
		if (date.isSameDay(new Date(), d)) {
			format = 'h:mm a';
		} else {
			format = 'ddd MMM D';
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
