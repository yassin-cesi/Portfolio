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

      // Gestion des noms de colonnes (au cas où c'est en majuscule : Id, Title, etc.)
      const title = project.title || project.Title || "Titre inconnu";
      const desc =
        project.description || project.Description || "Pas de description";
      const id = project.id || project.IdProject;
      const images = project.images || [];

      // Image principale avec préfixe /images/
      let mainImage = images.find((img) => img.IsMain === 1) || images[0];
      const imagePath = mainImage
        ? `http://localhost:3000/images/${mainImage.ImageUrl}`
        : "images/placeholder.png";

      // Badges langages
      let languagesHTML = "";
      const languagesArray = project.languages || project.Languages || [];
      languagesArray.forEach((lang) => {
        languagesHTML += `<span class="lang-badge">${lang.Name || lang.name}</span>`;
      });

      // Liens GitHub
      let linksHTML = "";
      if (project.githubLink || project.Github_Link) {
        linksHTML += `<a href="${project.githubLink || project.Github_Link}" target="_blank" class="project-link">Code</a>`;
      }

      projectCard.innerHTML = `
        <div class="project-img-wrapper">
          <img src="${imagePath}" alt="${title}" class="project-img">
        </div>
        <div class="project-info">
          <h3 class="project-title">${title}</h3>
          <p class="project-desc">${desc}</p>
          <div class="project-badges">${languagesHTML}</div>
          <div class="project-footer">
            <button class="btn-details" data-id="${id}">En savoir plus</button>
            <div class="project-links">${linksHTML}</div>
          </div>
        </div>
      `;

      container.appendChild(projectCard);
    });

    setupModalEvents();
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="error-msg">Impossible de charger les projets.</p>`;
  }
}

function setupModalEvents() {
  const modal = document.getElementById("project-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeLightboxBtn = document.querySelector(".close-lightbox");

  document.querySelectorAll(".btn-details").forEach((button) => {
    button.addEventListener("click", (e) => {
      const projectId = parseInt(e.target.getAttribute("data-id"));
      const project = allProjects.find(
        (p) => (p.id || p.IdProject) === projectId,
      );

      if (project) {
        document.getElementById("modal-title").innerText =
          project.title || project.Title;
        document.getElementById("modal-desc").innerText =
          project.description || project.Description;

        const galleryContainer = document.getElementById("modal-gallery");
        galleryContainer.innerHTML = "";

        const images = project.images || [];
        if (images.length > 0) {
          images.forEach((img) => {
            const imgElement = document.createElement("img");
            // CORRECTION : Ajout du préfixe /images/ ici aussi
            imgElement.src = `http://localhost:3000/images/${img.ImageUrl}`;
            imgElement.alt = "Projet";
            imgElement.classList.add("modal-gallery-img");

            imgElement.addEventListener("click", () => {
              lightboxImg.src = imgElement.src;
              lightbox.style.display = "flex";
            });

            galleryContainer.appendChild(imgElement);
          });
        }
        modal.style.display = "flex";
      }
    });
  });

  closeModalBtn?.addEventListener(
    "click",
    () => (modal.style.display = "none"),
  );
  closeLightboxBtn?.addEventListener(
    "click",
    () => (lightbox.style.display = "none"),
  );

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
    if (e.target === lightbox) lightbox.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", loadProjects);

// --- GESTION DU FORMULAIRE DE CONTACT ---
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  const formResponse = document.getElementById("form-response");
  const submitBtn = document.getElementById("btn-submit");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Empêche la page de se recharger

      // Désactive le bouton pendant l'envoi pour éviter les doubles clics
      submitBtn.innerText = "Envoi en cours...";
      submitBtn.disabled = true;

      // Récupération des valeurs du formulaire
      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        content: document.getElementById("content").value,
      };

      try {
        // Appel à ton API de messages
        const response = await fetch("http://localhost:3000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
          // Succès
          formResponse.innerText =
            "✨ " + (result.message || "Message envoyé avec succès !");
          formResponse.className = "form-response success";
          contactForm.reset(); // Vide les champs du formulaire
        } else {
          // Erreur renvoyée par le serveur
          formResponse.innerText =
            "❌ " + (result.message || "Une erreur est survenue.");
          formResponse.className = "form-response error";
        }
      } catch (error) {
        console.error("Erreur formulaire:", error);
        formResponse.innerText =
          "❌ Impossible de joindre le serveur pour le moment.";
        formResponse.className = "form-response error";
      } finally {
        // Réactive le bouton
        submitBtn.innerText = "Envoyer le message";
        submitBtn.disabled = false;
      }
    });
  }
});
