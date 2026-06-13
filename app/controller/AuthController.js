const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // 2. Vérifier si le mot de passe correspond avec Bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // 3. Générer le jeton JWT (généralement avec une clé secrète stockée dans ton .env)
    const secretKey = process.env.JWT_SECRET || "SUPER_SECRET_KEY_PORTFOLIO";
    const token = jwt.sign(
      { userId: user.id, idRole: user.idRole },
      secretKey,
      { expiresIn: "30m" },
    );

    // 4. Renvoyer le jeton au Front-End
    res.status(200).json({
      message: "Connexion réussie !",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};
const db = require("../../config/database"); // On importe la BDD pour l'insertion directe

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // 2. Hasher le mot de passe automatiquement (10 tours de "salt")
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insérer d'abord une adresse par défaut (car IdAddress est NOT NULL)
    const [addressResult] = await db.query(
      "INSERT INTO Addresses (StreetNumber, StreetName, PostalCode, City) VALUES (?, ?, ?, ?)",
      [1, "Rue du Portfolio", 69000, "Lyon"],
    );
    const newAddressId = addressResult.insertId;

    // 4. Insérer le nouvel utilisateur (IdRole = 1 pour être ADMIN directement !)
    const insertUserQuery = `
      INSERT INTO USERS (FirstName, LastName, Email, Password, IdRole, IdAddress) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(insertUserQuery, [
      firstName,
      lastName,
      email,
      hashedPassword, // Ton mot de passe tout beau tout haché
      1, // 1 = Rôle Admin
      newAddressId,
    ]);

    res
      .status(201)
      .json({ message: "Compte Administrateur créé avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
};
