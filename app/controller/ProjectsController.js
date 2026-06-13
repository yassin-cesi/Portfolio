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

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Au moins une image est obligatoire." });
    }

    await connection.beginTransaction();

    let finalTypeId = null;
    if (TypeName && TypeName.trim() !== "") {
      const [rows] = await connection.query(
        "SELECT IdType FROM types WHERE Name = ?",
        [TypeName.trim()],
      );
      if (rows.length > 0) finalTypeId = rows[0].IdType;
      else {
        const [result] = await connection.query(
          "INSERT INTO types (Name) VALUES (?)",
          [TypeName.trim()],
        );
        finalTypeId = result.insertId;
      }
    }

    const [project] = await connection.query(
      "INSERT INTO projects (Title, Description, Github_Link, Github_Link_2, IdType) VALUES (?, ?, ?, ?, ?)",
      [
        Title,
        Description,
        Github_Link || null,
        Github_Link_2 || null,
        finalTypeId,
      ],
    );
    const newProjectId = project.insertId;

    for (let i = 0; i < req.files.length; i++) {
      await connection.query(
        "INSERT INTO project_images (ImageUrl, IsMain, IdProject) VALUES (?, ?, ?)",
        [`images/${req.files[i].filename}`, i === 0 ? 1 : 0, newProjectId],
      );
    }

    if (languages) {
      const langNames = languages
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l !== "");
      for (const name of langNames) {
        let [rows] = await connection.query(
          "SELECT IdLanguage FROM languages WHERE Name = ?",
          [name],
        );
        let langId =
          rows.length > 0
            ? rows[0].IdLanguage
            : (
                await connection.query(
                  "INSERT INTO languages (Name) VALUES (?)",
                  [name],
                )
              )[0].insertId;
        await connection.query(
          "INSERT INTO project_language (IdProject, IdLanguage) VALUES (?, ?)",
          [newProjectId, langId],
        );
      }
    }

    await connection.commit();
    res
      .status(201)
      .json({ message: "Projet créé avec succès !", projectId: newProjectId });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Erreur lors de la création", error: error.message });
  } finally {
    connection.release();
  }
};

// 4. SUPPRIMER UN PROJET (Ajouté car manquant)
exports.deleteProject = async (req, res) => {
  try {
    await db.query("DELETE FROM projects WHERE IdProject = ?", [req.params.id]);
    res.status(200).json({ message: "Projet supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
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
        const filePath = path.join(__dirname, "../../public", img.ImageUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await connection.query("DELETE FROM project_images WHERE IdProject = ?", [
        id,
      ]);
      for (let i = 0; i < req.files.length; i++) {
        await connection.query(
          "INSERT INTO project_images (ImageUrl, IsMain, IdProject) VALUES (?, ?, ?)",
          [`images/${req.files[i].filename}`, i === 0 ? 1 : 0, id],
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
          "SELECT IdLanguage FROM languages WHERE Name = ?",
          [name],
        );
        const langId =
          rows.length > 0
            ? rows[0].IdLanguage
            : (
                await connection.query(
                  "INSERT INTO languages (Name) VALUES (?)",
                  [name],
                )
              )[0].insertId;
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
