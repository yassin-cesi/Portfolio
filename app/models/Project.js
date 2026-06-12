const db = require("../../config/database");

class Project {
  constructor(
    id,
    title,
    description,
    githubLink,
    githubLink2,
    type,
    languages = [],
    images = [],
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.githubLink = githubLink;
    this.githubLink2 = githubLink2;
    this.type = type; // Contiendra le nom ou l'objet du Type
    this.languages = languages; // Tableau des langages associés
    this.images = images; // Tableau des images associées
  }

  // 1. MÉTHODE POUR RÉCUPÉRER TOUS LES PROJETS (AVEC TOUTES LEURS LIAISONS)
  static async findAll() {
    try {
      // Étape A : Récupérer les projets de base et faire une jointure pour avoir le nom du Type
      const [projectRows] = await db.query(`
        SELECT p.*, t.Name as TypeName 
        FROM projects p
        LEFT JOIN types t ON p.IdType = t.IdType
      `);

      const projectsList = [];

      // Étape B : Pour chaque projet, on va chercher ses langages et ses images
      for (const row of projectRows) {
        // 1. Récupérer les langages de ce projet via la table de liaison
        const [langRows] = await db.query(
          `
          SELECT l.* FROM language l
          JOIN project_language pl ON l.IdLanguage = pl.IdLanguage
          WHERE pl.IdProject = ?
        `,
          [row.IdProject],
        );

        // 2. Récupérer les images de ce projet
        const [imgRows] = await db.query(
          `
          SELECT IdImage, ImageUrl, IsMain 
          FROM project_images 
          WHERE IdProject = ?
        `,
          [row.IdProject],
        );

        // 3. Instancier notre classe Project avec TOUTES les données
        const fullProject = new Project(
          row.IdProject,
          row.Title,
          row.Description,
          row.Github_Link,
          row.Github_Link_2,
          row.TypeName, // On passe directement le nom du type textuel
          langRows, // Le tableau de langages [{IdLanguage: 1, Name: 'C#', ...}]
          imgRows, // Le tableau d'images [{ImageUrl: '...', IsMain: 1}]
        );

        projectsList.push(fullProject);
      }

      return projectsList;
    } catch (error) {
      throw error;
    }
  }
  // 2. MÉTHODE POUR RÉCUPÉRER UN SEUL PROJET PAR SON ID (AVEC TOUTES SES LIAISONS)
  static async findById(id) {
    try {
      // Étape A : Récupérer le projet de base et son type
      const [projectRows] = await db.query(
        `
        SELECT p.*, t.Name as TypeName 
        FROM projects p
        LEFT JOIN types t ON p.IdType = t.IdType
        WHERE p.IdProject = ?
      `,
        [id],
      );

      // Si aucun projet ne correspond à cet ID, on renvoie null
      if (projectRows.length === 0) {
        return null;
      }

      const row = projectRows[0];

      // Étape B : Aller chercher les langages de ce projet spécifique
      const [langRows] = await db.query(
        `
        SELECT l.* FROM language l
        JOIN project_language pl ON l.IdLanguage = pl.IdLanguage
        WHERE pl.IdProject = ?
      `,
        [id],
      );

      // Étape C : Aller chercher les images de ce projet spécifique
      const [imgRows] = await db.query(
        `
        SELECT IdImage, ImageUrl, IsMain 
        FROM project_images 
        WHERE IdProject = ?
      `,
        [id],
      );

      // Étape D : On instancie et on retourne l'objet Project complet
      return new Project(
        row.IdProject,
        row.Title,
        row.Description,
        row.Github_Link,
        row.Github_Link_2,
        row.TypeName,
        langRows,
        imgRows,
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Project;
