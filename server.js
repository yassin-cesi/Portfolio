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
);

app.use(hpp());
app.use(express.json());

app.use("/api/projects", projectRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/auth", authRoutes);

app.use("/images", express.static(path.join(__dirname, "./app/public/images")));

app.use("/api/messages", require("./app/routes/MessageRoutes"));

app.listen(PORT, '0.0.0.0', () => 
  console.log(`Serveur connecté sur le port ${PORT}`)
);