class Role {
    // Le constructeur définit les propriétés de ton objet
    constructor(id, Role) {
        this.id = id;                 // ID unique (souvent géré par la BDD)
        this.Role = Role;           // Titre de l'article

    }

    // Une méthode utile si tu veux formater tes données avant de les envoyer au HTML
    getExcerpt() {
        return this.content.substring(0, 100) + '...';
    }
}
