const API_BASE = "/api";

// Vérification du Token et Redirection Absolue
const token = localStorage.getItem("adminToken");
if (!token) {
  window.location.href = "/admin/authentification/login.html";
}

let localProjectsArray = [];

function switchTab(tabId, event) {
  document
    .querySelectorAll(".admin-section")
    .forEach((sec) => sec.classList.remove("active"));
  document
    .querySelectorAll(".admin-nav a")
    .forEach((link) => link.classList.remove("active"));

  document.getElementById(`tab-${tabId}`).classList.add("active");

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  if (tabId === "messages") fetchMessages();
  else if (tabId === "add-project") fetchAdminProjects();
}

async function fetchMessages() {
  const listContainer = document.getElementById("messages-list");
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/authentification/login.html";
      return;
    }

    if (!response.ok) throw new Error("Erreur serveur lors de la récupération");

    const messages = await response.json();
    listContainer.innerHTML = "";

    if (messages.length === 0) {
      listContainer.innerHTML =
        "<p>Aucun message dans la boîte de réception.</p>";
      return;
    }

    messages.forEach((msg) => {
      const card = document.createElement("div");
      card.classList.add("message-admin-card");
      card.innerHTML = `
        <div class="msg-header">
            <strong><i class="fas fa-user"></i> ${msg.name}</strong>
            <span class="msg-email"><i class="fas fa-envelope"></i> ${msg.email}</span>
        </div>
        <div class="msg-subject">Objet : ${msg.subject || "Sans objet"}</div>
        <p class="msg-content">${msg.content}</p>
      `;
      listContainer.appendChild(card);
    });
  } catch (error) {
    listContainer.innerHTML = `<p class="error-msg">Erreur lors du chargement : ${error.message}</p>`;
  }
}

async function fetchAdminProjects() {
  const listContainer = document.getElementById("admin-projects-list");
  if (!listContainer) return;

  try {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) throw new Error("Impossible de charger les projets");

    localProjectsArray = await response.json();
    listContainer.innerHTML = "";

    if (localProjectsArray.length === 0) {
      listContainer.innerHTML = "<p>Aucun projet publié.</p>";
      return;
    }

    localProjectsArray.forEach((proj) => {
      const item = document.createElement("div");
      item.classList.add("admin-project-item");

      const safeTitle = (proj.title || "Projet sans titre").replace(
        /'/g,
        "\\'",
      );

      item.innerHTML = `
        <div class="admin-item-info">
            <strong>${proj.title || "Sans titre"}</strong>
            <span style="color: #9ca3af; font-size: 0.8rem; display: block;">ID: ${proj.id}</span>
        </div>
        <div class="admin-item-actions" style="display: flex; gap: 10px; align-items: center;">
            <button type="button" class="btn-edit-action" style="cursor:pointer; background:#38bdf8; border:none; color:#0b0f19; padding:6px 12px; border-radius:6px; font-weight:600;" onclick="prepareEditProject(${proj.id})">
                <i class="fas fa-edit"></i> Modifier
            </button>
            <button type="button" class="btn-delete-action" style="cursor:pointer; background:#ef4444; border:none; color:#ffffff; padding:6px 12px; border-radius:6px; font-weight:600;" onclick="deleteProjectAction(${proj.id}, '${safeTitle}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
      `;
      listContainer.appendChild(item);
    });
  } catch (error) {
    listContainer.innerHTML = `<p style="color:#ef4444">Erreur : ${error.message}</p>`;
  }
}

