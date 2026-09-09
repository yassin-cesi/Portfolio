const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");

const projectRoutes = require("./app/routes/ProjectRoutes.js");
const languageRoutes = require("./app/routes/LanguageRoutes.js");
const typeRoutes = require("./app/routes/TypeRoutes.js");
const authRoutes = require("./app/routes/AuthRoutes.js");
const messageRoutes = require("./app/routes/MessageRoutes.js");

const app = express();

// 1. Sécurité Helmet (autorise les ressources cross-origin pour le chargement des images/assets)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

// 2. Configuration CORS (compatible VPS et développement local)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(hpp());
app.use(express.json());

// 3. Déclaration des routes API
app.use("/api/projects", projectRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 4. Service des fichiers statiques (Images)
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.listen(3000, () => {
  console.log("Le serveur tourne sur le port 3000");
});
