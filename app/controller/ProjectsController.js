const db = require("../../config/database"); // Connexion à ta BDD MySQL

// 1. RÉCUPÉRER TOUS LES PROJETS
const Project = require("../models/Project");

exports.getAllProject = async (req, res) => {
  try {
    // Le contrôleur demande au modèle de lui donner tous les projets complets
    const projects = await Project.findAll();

    // On renvoie directement le résultat propre au Front-End
    res.status(200).json(projects);
  } catch (error) {
    console.error("Erreur contrôleur projets :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des projets" });
  }
};

// 2. RÉCUPÉRER UN PROJET PAR SON ID
// RÉCUPÉRER UN PROJET PAR SON ID
exports.getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    // On appelle notre nouvelle méthode de modèle
    const project = await Project.findById(id);

    // Si le modèle a renvoyé null, c'est que le projet n'existe pas (404)
    if (!project) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    // On renvoie l'objet complet trouvé
    res.status(200).json(project);
  } catch (error) {
    console.error("Erreur contrôleur getProjectById :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du Project" });
  }
};

// 3. CRÉER UN PROJET
exports.createProject = async (req, res) => {
  // On récupère toutes les données du projet envoyées par Postman
  const {
    Title,
    Description,
    Github_Link,
    Github_Link_2,
    IdType,
    languages,
    images,
  } = req.body;

  // On récupère une connexion spécifique du pool pour gérer la Transaction
  const connection = await db.getConnection();

  try {
    // -------------------------------------------------------------------------
    // ÉTAPE 1 : Démarrer la transaction SQL
    // -------------------------------------------------------------------------
    await connection.beginTransaction();

    // -------------------------------------------------------------------------
    // ÉTAPE 2 : Insertion dans la table 'projects' (Étape 3 de ton script SQL)
    // -------------------------------------------------------------------------
    const projectQuery = `
      INSERT INTO projects (Title, Description, Github_Link, Github_Link_2, IdType) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [projectResult] = await connection.query(projectQuery, [
      Title,
      Description,
      Github_Link,
      Github_Link_2,
      IdType, // L'Id du type (ex: 1 pour "CESI - Project Collaboratif")
    ]);

    // On récupère l'ID du projet qui vient d'être généré automatiquement par MySQL
    const newProjectId = projectResult.insertId;

    // -------------------------------------------------------------------------
    // ÉTAPE 3 : Insertion dans la table 'project_language' (Étape 4 de ton script SQL)
    // -------------------------------------------------------------------------
    // On vérifie que le tableau "languages" a bien été envoyé et n'est pas vide (ex: [1, 2])
    if (languages && languages.length > 0) {
      const languageQuery =
        "INSERT INTO project_language (IdProject, IdLanguage) VALUES (?, ?)";

      for (const idLanguage of languages) {
        // On lie le nouvel ID du projet avec l'ID du langage
        await connection.query(languageQuery, [newProjectId, idLanguage]);
      }
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 4 : Insertion dans la table 'project_images' (Étape 5 de ton script SQL)
    // -------------------------------------------------------------------------
    // On vérifie si un tableau d'images a été envoyé
    if (images && images.length > 0) {
      const imageQuery =
        "INSERT INTO project_images (ImageUrl, IsMain, IdProject) VALUES (?, ?, ?)";

      for (const img of images) {
        // On force ou on vérifie que le chemin commence bien par /images/ et pas par du relatif
        let cleanUrl = img.ImageUrl;
        if (cleanUrl.startsWith("../../public/")) {
          cleanUrl = cleanUrl.replace("../../public/", "/");
        }

        await connection.query(imageQuery, [
          cleanUrl,
          img.IsMain,
          newProjectId,
        ]);
      }
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 5 : Validation finale de la transaction
    // -------------------------------------------------------------------------
    // Si toutes les requêtes précédentes ont fonctionné sans erreur, on enregistre tout d'un coup !
    await connection.commit();

    // Réponse de succès envoyée à Postman
    res.status(201).json({
      message: "Projet complet créé avec succès dans toutes les tables !",
      projectId: newProjectId,
    });
  } catch (error) {
    // -------------------------------------------------------------------------
    // EN CAS D'ERREUR : Annulation totale (Rollback)
    // -------------------------------------------------------------------------
    // Si n'importe quelle insertion plante (ex: mauvaise clé étrangère), on annule TOUT
    await connection.rollback();
    console.error("❌ Erreur lors de la transaction, BDD restaurée :", error);

    res.status(500).json({
      message: "Erreur lors de la création complète du Projet",
      error: error.message,
    });
  } finally {
    // Toujours libérer la connexion pour éviter de bloquer la base de données
    connection.release();
  }
};

// 4. SUPPRIMER UN PROJET
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Projects WHERE IdProject = ?", [id]);
    res.status(200).json({ message: "Projet supprimé avec succès !" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du projet" });
  }
};

// 5. METTRE À JOUR UN PROJET
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { Title, Description, Github_Link, Github_Link_2, IdType } = req.body;
  try {
    await db.query(
      "UPDATE Projects SET Title = ?, Description = ?, Github_Link = ?, Github_Link_2 = ?, IdType = ? WHERE IdProject = ?",
      [Title, Description, Github_Link, Github_Link_2, IdType, id],
    );
    res.status(200).json({ message: "Projet mis à jour avec succès !" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du projet" });
  }
};
