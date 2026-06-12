const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Import de tes contrôleurs
const authMiddleware = require('../middlewares/authMiddleware'); // Optionnel : pour protéger des routes

// --- ROUTES PUBLIQUES ---
// Inscription d'un nouvel utilisateur
router.post('/register', userController.registerUser);

// Connexion
router.post('/login', userController.loginUser);


// --- ROUTES PROTÉGÉES (Exemple avec un middleware d'authentification) ---
// Récupérer le profil de l'utilisateur connecté
router.get('/profile', authMiddleware, userController.getUserProfile);

// Mettre à jour le profil
router.put('/update', authMiddleware, userController.updateUserProfile);

// Supprimer un compte
router.delete('/delete', authMiddleware, userController.deleteUser);


// Ne pas oublier d'exporter le router !
module.exports = router;