const express = require("express");
const path = require("path");
const projectRoutes = require("./app/routes/ProjectRoutes.js");
const languageRoutes = require("./app/routes/LanguageRoutes.js");
const typeRoutes = require("./app/routes/TypeRoutes.js");
const authRoutes = require("./app/routes/AuthRoutes.js");

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors()); // Autorise ton Front-End à requêter ton API sans blocage de sécurité

app.use("/api/projects", projectRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/auth", authRoutes); // Route pour l'authentification

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/messages", require("./app/routes/MessageRoutes"));
app.listen(3000, () =>
  console.log("Serveur connecté sur le port 3000 : http://localhost:3000/api/"),
);
