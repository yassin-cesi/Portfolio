// 1. On attend que la page HTML soit chargée
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
});
async function fetchProjects() {
    try {
        // CORRECTION : Utilise l'URL de ton API (ta route Express)
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error("Erreur réseau");

        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error("Erreur lors de la récupération :", error);
        document.getElementById('projects-container').innerHTML = "<p>Impossible de charger les projets.</p>";
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projects-container');

    // On prépare tout le HTML dans une variable pour ne mettre à jour le DOM qu'une seule fois
    const htmlContent = projects.map(project => {
        // Protection si images ou languages n'existent pas encore
        const imageUrl = project.imageUrl || 'https://via.placeholder.com/300';
        const languagesHtml = project.languages
            ? project.languages.map(lang => `<span class="tag">${lang.Name}</span>`).join('')
            : '';

        return `
            <div class="project-card">
                <div class="card-img">
                    <img src="${imageUrl}" alt="${project.Title}">
                </div>
                <div class="card-content">
                    <h3>${project.Title}</h3>
                    <p>${project.Description}</p>
                    <div class="tags">${languagesHtml}</div>
                    <a href="${project.Github_Link}" class="btn" target="_blank">Code Source</a>
                </div>
            </div>
        `;
    }).join(''); // On transforme le tableau en une seule grosse chaîne de caractères

    container.innerHTML = htmlContent;
}