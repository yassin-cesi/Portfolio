class User {
    // Le constructeur définit les propriétés de ton objet
    constructor(id, firstname, lastname, password, IdRole, IdAddress) {
        this.id = id;                 // ID unique (souvent géré par la BDD)
        this.firstname = firstname;           // Titre de l'article
        this.lastname = lastname;       // Contenu textuel
        this.password = password;
        this.IdRole = IdRole;        // Auteur de l'article
        this.IdAddress = IdAddress;
    }

    // Une méthode utile si tu veux formater tes données avant de les envoyer au HTML
    getExcerpt() {
        return this.content.substring(0, 100) + '...';
    }
}

