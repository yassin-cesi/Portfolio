const express = require("express");
const router = express.Router();
const typesController = require("../controller/TypesController");

router.get("/", typesController.getAllTypes);

module.exports = router;
