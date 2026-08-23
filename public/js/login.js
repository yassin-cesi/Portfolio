document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const eyeIcon = document.getElementById("eye-icon");
  const errorText = document.getElementById("login-error");
  const loginBtn = document.getElementById("btn-login");

  // 1. Afficher / Masquer le mot de passe
  if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      eyeIcon.classList.toggle("fa-eye", !isPassword);
      eyeIcon.classList.toggle("fa-eye-slash", isPassword);
    });
  }

  // 2. Gestion de la soumission du formulaire
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      if (errorText) errorText.innerText = "";
      if (loginBtn) {
        loginBtn.innerText = "Connexion...";
        loginBtn.disabled = true;
      }

      const email = document.getElementById("email")?.value.trim();
      const password = passwordInput?.value;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Prise en compte des formats de réponse courants : data.token, data.accessToken ou data.jwt
          const token = data.token || data.accessToken || data.jwt;

          if (token) {
            localStorage.setItem("adminToken", token);
            // Redirection vers le dashboard d'administration
            window.location.href = "/admin/authorized/admin.html";
          } else {
            console.error("Aucun token détecté dans la réponse :", data);
            if (errorText) {
              errorText.innerText = "Erreur du serveur (aucun token d'authentification reçu).";
            }
          }
        } else {
          if (errorText) {
            errorText.innerText = data.message || data.error || "Identifiants incorrects.";
          }
        }
      } catch (error) {
        console.error("Erreur de connexion :", error);
        if (errorText) {
          errorText.innerText = "Impossible de contacter le serveur d'authentification.";
        }
      } finally {
        if (loginBtn) {
          loginBtn.innerText = "Se connecter";
          loginBtn.disabled = false;
        }
      }
    });
  }
});