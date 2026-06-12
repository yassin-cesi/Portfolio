const db = require("../../config/database");

exports.getAllLanguages = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM language");
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des langages" });
  }
};
