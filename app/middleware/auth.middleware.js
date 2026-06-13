const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // 1. Récupérer le token dans l'en-tête "Authorization"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ message: "Accès refusé. Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET || "SUPER_SECRET_KEY_PORTFOLIO";

    // 2. Vérifier et décoder le token
    const decodedToken = jwt.verify(token, secretKey);

    // 3. SÉCURITÉ SUPPLÉMENTAIRE : Vérifier si l'utilisateur est bien ADMIN (IdRole === 1)
    if (decodedToken.idRole !== 1) {
      return res
        .status(403)
        .json({ message: "Accès interdit. Droits Administrateur requis." });
    }

    // Si tout est bon, on stocke les infos et on passe à la suite
    req.auth = { userId: decodedToken.userId, idRole: decodedToken.idRole };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Jeton expiré. Veuillez vous reconnecter." });
    }
    res
      .status(401)
      .json({ message: "Requête non authentifiée ou jeton invalide !" });
  }
};