window.prepareEditProject = function (projectId) {
  const project = localProjectsArray.find((p) => p.id === projectId);
  if (!project) return;

  document.getElementById("proj-id").value = project.id;
  document.getElementById("proj-title").value = project.title || "";
  document.getElementById("proj-desc").value = project.description || "";
  document.getElementById("proj-link1").value = project.githubLink || "";
  document.getElementById("proj-link2").value = project.githubLink2 || "";

  if (project.type && typeof project.type === "object") {
    document.getElementById("proj-type").value =
      project.type.Name || project.type.Label || "";
  } else {
    document.getElementById("proj-type").value = project.type || "";
  }

  if (project.languages && Array.isArray(project.languages)) {
    document.getElementById("proj-languages").value = project.languages
      .map((lang) => lang.Name || lang.label || lang)
      .join(", ");
  } else if (project.languages && typeof project.languages === "string") {
    document.getElementById("proj-languages").value = project.languages;
  } else {
    document.getElementById("proj-languages").value = "";
  }

  document.getElementById("form-project-title").innerText =
    `✏️ Modifier : ${project.title || ""}`;
  document.getElementById("btn-project-submit").innerText =
    "Enregistrer les modifications";

  document.getElementById("proj-image").required = false;

  const helper = document.getElementById("image-helper");
  if (helper) helper.style.display = "block";

  const cancelBtn = document.getElementById("btn-cancel-edit");
  if (cancelBtn) cancelBtn.style.display = "inline-block";
};

window.resetProjectForm = function () {
  document.getElementById("proj-id").value = "";
  document.getElementById("add-project-form").reset();

  document.getElementById("form-project-title").innerText =
    "Ajouter un Nouveau Projet";
  document.getElementById("btn-project-submit").innerText = "Publier le projet";

  document.getElementById("proj-image").required = true;

  const helper = document.getElementById("image-helper");
  if (helper) helper.style.display = "none";

  const cancelBtn = document.getElementById("btn-cancel-edit");
  if (cancelBtn) cancelBtn.style.display = "none";
};

document
  .getElementById("add-project-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const responseText = document.getElementById("project-response");
    responseText.innerText = "";

    const projectId = document.getElementById("proj-id").value;
    const isEditing = projectId !== "";

    const formData = new FormData();
    formData.append("Title", document.getElementById("proj-title").value);
    formData.append("Description", document.getElementById("proj-desc").value);
    formData.append(
      "Github_Link",
      document.getElementById("proj-link1").value || "",
    );
    formData.append(
      "Github_Link_2",
      document.getElementById("proj-link2").value || "",
    );
    formData.append("TypeName", document.getElementById("proj-type").value);
    formData.append(
      "languages",
      document.getElementById("proj-languages").value,
    );

    const imageInput = document.getElementById("proj-image");
    if (imageInput.files.length > 0) {
      for (let i = 0; i < imageInput.files.length; i++) {
        formData.append("projectImages", imageInput.files[i]);
      }
    } else if (!isEditing) {
      responseText.innerText = "❌ Veuillez sélectionner au moins une image.";
      responseText.style.color = "#ef4444";
      return;
    }

    try {
      const url = isEditing
        ? `${API_BASE}/projects/${projectId}`
        : `${API_BASE}/projects`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let result;
      const rawText = await response.text();
      try {
        result = JSON.parse(rawText);
      } catch {
        responseText.innerText = `❌ Réponse inattendue du serveur.`;
        responseText.style.color = "#ef4444";
        return;
      }

      if (response.ok) {
        responseText.innerText = isEditing
          ? "✏️ Modifications enregistrées avec succès !"
          : result.message || "✨ Projet publié avec succès !";
        responseText.style.color = "#10b981";

        resetProjectForm();
        fetchAdminProjects();
      } else {
        const errorMsg = result.message || result.error || "Action impossible";
        responseText.innerText = `❌ Erreur ${response.status} : ${errorMsg}`;
        responseText.style.color = "#ef4444";
      }
    } catch (error) {
      responseText.innerText = `❌ Erreur réseau : ${error.message}`;
      responseText.style.color = "#ef4444";
    }
  });

window.deleteProjectAction = async function (projectId, projectTitle) {
  const confirmDelete = confirm(
    `⚠️ Êtes-vous sûr de vouloir supprimer "${projectTitle}" ?`,
  );
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (response.ok) {
      alert("🗑️ Projet supprimé avec succès !");
      const currentEditingId = document.getElementById("proj-id").value;
      if (currentEditingId == projectId) {
        resetProjectForm();
      }
      fetchAdminProjects();
    } else {
      alert(
        `❌ Erreur : ${result.message || "Impossible de supprimer le projet"}`,
      );
    }
  } catch (error) {
    alert("❌ Erreur réseau lors de la suppression.");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  fetchMessages();
  fetchAdminProjects();
});
