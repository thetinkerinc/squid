CREATE MIGRATION m1ohlbwlb34d76hpuqyaf6kzny3ya4ttkgir2gza3gsuzvsxita6ua
    ONTO m1c5w634omanixiholwvttwdjekqo3wook3bpy2fg5qda3xpbbpdra
{
  CREATE TYPE default::Currencies {
      CREATE REQUIRED PROPERTY code: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY symbol: std::str;
      CREATE REQUIRED PROPERTY value: std::float32;
  };
};
