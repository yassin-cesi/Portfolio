require("dotenv").config(); // Important : charge les variables d'environnement
const Message = require("../models/Message");
const nodemailer = require("nodemailer");

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const resend = new Resend(process.env.RESEND_API_KEY);

// Envoi d'un message (Public)
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, content } = req.body;

    if (!name || !email || !subject || !content) {
      return res.status(400).json({
        message:
          "Tous les champs (Nom, Email, Objet et Message) sont obligatoires.",
      });
    }

    // Vérifier que ce ne sont pas juste des espaces
    if (!name.trim() || !email.trim() || !subject.trim() || !content.trim()) {
      return res.status(400).json({
        message: "Tous les champs doivent contenir du texte.",
      });
    }

    // 1. Enregistrement en base de données
    await Message.create({ name, email, subject, content });

    // 2. Préparation de l'e-mail avec une mise en forme HTML
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📧 Nouveau message : ${subject || "Sans objet"}`,
      html: `
        <h3>Vous avez reçu un nouveau message sur votre portfolio</h3>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Objet :</strong> ${subject || "Sans objet"}</p>
        <p><strong>Message :</strong><br>${content.replace(/\n/g, "<br>")}</p>
      `,
    };

    // 3. Envoi de l'e-mail
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      // On logue l'erreur mais on ne bloque pas la réponse client
      console.error("Erreur lors de l'envoi de l'email :", mailError);
    }

    res.status(201).json({ message: "Message envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur générale dans sendMessage :", error);
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
};

// Lecture des messages (Privé - Pour Toi)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des messages." });
  }
};
