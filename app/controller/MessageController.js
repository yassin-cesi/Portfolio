const Message = require("../models/Message");

// Envoi d'un message (Public)
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, content } = req.body;

    if (!name || !email || !content) {
      return res
        .status(400)
        .json({
          message: "Les champs Nom, Email et Message sont obligatoires.",
        });
    }

    await Message.create({ name, email, subject, content });
    res.status(201).json({ message: "Message envoyé avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
};

// Lecture des messages (Privé - Pour Toi)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des messages." });
  }
};
