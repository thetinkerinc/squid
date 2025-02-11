CREATE MIGRATION m1c7tcwb5ezsofxosbsxbt6xp3vcdbsj5a55yy5wgrldvncoqce5ha
    ONTO initial
{
  CREATE EXTENSION pgcrypto VERSION '1.3';
  CREATE EXTENSION auth VERSION '1.0';
  CREATE SCALAR TYPE default::AccountType EXTENDING enum<bank, cash>;
  CREATE SCALAR TYPE default::EntryType EXTENDING enum<expense, income, withdrawal>;
  CREATE TYPE default::Entry {
      CREATE REQUIRED PROPERTY account: default::AccountType;
      CREATE REQUIRED PROPERTY amount: std::float32;
      CREATE REQUIRED PROPERTY category: std::str;
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY type: default::EntryType;
  };
  CREATE TYPE default::User {
      CREATE REQUIRED MULTI LINK identity: ext::auth::Identity;
      CREATE MULTI LINK partners: default::User;
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY is_admin: std::bool {
          SET default := false;
      };
  };
  ALTER TYPE default::Entry {
      CREATE REQUIRED LINK user: default::User;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK entries := (.<user[IS default::Entry]);
  };
  CREATE TYPE default::Invitation {
      CREATE REQUIRED LINK from: default::User;
      CREATE REQUIRED LINK to: default::User;
      CREATE PROPERTY accepted: std::bool;
      CREATE REQUIRED PROPERTY sent: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
  };
};
