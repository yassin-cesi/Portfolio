const API_BASE = "http://localhost:3000/api";

// 🔐 SÉCURITÉ : Récupérer le token du localStorage
const token = localStorage.getItem("adminToken");

// Si pas de token, redirection immédiate vers le login
if (!token) {
  window.location.href = "login.html";
}

function switchTab(tabId) {
  document
    .querySelectorAll(".admin-section")
    .forEach((sec) => sec.classList.remove("active"));
  document
    .querySelectorAll(".admin-nav a")
    .forEach((link) => link.classList.remove("active"));

  document.getElementById(`tab-${tabId}`).classList.add("active");
  event.currentTarget.classList.add("active");

  if (tabId === "messages") {
    fetchMessages();
  }
}

// Récupérer les messages AVEC le token d'autorisation
async function fetchMessages() {
  const listContainer = document.getElementById("messages-list");
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: "GET",
      headers: {
        // ⚡ On glisse le token ici pour débloquer la sécurité 403
        Authorization: `Bearer ${token}`,
      },
    });

    // Si le serveur dit que le token a expiré ou est invalide
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("adminToken");
      window.location.href = "login.html";
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

// Soumission du formulaire d'ajout de projet AVEC le token
document
  .getElementById("add-project-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const responseText = document.getElementById("project-response");

    const payload = {
      title: document.getElementById("proj-title").value,
      description: document.getElementById("proj-desc").value,
      githubLink: document.getElementById("proj-link1").value || null,
      githubLink2: document.getElementById("proj-link2").value || null,
      languages: document
        .getElementById("proj-languages")
        .value.split(",")
        .map((s) => s.trim()),
      imageUrl: document.getElementById("proj-image").value,
    };

    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ⚡ On sécurise aussi l'ajout de projet
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        responseText.innerText = "✨ Projet ajouté avec succès sur le site !";
        responseText.style.color = "#10b981";
        document.getElementById("add-project-form").reset();
      } else {
        const errData = await response.json();
        responseText.innerText = `❌ Erreur : ${errData.message || "Impossible d'ajouter"}`;
        responseText.style.color = "#ef4444";
      }
    } catch (error) {
      responseText.innerText = "❌ Erreur de connexion au serveur.";
      responseText.style.color = "#ef4444";
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  fetchMessages();
});
