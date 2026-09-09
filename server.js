const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");

const projectRoutes = require("./app/routes/ProjectRoutes.js");
const languageRoutes = require("./app/routes/LanguageRoutes.js");
const typeRoutes = require("./app/routes/TypeRoutes.js");
const authRoutes = require("./app/routes/AuthRoutes.js");

const app = express();
<<<<<<< HEAD
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
=======

// 1. Sécurité Helmet adaptée pour autoriser les fichiers statiques & scripts
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Désactivé temporairement pour éviter le blocage du CSS/JS
  })
);

// 2. Configuration CORS ouverte au VPS et au dev local
app.use(
  cors({
    origin: true, // Autorise dynamiquement l'origine qui fait la requête (VPS ou Local)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
>>>>>>> d086cf7a281d21ab314c51bc426ccee756d8557a
);

app.use(hpp());
app.use(express.json());

<<<<<<< HEAD
=======
// 3. Déclaration des routes API
>>>>>>> d086cf7a281d21ab314c51bc426ccee756d8557a
app.use("/api/projects", projectRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/auth", authRoutes);
<<<<<<< HEAD

app.use("/images", express.static(path.join(__dirname, "./app/public/images")));

app.use("/api/messages", require("./app/routes/MessageRoutes"));

app.listen(3000, () =>
  console.log(
    "Le serveur est connecté sur le port 3000 : http://localhost:3000/api/",
  ),
);
=======
app.use("/api/messages", require("./app/routes/MessageRoutes"));

// 4. Service des fichiers statiques (Images)
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.listen(3000, () =>
  console.log("Le serveur tourne sur le port 3000")
);
>>>>>>> d086cf7a281d21ab314c51bc426ccee756d8557a
