// Dans ton controllers/user.controller.js
const Type = require('../models/Type'); // On importe bien le modèle User

exports.getAllTypes = async (req, res) => {
    try {
        // On fait une jointure pour rassembler les infos de l'User, son Rôle et son Adresse
        const queryText = `
            SELECT Name From Types;
        `;

        const result = await db.query(queryText);

        // On renvoie le tableau d'utilisateurs complets
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
};

exports.createType = async (req, res) => {
    // 1. On récupère toutes les données envoyées par le front
    const { name } = req.body;

    try {

        const typeResult = await db.query(
            "INSERT INTO Types (name) VALUES ($1) RETURNING *",
            [name]
        );

        // Si tout s'est bien passé, on valide la transaction
        await db.query("COMMIT");

        res.status(201).json({
            message: "Type créés avec succès !",
            type: typeResult.rows[0]
        });

    } catch (error) {
        // En cas d'erreur, on annule tout ce qui a été fait (rollback)
        await db.query("ROLLBACK");
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la création du Type"
        });
    }
};



exports.createUser = async (req, res) => {
    const { firstname, lastname, password, streetNb, streetName, postalCode, city } = req.body;

    try {
        await db.query("BEGIN");

        // 1. GESTION DU MOT DE PASSE : On le hache !
        // Le chiffre 10 représente le "salt rounds" (la puissance du chiffrement)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Création de l'adresse...
        const addressResult = await db.query(
            "INSERT INTO Addresses (streetNb, streetName, postalCode, city) VALUES ($1, $2, $3, $4) RETURNING id",
            [streetNb, streetName, postalCode, city]
        );
        const idAddress = addressResult.rows[0].id; // On récupère l'ID généré

        // 3. Création de l'utilisateur avec le mot de passe HACHÉ
        const userResult = await db.query(
            "INSERT INTO Users (firstname, lastname, password, IdAddress) VALUES ($1, $2, $3, $4, $5) RETURNING id, firstname, lastname",
            [firstname, lastname, hashedPassword, idAddress]
        );
        // ⚠️ Remarque : On ne renvoie JAMAIS le mot de passe (même haché) dans la réponse JSON !

        await db.query("COMMIT");
        res.status(201).json({ message: "Utilisateur créé en toute sécurité !" });

    } catch (error) {
        await db.query("ROLLBACK");
        res.status(500).json({ message: "Erreur" });
    }
};