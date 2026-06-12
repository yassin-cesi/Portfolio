const express = require("express");
const router = express.Router();
const projectsController = require("../controller/ProjectsController");
const auth = require("../middleware/auth.middleware");
const multer = require("multer");
const path = require("path");

// --- CONFIGURATION DE STORAGE MULTER ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../public/images");

    // Ajoute cette vérification pour créer le dossier s'il manque :
    const fs = require("fs");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Génère un nom unique (ex: 1718203948-monimage.png) pour éviter les écrasements
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes publiques
router.get("/", projectsController.getAllProject);
router.get("/:id", projectsController.getProjectById);

// Routes protégées
// ⚡ NOTE : On ajoute `upload.single('projectImage')` juste APRÈS le middleware 'auth'
// Remplace cette ligne :
// router.post("/", auth, upload.single("projectImage"), projectsController.createProject);
router.post(
  "/",
  auth,
  upload.array("projectImages", 6), // Ce nom "projectImages" doit être le même que dans admin.js
  projectsController.createProject,
);

// CORRECTION ICI : Ajout du middleware Multer pour parser le FormData du PUT
router.put(
  "/:id",
  auth,
  upload.array("projectImages", 6),
  projectsController.updateProject,
);

router.delete("/:id", auth, projectsController.deleteProject);

module.exports = router;
