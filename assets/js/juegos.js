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

// Función para abrir modales de configuración
function abrirModalSettings(modalId) {
  // Cerrar menú de ajustes
  document.getElementById("settings-menu").style.display = "none";

  // Mostrar el modal solicitado
  document.getElementById(modalId).style.display = "flex";

  // Cerrar otros modales (por si acaso)
  document.querySelectorAll(".modal-settings").forEach((modal) => {
    if (modal.id !== modalId) {
      modal.style.display = "none";
    }
  });
}

// Función para cerrar modales de configuración (ya existe pero la mejoramos)
function cerrarModalSettings() {
  document.querySelectorAll(".modal-settings").forEach((modal) => {
    modal.style.display = "none";
  });
}

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

document.addEventListener("DOMContentLoaded", () => {
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
});
