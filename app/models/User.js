const db = require("../../config/database");

class User {
  constructor(id, firstName, lastName, email, password, idRole) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password; // Contien le mot de passe haché
    this.idRole = idRole;
  }

  // Trouver un utilisateur par son email pour la connexion
  static async findByEmail(email) {
    try {
      const [rows] = await db.query("SELECT * FROM USERS WHERE Email = ?", [
        email,
      ]);
      if (rows.length === 0) return null;

      const u = rows[0];
      return new User(
        u.IdUser,
        u.FirstName,
        u.LastName,
        u.Email,
        u.Password,
        u.IdRole,
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
