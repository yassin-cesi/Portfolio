const API_URL = "http://localhost:3000/api/projects";

// Variable globale pour stocker les projets une fois chargés
let allProjects = [];

async function loadProjects() {
  const container = document.getElementById("projects-container");

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erreur lors de la récupération");

    allProjects = await response.json();
    container.innerHTML = "";

    if (allProjects.length === 0) {
      container.innerHTML = "<p>Aucun projet trouvé.</p>";
      return;
    }

    allProjects.forEach((project) => {
      const projectCard = document.createElement("div");
      projectCard.classList.add("project-card");

      // Image principale
      let mainImage = project.images.find((img) => img.IsMain === 1);
      if (!mainImage && project.images.length > 0)
        mainImage = project.images[0];
      const imagePath = mainImage
        ? mainImage.ImageUrl
        : "images/placeholder.png";

      // Badges langages
      let languagesHTML = "";
      const languagesArray = project.languages || project.Languages || [];
      if (languagesArray.length > 0) {
        languagesArray.forEach((lang) => {
          languagesHTML += `<span class="lang-badge">${lang.Name || lang.name}</span>`;
        });
      }

      // Liens GitHub
      let linksHTML = "";
      if (project.githubLink) {
        linksHTML += `<a href="${project.githubLink}" target="_blank" class="project-link">Code ${project.githubLink2 ? "API" : ""}</a>`;
      }
      if (project.githubLink2) {
        linksHTML += `<a href="${project.githubLink2}" target="_blank" class="project-link">Code Front</a>`;
      }

      // Construction de la carte avec le NOUVEAU BOUTON (note l'attribut data-id)
      projectCard.innerHTML = `
        <div class="project-img-wrapper">
          <img src="${imagePath}" alt="${project.title}" class="project-img">
        </div>
        <div class="project-info">
          <h3 class="project-title">${project.title || "Titre inconnu"}</h3>
          <p class="project-desc">${project.description || "Pas de description"}</p>
          
          <div class="project-badges">${languagesHTML}</div>
          
          <div class="project-footer">
            <button class="btn-details" data-id="${project.id}">En savoir plus</button>
            <div class="project-links">${linksHTML}</div>
          </div>
        </div>
      `;

      container.appendChild(projectCard);
    });

    // Une fois les cartes créées, on active les clics sur les boutons de détails
    setupModalEvents();
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="error-msg">Impossible de charger les projets.</p>`;
  }
}

// Fonction pour gérer l'ouverture et la fermeture de la modale
function setupModalEvents() {
  const modal = document.getElementById("project-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const detailButtons = document.querySelectorAll(".btn-details");

  // Variables pour la Lightbox (Plein écran)
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeLightboxBtn = document.querySelector(".close-lightbox");

  // Ouverture de la modale Projet
  detailButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const projectId = parseInt(e.target.getAttribute("data-id"));
      const project = allProjects.find((p) => p.id === projectId);

      if (project) {
        document.getElementById("modal-title").innerText = project.title;
        document.getElementById("modal-desc").innerText = project.description;

        const galleryContainer = document.getElementById("modal-gallery");
        galleryContainer.innerHTML = "";

        if (project.images && project.images.length > 0) {
          project.images.forEach((img) => {
            const imgElement = document.createElement("img");
            imgElement.src = img.ImageUrl;
            imgElement.alt = project.title;
            imgElement.classList.add("modal-gallery-img");

            // ⚡ NOUVEAU : Quand on clique sur cette image, elle s'ouvre en grand
            imgElement.addEventListener("click", () => {
              lightboxImg.src = img.ImageUrl;
              lightbox.style.display = "flex";
            });

            galleryContainer.appendChild(imgElement);
          });
        } else {
          galleryContainer.innerHTML =
            "<p>Aucune image disponible pour ce projet.</p>";
        }

        modal.style.display = "flex";
      }
    });
  });

  // Fermeture de la modale Projet
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // ⚡ NOUVEAU : Fermeture de la Lightbox (Plein écran)
  closeLightboxBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  // Fermeture au clic à l'extérieur
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
    if (e.target === lightbox) {
      lightbox.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", loadProjects);
