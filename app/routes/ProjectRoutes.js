const express = require("express");
const router = express.Router();
const projectController = require("../controller/ProjectsController");

router.get("/", projectController.getAllProject);
router.get("/:id", projectController.getProjectById);
router.post("/", projectController.createProject);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

module.exports = router;
