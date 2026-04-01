(() => {
  const adminToggle = document.getElementById("adminToggle");
  const adminBackdrop = document.getElementById("adminBackdrop");

  if (adminToggle && adminBackdrop) {
    adminToggle.addEventListener("click", () => {
      document.body.classList.toggle("menu-open");
    });

    adminBackdrop.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.body.classList.remove("menu-open");
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    });
  }
})();
