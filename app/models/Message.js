const db = require("../../config/database");

class Message {
  constructor(id, name, email, subject, content, createdAt) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.subject = subject;
    this.content = content;
    this.createdAt = createdAt;
  }

  // 1. Action publique : Une entreprise t'envoie un message
  static async create(data) {
    const { name, email, subject, content } = data;
    try {
      const [result] = await db.query(
        "INSERT INTO messages (Name, Email, Subject, Content) VALUES (?, ?, ?, ?)",
        [name, email, subject, content],
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 2. Action privée : Tu récupères tous les messages reçus
  static async findAll() {
    try {
      const [rows] = await db.query(
        "SELECT * FROM messages ORDER BY CreatedAt DESC",
      );
      return rows.map(
        (m) =>
          new Message(
            m.IdMessage,
            m.Name,
            m.Email,
            m.Subject,
            m.Content,
            m.CreatedAt,
          ),
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Message;
