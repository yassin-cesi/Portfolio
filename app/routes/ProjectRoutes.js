const express = require("express");
const router = express.Router();
const projectsController = require("../controller/ProjectsController"); // Importation bien définie
const auth = require("../middleware/auth.middleware");

// Routes publiques
router.get("/", projectsController.getAllProject);
router.get("/:id", projectsController.getProjectById);

// Routes protégées
router.post("/", auth, projectsController.createProject); // Plus d'erreur ici !
router.put("/:id", auth, projectsController.updateProject);
router.delete("/:id", auth, projectsController.deleteProject);

module.exports = router;
