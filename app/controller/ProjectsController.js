const db = require("../../config/database");
const Project = require("../models/Project");

// 1. RÉCUPÉRER TOUS LES PROJETS
exports.getAllProject = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Erreur getAllProject :", error);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// 2. RÉCUPÉRER PAR ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 3. CRÉER UN PROJET
exports.createProject = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      Title,
      Description,
      Github_Link,
      Github_Link_2,
      TypeName,
      languages,
    } = req.body;

    console.log("📝 Création projet - Body:", req.body);
    console.log("📸 Fichiers reçus:", req.files ? req.files.length : 0);

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Au moins une image est obligatoire." });
    }

    // Validation des champs obligatoires
    if (!Title || !Description) {
      return res
        .status(400)
        .json({ message: "Le titre et la description sont obligatoires." });
    }

    await connection.beginTransaction();

    let finalTypeId = null;
    if (TypeName && TypeName.trim() !== "") {
      const [rows] = await connection.query(
        "SELECT IdType FROM types WHERE Name = ?",
        [TypeName.trim()],
      );
      if (rows.length > 0) {
        finalTypeId = rows[0].IdType;
      } else {
        const [result] = await connection.query(
          "INSERT INTO types (Name) VALUES (?)",
          [TypeName.trim()],
        );
        finalTypeId = result.insertId;
      }
    }

    const [projectResult] = await connection.query(
      "INSERT INTO projects (Title, Description, Github_Link, Github_Link_2, IdType) VALUES (?, ?, ?, ?, ?)",
      [
        Title,
        Description,
        Github_Link || null,
        Github_Link_2 || null,
        finalTypeId,
      ],
    );
    const newProjectId = projectResult.insertId;
    console.log("✅ Projet inséré avec ID:", newProjectId);

    for (let i = 0; i < req.files.length; i++) {
      const filename = req.files[i].filename;
      const filepath = req.files[i].path;
      console.log(`📸 Fichier ${i + 1}: ${filename}`);
      console.log(`   Chemin physique: ${filepath}`);

      await connection.query(
        "INSERT INTO project_images (ImageUrl, IsMain, IdProject) VALUES (?, ?, ?)",
        [`${filename}`, i === 0 ? 1 : 0, newProjectId],
      );
    }
    console.log("✅ Images insérées en DB:", req.files.length);

    if (languages && languages.trim() !== "") {
      const langNames = languages
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l !== "");

      for (const name of langNames) {
        const [rows] = await connection.query(
          "SELECT IdLanguage FROM language WHERE Name = ?",
          [name],
        );

        let langId;
        if (rows.length > 0) {
          langId = rows[0].IdLanguage;
        } else {
          const [insertResult] = await connection.query(
            "INSERT INTO language (Name) VALUES (?)",
            [name],
          );
          langId = insertResult.insertId;
        }

        await connection.query(
          "INSERT INTO project_language (IdProject, IdLanguage) VALUES (?, ?)",
          [newProjectId, langId],
        );
      }
      console.log("✅ Langages insérés:", langNames.length);
    }

    await connection.commit();
    console.log("✅ Transaction validée pour le projet ID:", newProjectId);
    res
      .status(201)
      .json({ message: "Projet créé avec succès !", projectId: newProjectId });
  } catch (error) {
    console.error("❌ Erreur création projet:", error);
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("❌ Erreur lors du rollback:", rollbackError);
    }
    res
      .status(500)
      .json({ message: "Erreur lors de la création", error: error.message });
  } finally {
    connection.release();
  }
};

// 4. SUPPRIMER UN PROJET
exports.deleteProject = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const fs = require("fs");
    const path = require("path");

    // Suppression des fichiers images physiques avant de toucher la BDD
    const [images] = await connection.query(
      "SELECT ImageUrl FROM project_images WHERE IdProject = ?",
      [id],
    );
    for (const img of images) {
      const filePath = path.join(__dirname, "../public/images", img.ImageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await connection.beginTransaction();

    // Suppression des lignes liées avant le projet lui-même, pour éviter
    // toute erreur de contrainte de clé étrangère si le ON DELETE CASCADE
    // n'est pas configuré sur ces tables.
    await connection.query("DELETE FROM project_images WHERE IdProject = ?", [
      id,
    ]);
    await connection.query("DELETE FROM project_language WHERE IdProject = ?", [
      id,
    ]);
    await connection.query("DELETE FROM projects WHERE IdProject = ?", [id]);

    await connection.commit();
    res.status(200).json({ message: "Projet supprimé avec succès !" });
  } catch (error) {
    console.error("❌ Erreur suppression projet :", error);
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("❌ Erreur lors du rollback:", rollbackError);
    }
    res.status(500).json({ message: "Erreur lors de la suppression" });
  } finally {
    connection.release();
  }
};

// 5. METTRE À JOUR UN PROJET
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const {
    Title,
    Description,
    Github_Link,
    Github_Link_2,
    TypeName,
    languages,
  } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Résolution du type
    let finalTypeId = null;
    if (TypeName && TypeName.trim() !== "") {
      const [rows] = await connection.query(
        "SELECT IdType FROM types WHERE Name = ?",
        [TypeName.trim()],
      );
      if (rows.length > 0) {
        finalTypeId = rows[0].IdType;
      } else {
        const [result] = await connection.query(
          "INSERT INTO types (Name) VALUES (?)",
          [TypeName.trim()],
        );
        finalTypeId = result.insertId;
      }
    }

    // Mise à jour des champs principaux
    await connection.query(
      "UPDATE projects SET Title = ?, Description = ?, Github_Link = ?, Github_Link_2 = ?, IdType = ? WHERE IdProject = ?",
      [
        Title,
        Description,
        Github_Link || null,
        Github_Link_2 || null,
        finalTypeId,
        id,
      ],
    );

    // Mise à jour des images (seulement si de nouvelles images sont envoyées)
    if (req.files && req.files.length > 0) {
      // Suppression des anciennes images du dossier public
      const fs = require("fs");
      const path = require("path");
      const [oldImages] = await connection.query(
        "SELECT ImageUrl FROM project_images WHERE IdProject = ?",
        [id],
      );
      for (const img of oldImages) {
        const filePath = path.join(__dirname, "../public/images", img.ImageUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await connection.query("DELETE FROM project_images WHERE IdProject = ?", [
        id,
      ]);
      for (let i = 0; i < req.files.length; i++) {
        await connection.query(
          "INSERT INTO project_images (ImageUrl, IsMain, IdProject) VALUES (?, ?, ?)",
          [`${req.files[i].filename}`, i === 0 ? 1 : 0, id],
        );
      }
    }

    // Mise à jour des langages (si envoyés)
    if (languages !== undefined) {
      await connection.query(
        "DELETE FROM project_language WHERE IdProject = ?",
        [id],
      );
      const langNames = languages
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l !== "");
      for (const name of langNames) {
        const [rows] = await connection.query(
          "SELECT IdLanguage FROM language WHERE Name = ?",
          [name],
        );
        let langId;
        if (rows.length > 0) {
          langId = rows[0].IdLanguage;
        } else {
          const [insertResult] = await connection.query(
            "INSERT INTO language (Name) VALUES (?)",
            [name],
          );
          langId = insertResult.insertId;
        }
        await connection.query(
          "INSERT INTO project_language (IdProject, IdLanguage) VALUES (?, ?)",
          [id, langId],
        );
      }
    }

    await connection.commit();
    res.status(200).json({ message: "Mise à jour réussie !" });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour", error: error.message });
  } finally {
    connection.release();
  }
};
