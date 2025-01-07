using extension auth;

module default {
	scalar type EntryType extending enum<expense, income, withdrawal>;

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
		required created: datetime {
			readonly := true;
			default := datetime_current();
		}
		required user: User;
		required type: EntryType;
		required amount: float32;
		required category: str;
		description: str;
	}
}
