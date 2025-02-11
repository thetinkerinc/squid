CREATE MIGRATION m1c5w634omanixiholwvttwdjekqo3wook3bpy2fg5qda3xpbbpdra
    ONTO m1c7tcwb5ezsofxosbsxbt6xp3vcdbsj5a55yy5wgrldvncoqce5ha
{
  ALTER TYPE default::Entry {
      CREATE REQUIRED PROPERTY enteredAmount: std::float32 {
          SET REQUIRED USING (<std::float32>.amount);
      };
      CREATE REQUIRED PROPERTY enteredCurrency: std::str {
          SET REQUIRED USING (<std::str>'CAD');
      };
  };
};
