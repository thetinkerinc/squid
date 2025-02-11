using extension auth;

module default {
	scalar type EntryType extending enum<expense, income, withdrawal>;
	scalar type AccountType extending enum<bank, cash>;

	type User {
		required multi identity: ext::auth::Identity;
		required email: str {
			constraint exclusive;
		}
		required is_admin: bool {
			default := false;
		}
		multi entries := .<user[is Entry];
		multi partners: User;
	}

	type Entry {
		required user: User;
		required created: datetime {
			readonly := true;
			default := datetime_current();
		}
		required type: EntryType;
		required account: AccountType;
		required amount: float32;
		required enteredAmount: float32;
		required enteredCurrency: str;
		required category: str;
		description: str;
	}

	type Invitation {
		required from: User;
		required to: User;
		required sent: datetime {
			readonly := true;
			default := datetime_current();
		}
		accepted: bool;
	}

	type Currency {
		required code: str;
		required name: str;
		required symbol: str;
		required value: float32;
	}
}
