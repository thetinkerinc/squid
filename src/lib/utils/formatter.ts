import dayjs from 'dayjs';

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
	return new Intl.NumberFormat('en-CA', {
		style: 'currency',
		currency: 'CAD',
		currencyDisplay: 'narrowSymbol'
	}).format(amount);
}

export default {
	date,
	money
};
