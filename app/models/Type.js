class Type {
    // Le constructeur définit les propriétés de ton objet
    constructor(id, Name) {
        this.id = id;                 // ID unique (souvent géré par la BDD)
        this.Name = Name;           // Titre de l'article

    }

    // Une méthode utile si tu veux formater tes données avant de les envoyer au HTML
    getExcerpt() {
        return this.content.substring(0, 100) + '...';
    }
}
