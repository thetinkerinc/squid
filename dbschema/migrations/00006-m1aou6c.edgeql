CREATE MIGRATION m1aou6cbelytfbz3jvprev4uqvpgmk6sw2dgbmkcc2qauptqapsy4q
    ONTO m1slmhx6md5q3pzmh5gxd72h3nh44e5h7r3tke6o5fiwjmiwmqgv6q
{
  CREATE SCALAR TYPE default::CurrencyType EXTENDING enum<CAD, EUR, MXN, USD>;
  ALTER TYPE default::Currency {
      ALTER PROPERTY code {
          SET TYPE default::CurrencyType;
      };
  };
};
