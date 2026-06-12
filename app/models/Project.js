class Project {
  // Le constructeur définit les propriétés de ton objet
  constructor(id, title, description, githubLink, githubLink2, type) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.githubLink = githubLink;
    this.githubLink2 = githubLink2;
    this.type = type;
  }

  // Une méthode utile si tu veux formater tes données avant de les envoyer au HTML
  getExcerpt() {
    return this.content.substring(0, 100) + "...";
  }
}
