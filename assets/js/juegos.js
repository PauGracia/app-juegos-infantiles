// Abrir/cerrar menú de configuración
document.getElementById("settings-btn").addEventListener("click", function (e) {
  e.stopPropagation();
  const menu = document.getElementById("settings-menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

// Cerrar menú al hacer clic fuera
document.addEventListener("click", function (e) {
  const settingsMenu = document.getElementById("settings-menu");
  const settingsBtn = document.getElementById("settings-btn");

  if (
    settingsMenu &&
    !settingsMenu.contains(e.target) &&
    !settingsBtn.contains(e.target)
  ) {
    settingsMenu.style.display = "none";
  }
});

// Función para abrir y cerrar modales de configuración
function abrirModalSettings(modalId) {
  document.getElementById("settings-menu").style.display = "none";
  document.body.classList.add("modal-open");

  document.querySelectorAll(".modal-settings").forEach((modal) => {
    modal.style.display = modal.id === modalId ? "flex" : "none";
  });
}

function cerrarModalSettings() {
  document.querySelectorAll(".modal-settings").forEach((modal) => {
    modal.style.display = "none";
  });
  document.body.classList.remove("modal-open");
}

function mostrarToastIdioma(texto) {
  const toast = document.getElementById("language-toast");
  if (!toast) return;

  toast.textContent = texto;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

document.addEventListener("languageChanged", (e) => {
  if (!e.detail.manual) return; // ignorar inicio automático

  const lang = e.detail.lang;

  const langName = translations[`language.${lang}`] || lang.toUpperCase();
  const template =
    translations["language.selected"] || "Language selected: {lang}";

  mostrarToastIdioma(template.replace("{lang}", langName));
});

// Asignar eventos a los botones del menú de ajustes
document.addEventListener("DOMContentLoaded", function () {
  // Botón de idiomas
  const btnLanguage = document.getElementById("btn-settings-language");
  if (btnLanguage) {
    btnLanguage.addEventListener("click", function () {
      abrirModalSettings("modal-language");
    });
  }

  // Botón de objetivo
  const btnObjective = document.getElementById("btn-settings-objective");
  if (btnObjective) {
    btnObjective.addEventListener("click", function () {
      abrirModalSettings("modal-objective");
    });
  }

  // Cerrar modales al hacer clic fuera del contenido
  document.querySelectorAll(".modal-settings").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        cerrarModalSettings();
      }
    });
  });

  // Cerrar modales con Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      cerrarModalSettings();
      document.getElementById("settings-menu").style.display = "none";
    }
  });
});

// Controlar modal atribuciones

const footerAttributions = document.getElementById("footer-attributions");

if (footerAttributions) {
  footerAttributions.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalSettings("modal-attributions");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  const footer = document.querySelector("footer");
  const bodyIndex = document.getElementById("body-index");
  const footerTop = footer.querySelector(".footer-top");
  const footerBottom = footer.querySelector(".footer-bottom");

  let isExpanded = false;
  let animationFrame;

  const isMobile = window.matchMedia("(hover: none)").matches;

  function getExpandedHeight() {
    return footerTop.offsetHeight + footerBottom.scrollHeight;
  }

  function updateBodyPadding(height) {
    bodyIndex.style.paddingBottom = `${height}px`;
  }

  function animateHeight(from, to, duration = 350, callback) {
    const startTime = performance.now();
    cancelAnimationFrame(animationFrame);

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newHeight = from + (to - from) * progress;
      footer.style.height = `${newHeight}px`;
      updateBodyPadding(newHeight);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else if (callback) {
        callback();
      }
    }

    animationFrame = requestAnimationFrame(step);
  }

  function expandFooter() {
    if (isExpanded) return;
    isExpanded = true;
    footer.classList.add("expanded");
    animateHeight(footer.offsetHeight, getExpandedHeight(), 350);
  }

  function collapseFooter() {
    if (!isExpanded) return;
    isExpanded = false;
    animateHeight(footer.offsetHeight, footerTop.offsetHeight, 350, () => {
      footer.classList.remove("expanded");
    });
  }

  // Scroll desktop y móvil
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (!isMobile) {
      if (scrollTop > 20) expandFooter();
      else collapseFooter();
    }
  });

  // Hover desktop
  if (!isMobile) {
    footer.addEventListener("mouseenter", expandFooter);
    footer.addEventListener("mouseleave", () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop < 20) collapseFooter();
    });
  }

  // Toque móvil: expandir/contraer con tap
  if (isMobile) {
    footer.addEventListener("click", () => {
      if (isExpanded) collapseFooter();
      else expandFooter();
    });
  }

  // Inicializamos altura
  footer.style.height = `${footerTop.offsetHeight}px`;
  updateBodyPadding(footerTop.offsetHeight);

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      loadLanguage(lang, true);
    });
  });

  const footerAbout = document.getElementById("footer-about");

  if (footerAbout) {
    footerAbout.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalSettings("modal-objective");
    });
  }

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cerrarModalSettings();
    });
  });

  const footerPrivacy = document.getElementById("footer-privacy");

  if (footerPrivacy) {
    footerPrivacy.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalSettings("modal-privacy");
    });
  }

  // Botón de historial - AÑADIR dentro del DOMContentLoaded donde están los otros botones
  const btnHistory = document.getElementById("btn-settings-history");
  if (btnHistory) {
    btnHistory.addEventListener("click", function () {
      abrirModalSettings("modal-history");
    });
  }

  // Botón para borrar datos del ahorcado - AÑADIR dentro del DOMContentLoaded
  const btnDeleteAhorcado = document.getElementById("btn-delete-ahorcado");
  if (btnDeleteAhorcado) {
    btnDeleteAhorcado.addEventListener("click", function () {
      if (confirm("¿Seguro que quieres borrar todos los datos del Ahorcado?")) {
        localStorage.removeItem("rankingAhorcado");

        // Mostrar toast
        const toast = document.getElementById("language-toast");
        if (toast) {
          toast.textContent = "Datos del Ahorcado borrados";
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 2000);
        }

        // Cerrar modal
        cerrarModalSettings();
      }
    });
  }
});
