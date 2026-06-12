const express = require("express");
const router = express.Router();
const languagesController = require("../controller/LanguagesController");

router.get("/", languagesController.getAllLanguages);

module.exports = router;
