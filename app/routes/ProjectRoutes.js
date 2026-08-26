const express = require("express");
const router = express.Router();
const projectsController = require("../controller/ProjectsController");
const auth = require("../middleware/auth.middleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- CONFIGURATION DE STORAGE MULTER ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/images");

    // Crée le dossier s'il manque
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Garde le nom original du fichier tel quel
    cb(null, file.originalname);
  },
});

// Filtre pour n'accepter que des images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers image sont autorisés"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo par fichier
  },
});

// --- Middleware générique pour catcher les erreurs Multer proprement ---
// Place ce wrapper autour de upload.array(...) sur chaque route concernée.
// Il transforme l'exception brute (qui plantait avant) en réponse JSON lisible,
// et te dit EXACTEMENT quel champ a été reçu si jamais le nom ne correspond pas.
function handleUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            message: `Champ de fichier inattendu : "${err.field}". Le champ attendu côté serveur est "projectImages".`,
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            message: "Trop de fichiers envoyés (maximum 6 images).",
          });
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message:
              "Un des fichiers dépasse la taille maximale autorisée (5 Mo).",
          });
        }
        return res
          .status(400)
          .json({ message: `Erreur Multer : ${err.message}` });
      } else if (err) {
        // Erreur venant du fileFilter ou autre
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
}

// Routes publiques
router.get("/", projectsController.getAllProject);
router.get("/:id", projectsController.getProjectById);

// Routes protégées
// ⚠️ IMPORTANT : le nom du champ FormData côté frontend DOIT être exactement "projectImages"
// (au pluriel, identique à celui utilisé ici et dans admin.js).
// Si le frontend envoie "projectImage" (singulier) ou un autre nom, Multer renverra
// "Unexpected field" -> désormais catché par handleUpload() ci-dessus au lieu de crasher.
router.post(
  "/",
  auth,
  handleUpload(upload.array("projectImages", 12)),
  projectsController.createProject,
);

router.put(
  "/:id",
  auth,
  upload.array("projectImages", 10),
  projectsController.updateProject,
);

router.delete("/:id", auth, projectsController.deleteProject);

module.exports = router;
