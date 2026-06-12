const express = require("express");
const router = express.Router();
const messageController = require("../controller/MessageController");
const auth = require("../middleware/auth.middleware");

// L'entreprise peut t'écrire sans avoir de compte
router.post("/", messageController.sendMessage);

// Toi seul peux lire tes messages en fournissant ton Token
router.get("/", auth, messageController.getMessages);

module.exports = router;
