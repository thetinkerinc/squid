import dayjs from 'dayjs';

import local from '$utils/local';
import currencies from '$utils/currencies';

import type { ConfigType } from 'dayjs';
import type { Currency } from '$utils/currencies';

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
	const currency: Currency = local.get('currency', 'CAD');
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currencyDisplay: 'narrowSymbol',
		currency
	}).format(amount * currencies[currency].value);
}

export default {
	date,
	money
};
