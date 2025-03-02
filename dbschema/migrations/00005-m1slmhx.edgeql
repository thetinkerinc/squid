CREATE MIGRATION m1slmhx6md5q3pzmh5gxd72h3nh44e5h7r3tke6o5fiwjmiwmqgv6q
    ONTO m1rqhjm2czptgbdasehofolqzw7d54qk7mm2hh6zp6vzstody3oxdq
{
  ALTER TYPE default::Entry {
      ALTER PROPERTY created {
          RESET readonly;
      };
  };
  ALTER TYPE default::User {
      ALTER LINK identity {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
