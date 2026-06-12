const db = require("../../config/database");

exports.getAllTypes = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM types");
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des types" });
  }
};
