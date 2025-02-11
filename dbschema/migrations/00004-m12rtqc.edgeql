CREATE MIGRATION m1rqhjm2czptgbdasehofolqzw7d54qk7mm2hh6zp6vzstody3oxdq
ONTO m1ohlbwlb34d76hpuqyaf6kzny3ya4ttkgir2gza3gsuzvsxita6ua
{
	ALTER TYPE default::Currencies RENAME TO default::Currency;

	insert Currency {
		code := "EUR",
		name := "Euro",
		symbol := "€",
		value := 0.6770577923
	};
	insert Currency {
		code := "USD",
		name := "US Dollar",
		symbol := "$",
		value := 0.6975445685
	};
	insert Currency {
		code := "CAD",
		name := "Canadian Dollar",
		symbol := "$",
		value := 1
	};
	insert Currency {
		code := "MXN",
		name := "Mexican Peso",
		symbol := "$",
		value := 14.3832872123
	};
};
