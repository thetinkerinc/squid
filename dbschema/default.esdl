using extension auth;

module default {
	type User {
		required multi identity: ext::auth::Identity;
		required email: str {
			constraint exclusive;
		}
		required is_admin: bool {
			default := false;
		}
	}
}
