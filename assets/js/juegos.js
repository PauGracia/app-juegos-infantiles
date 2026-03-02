let confirmAction = null;

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

function abrirModalConfirmacion(mensaje, accion) {
  const modal = document.getElementById("modal-confirm-delete");
  const messageEl = document.getElementById("confirm-message");

  messageEl.textContent = mensaje;
  confirmAction = accion;

  abrirModalSettings("modal-confirm-delete");
}

function cerrarModalConfirmacion() {
  confirmAction = null;
  cerrarModalSettings();
}

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

  // ============================================
  // GESTIÓN DE BORRADO DE DATOS
  // ============================================

  // Botón de historial
  const btnHistory = document.getElementById("btn-settings-history");
  if (btnHistory) {
    btnHistory.addEventListener("click", function () {
      abrirModalSettings("modal-history");
    });
  }

  // Botón para borrar datos del ahorcado
  const btnDeleteAhorcado = document.getElementById("btn-delete-ahorcado");
  if (btnDeleteAhorcado) {
    btnDeleteAhorcado.addEventListener("click", () => {
      abrirModalConfirmacion(
        "¿Seguro que quieres borrar todos los datos del Ahorcado?",
        () => {
          localStorage.removeItem("rankingAhorcado");
          mostrarToastIdioma("Datos del Ahorcado borrados");
        },
      );
    });
  }

  // Función genérica para borrar datos con confirmación
  function borrarDatosJuego(claves, nombreJuego, mensajeExito) {
    abrirModalConfirmacion(
      `¿Seguro que quieres borrar todos los datos de ${nombreJuego}?`,
      () => {
        if (Array.isArray(claves)) {
          claves.forEach((clave) => localStorage.removeItem(clave));
        } else {
          localStorage.removeItem(claves);
        }

        mostrarToastIdioma(mensajeExito || `${nombreJuego} - Datos borrados`);
      },
    );
  }

  // BOTONES DEL MEMORI
  const btnMemoriNormal = document.getElementById("btn-delete-memori-normal");
  if (btnMemoriNormal) {
    btnMemoriNormal.addEventListener("click", function () {
      borrarDatosJuego(
        "ranking_memori",
        "Memori - Modo Normal",
        "Memori Normal borrado",
      );
    });
  }

  const btnMemoriDesafio = document.getElementById("btn-delete-memori-desafio");
  if (btnMemoriDesafio) {
    btnMemoriDesafio.addEventListener("click", function () {
      borrarDatosJuego(
        "ranking_desafio",
        "Memori - Modo Desafío",
        "Memori Desafío borrado",
      );
    });
  }

  const btnMemoriAll = document.getElementById("btn-delete-memori-all");
  if (btnMemoriAll) {
    btnMemoriAll.addEventListener("click", function () {
      borrarDatosJuego(
        ["ranking_memori", "ranking_desafio"],
        "Memori (todos los modos)",
        "Todos los datos del Memori borrados",
      );
    });
  }

  // BOTÓN DE BORRAR TODOS LOS JUEGOS
  const btnDeleteAllGames = document.getElementById("btn-delete-all-games");
  if (btnDeleteAllGames) {
    btnDeleteAllGames.addEventListener("click", function () {
      // Lista completa de todos los rankings de todos los juegos
      const todosLosRankings = [
        // Memori
        "ranking_memori",
        "ranking_desafio",
        // Ahorcado
        "rankingAhorcado",
        // Operaciones (cuando esté implementado)
        // "rankingOperaciones",
        // Palabras (cuando esté implementado)
        // "rankingPalabras",
        // Damas (cuando esté implementado)
        // "rankingDamas"
      ];

      abrirModalConfirmacion(
        "⚠️ ¿Seguro que quieres borrar TODOS LOS DATOS de TODOS LOS JUEGOS?\n\nEsta acción no se puede deshacer.",
        () => {
          todosLosRankings.forEach((clave) => {
            if (localStorage.getItem(clave) !== null) {
              localStorage.removeItem(clave);
            }
          });

          mostrarToastIdioma(
            "Todos los datos de todos los juegos han sido borrados",
          );

          cerrarModalSettings();
        },
      );
    });
  }

  // Funcionalidad modal de confirmacion
  const btnConfirmAccept = document.getElementById("btn-confirm-accept");
  const btnConfirmCancel = document.getElementById("btn-confirm-cancel");

  if (btnConfirmAccept) {
    btnConfirmAccept.addEventListener("click", () => {
      if (typeof confirmAction === "function") {
        confirmAction();
      }
      cerrarModalConfirmacion();
    });
  }

  if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener("click", cerrarModalConfirmacion);
  }

  // Abrir modal de términos
  document.getElementById("footer-terms").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("modal-terms").classList.add("activo");
  });

  // Cerrar modal
  document
    .querySelector("#modal-terms .cerrar-modal")
    .addEventListener("click", () => {
      document.getElementById("modal-terms").classList.remove("activo");
    });

  // Cerrar al hacer clic fuera del modal
  document.getElementById("modal-terms").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-terms")) {
      e.target.classList.remove("activo");
    }
  });
});
