const express = require("express");
const router = express.Router();
const authController = require("../controller/AuthController");
const AuthMiddleware = require("../middleware/auth.middleware");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

// Rate limiter strict pour la connexion : 10 tentatives par 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Trop de tentatives de connexion, réessaie dans 15 minutes.",
  },
});

// Validation des champs du formulaire de login
const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Adresse email invalide.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Le mot de passe est requis.").trim(),
];

// Middleware qui vérifie les erreurs de validation et bloque si besoin
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/login",
  loginLimiter,
  loginValidation,
  checkValidation,
  authController.login,
);

module.exports = router;
