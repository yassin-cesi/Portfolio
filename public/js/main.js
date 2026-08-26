// Variable globale pour stocker les projets
let allProjects = [];

// Construit les liens vers le code source avec un libellé clair plutôt que
// "Github 1" / "Github 2". Quand les deux liens sont présents, on suppose le
// schéma le plus courant (frontend / backend). S'il n'y en a qu'un, on reste
// générique puisqu'on ne sait pas lequel des deux il représente.
function buildGithubLinksHTML(link1, link2, linkClass) {
  let html = "";
  if (link1 && link2) {
    html += `<a href="${link1}" target="_blank" class="${linkClass}">Frontend <span class="icon">↗</span></a>`;
    html += `<a href="${link2}" target="_blank" class="${linkClass}">Backend <span class="icon">↗</span></a>`;
  } else if (link1 || link2) {
    const link = link1 || link2;
    html += `<a href="${link}" target="_blank" class="${linkClass}">Code source <span class="icon">↗</span></a>`;
  }
  return html;
}

async function loadProjects() {
  const container = document.getElementById("projects-container");
  if (!container) return;

  try {
    // Utilisation du chemin relatif vers l'API
    const response = await fetch("/api/projects");
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

      const title = project.title || project.Title || "Titre inconnu";
      const desc =
        project.description || project.Description || "Pas de description";
      const id = project.id || project.IdProject;
      const images = project.images || [];

      let mainImage = images.find((img) => img.IsMain === 1) || images[0];
      // Image servie via le chemin absolu /images/
      const imagePath = mainImage
        ? `/images/${mainImage.ImageUrl}`
        : "images/placeholder.png";

      let languagesHTML = "";
      const languagesArray = project.languages || project.Languages || [];
      languagesArray.forEach((lang) => {
        languagesHTML += `<span class="lang-badge">${lang.Name || lang.name}</span>`;
      });

      let linksHTML = "";
      const link1 = project.githubLink || project.Github_Link;
      const link2 = project.githubLink2 || project.Github_Link2;

      if (link1)
        linksHTML += `<a href="${link1}" target="_blank" class="project-link">Code 1</a>`;
      if (link2)
        linksHTML += `<a href="${link2}" target="_blank" class="project-link">Code 2</a>`;

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
        images.forEach((img) => {
          const imgElement = document.createElement("img");
          imgElement.src = `/images/${img.ImageUrl}`;
          imgElement.alt = "Projet";
          imgElement.classList.add("modal-gallery-img");
          imgElement.onclick = () => {
            lightboxImg.src = imgElement.src;
            lightbox.style.display = "flex";
          };
          galleryContainer.appendChild(imgElement);
        });
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

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();

  // Gestion du Thème Clair / Sombre
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-mode");
      themeToggle.checked = true;
    }

    themeToggle.addEventListener("change", () => {
      document.body.classList.toggle("light-mode");
      localStorage.setItem(
        "theme",
        document.body.classList.contains("light-mode") ? "light" : "dark",
      );
    });
  }

  // Formulaire de Contact
  const contactForm = document.getElementById("contact-form");
  const formResponse = document.getElementById("form-response");
  const submitBtn = document.getElementById("btn-submit");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const content = document.getElementById("content").value.trim();

      if (!name || !email || !subject || !content) {
        formResponse.innerText = "❌ Tous les champs sont obligatoires.";
        formResponse.className = "form-response error";
        return;
      }

      submitBtn.innerText = "Envoi en cours...";
      submitBtn.disabled = true;

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject, content }),
        });
        const result = await response.json();
        if (response.ok) {
          formResponse.innerText = "✨ " + result.message;
          formResponse.className = "form-response success";
          contactForm.reset();
        } else {
          formResponse.innerText = "❌ " + result.message;
          formResponse.className = "form-response error";
        }
      } catch (error) {
        formResponse.innerText = "❌ Impossible de joindre le serveur.";
        formResponse.className = "form-response error";
      } finally {
        submitBtn.innerText = "Envoyer le message";
        submitBtn.disabled = false;
      }
    });
  }
});
