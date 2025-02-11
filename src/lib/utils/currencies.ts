const currencies = {
	EUR: {
		name: 'Euro',
		symbol: '€',
		value: 0.6770577923
	},
	USD: {
		name: 'US Dollar',
		symbol: '$',
		value: 0.6975445685
	},
	CAD: {
		name: 'Canadian Dollar',
		symbol: '$',
		value: 1
	},
	MXN: {
		name: 'Mexican Peso',
		symbol: '$',
		value: 14.3832872123
	}
};

export default currencies;
export type Currency = keyof typeof currencies;
