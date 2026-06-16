document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const eyeIcon = document.getElementById("eye-icon");
  const errorText = document.getElementById("login-error");
  const loginBtn = document.getElementById("btn-login");

  // 1. Logique pour voir/masquer le mot de passe
  togglePasswordBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash"); // Change l'icône
    } else {
      passwordInput.type = "password";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    }
  });

  // 2. Gestion de la soumission du formulaire
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorText.innerText = "";
    loginBtn.innerText = "Connexion...";
    loginBtn.disabled = true;

    const email = document.getElementById("email").value;
    const password = passwordInput.value;

    try {
      console.log("Tentative de connexion pour :", email);
      const response = await fetch("https://portfolio-production-aa49.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Statut de la réponse du serveur :", response.status);
      const data = await response.json();
      console.log("Données renvoyées par le serveur :", data);

      if (response.ok) {
        // Si ton Back-End renvoie le token sous une autre clé (ex: data.token ou data.accessToken)
        const token = data.token || data.accessToken;
        if (token) {
          localStorage.setItem("adminToken", token);
          window.location.href = ".";
        } else {
          console.error(
            "Le serveur a validé la connexion mais n'a renvoyé aucun token. Vérifie la clé dans ton controlleur login.",
          );
          errorText.innerText =
            "Erreur de configuration du serveur (pas de token reçu).";
        }
      } else {
        errorText.innerText = data.message || "Identifiants incorrects.";
      }
    } catch (error) {
      console.error("Erreur attrapée par le script de login :", error);
      errorText.innerText =
        "Impossible de joindre le serveur d'authentification.";
    } finally {
      loginBtn.innerText = "Se connecter";
      loginBtn.disabled = false;
    }
  });
});