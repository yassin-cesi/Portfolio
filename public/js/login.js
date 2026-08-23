document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const eyeIcon = document.getElementById("eye-icon");
  const errorText = document.getElementById("login-error");
  const loginBtn = document.getElementById("btn-login");

  if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      eyeIcon.classList.toggle("fa-eye", !isPassword);
      eyeIcon.classList.toggle("fa-eye-slash", isPassword);
    });
  }

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          const token = data.token || data.accessToken || data.jwt;

          if (token) {
            localStorage.setItem("adminToken", token);
            // Redirection absolue vers le dashboard
            window.location.href = "/admin/authorized/admin.html";
          } else {
            if (errorText) {
              errorText.innerText = "Erreur du serveur (aucun token reçu).";
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