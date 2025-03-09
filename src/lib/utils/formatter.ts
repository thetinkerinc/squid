import dayjs from 'dayjs';

import { page } from '$app/state';
import local from '@thetinkerinc/isolocal';

import type { ConfigType } from 'dayjs';

function date(d: ConfigType, format?: string): string {
	const day = dayjs(d);
	if (!format) {
		if (day.isSame(dayjs(), 'day')) {
			format = 'h:mm a';
		} else {
			format = 'ddd MMM D';
		}
	}
	return day.format(format);
}

function money(amount: number): string {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currencyDisplay: 'narrowSymbol',
		currency: local.currency
	}).format(amount * page.data.currencies[local.currency].value);
}

export default {
	date,
	money
};
