// Variable globale pour stocker les projets
let allProjects = [];

// Données factices de secours au cas où l'API est hors-ligne / en local
const MOCK_PROJECTS = [
  {
    id: 1,
    title: "Portfolio Personnel",
    description:
      "Plateforme web moderne avec gestion dynamique du thème et interface responsive.",
    languages: [{ name: "HTML5" }, { name: "CSS3" }, { name: "JavaScript" }],
    githubLink: "https://github.com/yassin-cesi",
  },
  {
    id: 2,
    title: "Application E-Commerce",
    description:
      "Application web d'inventaire et de gestion de panier connectée à une API REST.",
    languages: [{ name: "React" }, { name: "Node.js" }, { name: "MySQL" }],
    githubLink: "https://github.com/yassin-cesi",
  },
];

// 1. Affiche des Skeletons animés pendant l'attente
function showSkeletons(container) {
  container.innerHTML = `
    <div class="skeleton-card" style="padding: 20px; border-radius: 12px; background: rgba(255, 255, 255, 0.05); margin-bottom: 16px;">
      <div style="height: 20px; width: 40%; background: rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 12px;"></div>
      <div style="height: 14px; width: 80%; background: rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 8px;"></div>
      <div style="height: 14px; width: 60%; background: rgba(255, 255, 255, 0.1); border-radius: 4px;"></div>
    </div>
  `;
}

// 2. Génération du HTML des liens GitHub
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

// 3. Affichage effectif de la liste des projets
function renderProjectsList(projects, container) {
  container.innerHTML = "";

  if (!projects || projects.length === 0) {
    container.innerHTML = "<p>Aucun projet trouvé.</p>";
    return;
  }

  projects.forEach((project) => {
    const projectCard = document.createElement("div");
    projectCard.classList.add("project-card");

    const title = project.title || project.Title || "Titre inconnu";
    const desc =
      project.description || project.Description || "Pas de description";
    const id = project.id || project.IdProject;
    const images = project.images || [];

    let mainImage = images.find((img) => img.IsMain === 1) || images[0];
    const imagePath = mainImage
      ? `/images/${mainImage.ImageUrl}`
      : "images/placeholder.png";

    let languagesHTML = "";
    const languagesArray = project.languages || project.Languages || [];
    languagesArray.forEach((lang) => {
      languagesHTML += `<span class="lang-badge">${lang.Name || lang.name}</span>`;
    });

    const link1 = project.githubLink || project.Github_Link;
    const link2 = project.githubLink2 || project.Github_Link2;
    const linksHTML = buildGithubLinksHTML(link1, link2, "project-link");

    projectCard.innerHTML = `
      <div class="project-img-wrapper">
        <img src="${imagePath}" alt="${title}" class="project-img" onerror="this.style.display='none'">
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
}

// 4. Fonction principale de chargement
async function loadProjects() {
  // CORRECTION : On cherche "projects-grid" qui correspond au HTML
  const container =
    document.getElementById("projects-grid") ||
    document.getElementById("projects-container");
  if (!container) return;

  // Affichage immédiat du skeleton
  showSkeletons(container);

  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("Erreur HTTP " + response.status);

    allProjects = await response.json();
    renderProjectsList(allProjects, container);
  } catch (error) {
    console.warn(
      "API non disponible, affichage des données factices :",
      error.message,
    );
    allProjects = MOCK_PROJECTS;
    renderProjectsList(allProjects, container);
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

  // Thème Clair / Sombre
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
