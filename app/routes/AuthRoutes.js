const express = require("express");
const router = express.Router();
const authController = require("../controller/AuthController");
const AuthMiddleware = require("../middleware/auth.middleware"); // Optionnel : pour protéger des routes

router.post("/login", authController.login);

module.exports = router;

// Ne pas oublier d'exporter le router !
module.exports = router;
