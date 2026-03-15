let confirmAction = null;
let modalAnterior = null;
let isExpanded = false;
let animationFrame;
let footerAnimationInProgress = false;
let isClosingModal = false;
let footerAutoCloseTimer = null;

// ================================
// GESTIÓN DEL SPLASH SCREEN
// ================================
// Ocultar el splash cuando todo el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  const splashScreen = document.getElementById("splash-screen-index");

  // Función para ocultar el splash
  function hideSplashScreen() {
    if (splashScreen) {
      splashScreen.classList.add("hidden");

      // Hacer visible el body
      document.body.classList.add("visible");

      // Eliminar del DOM después de la transición
      setTimeout(() => {
        if (splashScreen && splashScreen.parentNode) {
          splashScreen.parentNode.removeChild(splashScreen);
        }
      }, 400);
    }
  }

  // Esperar a que todo esté cargado
  window.addEventListener("load", function () {
    setTimeout(hideSplashScreen, 300);
  });
});

function resetFooter(force = false) {
  // Asegurar que el splash no está bloqueando la interfaz
  const splash = document.getElementById("splash-screen-index");
  if (splash && !splash.classList.contains("hidden")) {
    splash.classList.add("hidden");
  }

  const footer = document.querySelector("footer");
  if (!footer) return;

  const footerTop = footer.querySelector(".footer-top");
  if (!footerTop) return;

  // Cancelar cualquier animación en curso
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  footer.classList.remove("expanded");
  footer.style.height = `${footerTop.offsetHeight}px`;
  isExpanded = false;
  footerAnimationInProgress = false;

  // Ajustar padding del body
  const bodyIndex = document.getElementById("body-index");
  if (bodyIndex) {
    bodyIndex.style.paddingBottom = `${footerTop.offsetHeight}px`;
  }
}

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

  // Guardamos el modal actualmente abierto
  modalAnterior = document.querySelector(".modal-settings[style*='flex']");

  messageEl.textContent = mensaje;
  confirmAction = accion;

  abrirModalSettings("modal-confirm-delete");
}

function cerrarModalConfirmacion() {
  confirmAction = null;

  // Cerrar solo el modal de confirmación
  document.getElementById("modal-confirm-delete").style.display = "none";

  // Volver al modal anterior (historial)
  if (modalAnterior) {
    modalAnterior.style.display = "flex";
  } else {
    document.body.classList.remove("modal-open");
  }

  modalAnterior = null;
}

// Función para abrir y cerrar modales de configuración
// En abrirModalSettings
function abrirModalSettings(modalId) {
  document.getElementById("settings-menu").style.display = "none";
  document.body.classList.add("modal-open");

  // Cerrar todos los modales primero
  document
    .querySelectorAll(".modal-settings, .modal-terminos")
    .forEach((modal) => {
      modal.style.display = "none";
    });

  // Abrir el modal específico
  const modalToOpen = document.getElementById(modalId);
  if (modalToOpen) {
    modalToOpen.style.display = "flex";
  }
}

// En los event listeners de cierre
document
  .querySelectorAll(".modal-settings, .modal-terminos")
  .forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        cerrarModalSettings();
      }
    });
  });

function cerrarModalSettings() {
  isClosingModal = true;
  // Cerrar todos los modales
  document
    .querySelectorAll(".modal-settings, .modal-terminos")
    .forEach((modal) => {
      modal.style.display = "none";
    });
  document.body.classList.remove("modal-open");

  // Resetear el footer de forma forzada y sin animaciones
  forceResetFooter();

  setTimeout(() => {
    isClosingModal = false;
  }, 300);
}

function forceResetFooter() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const footerTop = footer.querySelector(".footer-top");
  if (!footerTop) return;

  // Cancelar cualquier animación en curso
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  // Remover clases y estilos
  footer.classList.remove("expanded");
  footer.style.height = `${footerTop.offsetHeight}px`;
  footer.style.transition = "none";
  footer.style.pointerEvents = "auto";

  isExpanded = false;
  footerAnimationInProgress = false;

  // Ajustar padding del body
  const bodyIndex = document.getElementById("body-index");
  if (bodyIndex) {
    bodyIndex.style.paddingBottom = `${footerTop.offsetHeight}px`;
  }

  // Restaurar transición después de un pequeño retraso
  setTimeout(() => {
    footer.style.transition = "";
  }, 100);
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

// Controlar modal términos
const footerTerms = document.getElementById("footer-terms");
if (footerTerms) {
  footerTerms.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalSettings("modal-terms");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  const footer = document.querySelector("footer");
  const bodyIndex = document.getElementById("body-index");
  const footerTop = footer.querySelector(".footer-top");
  const footerBottom = footer.querySelector(".footer-bottom");

  const isMobile = window.matchMedia("(hover: none)").matches;

  // Variables para control de eventos
  let lastScrollTop = 0;
  let scrollTimeout;

  function getExpandedHeight() {
    return footerTop.offsetHeight + footerBottom.scrollHeight;
  }

  function updateBodyPadding(height) {
    bodyIndex.style.paddingBottom = `${height}px`;
  }

  function animateHeight(from, to, duration = 350, callback) {
    // Si hay una animación en curso, la cancelamos
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    footerAnimationInProgress = true;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newHeight = from + (to - from) * progress;
      footer.style.height = `${newHeight}px`;
      updateBodyPadding(newHeight);

      if (progress < 1 && !document.body.classList.contains("modal-open")) {
        animationFrame = requestAnimationFrame(step);
      } else {
        animationFrame = null;
        footerAnimationInProgress = false;
        if (callback) callback();
      }
    }

    animationFrame = requestAnimationFrame(step);
  }

  function startFooterAutoCloseTimer() {
    if (footerAutoCloseTimer) {
      clearTimeout(footerAutoCloseTimer);
    }

    footerAutoCloseTimer = setTimeout(() => {
      if (isExpanded && !document.body.classList.contains("modal-open")) {
        collapseFooter();
      }
    }, 60000); // 2 minutos
  }

  function expandFooter() {
    // No expandir si hay un modal abierto
    if (document.body.classList.contains("modal-open")) {
      return;
    }

    if (isExpanded || footerAnimationInProgress) return;

    isExpanded = true;
    footer.classList.add("expanded");
    animateHeight(footer.offsetHeight, getExpandedHeight(), 350);

    startFooterAutoCloseTimer();
  }

  function collapseFooter() {
    if (document.body.classList.contains("modal-open")) return;
    if (!isExpanded || footerAnimationInProgress) return;

    if (footerAutoCloseTimer) {
      clearTimeout(footerAutoCloseTimer);
      footerAutoCloseTimer = null;
    }

    isExpanded = false;
    animateHeight(footer.offsetHeight, footerTop.offsetHeight, 350, () => {
      footer.classList.remove("expanded");
    });
  }

  // Scroll desktop con throttle
  window.addEventListener("scroll", () => {
    if (document.body.classList.contains("modal-open")) return;

    // Throttle para mejorar rendimiento
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (!isMobile) {
        if (scrollTop > 20 && !document.body.classList.contains("modal-open")) {
          expandFooter();
        } else if (
          scrollTop < 20 &&
          !document.body.classList.contains("modal-open")
        ) {
          collapseFooter();
        }
      }

      scrollTimeout = null;
    }, 50);
  });

  // Hover desktop
  if (!isMobile) {
    footer.addEventListener("mouseenter", () => {
      if (document.body.classList.contains("modal-open")) return;
      expandFooter();
    });

    footer.addEventListener("mouseleave", () => {
      if (document.body.classList.contains("modal-open")) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop < 20) {
        collapseFooter();
      }
    });
  }

  // Toque móvil: expandir/contraer con tap
  if (isMobile) {
    footer.addEventListener("click", (e) => {
      if (
        document.body.classList.contains("modal-open") ||
        isClosingModal ||
        e.target.closest(".modal-settings, .modal-terminos")
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (isExpanded) collapseFooter();
      else expandFooter();
    });
  }

  document.addEventListener(
    "click",
    (e) => {
      // Si el clic es en un botón con data-close-modal o close-btn
      if (
        e.target.closest("[data-close-modal]") ||
        e.target.closest(".close-btn")
      ) {
        // Marcar que estamos procesando un cierre
        isClosingModal = true;
      }
    },
    true,
  ); // Usar captura para asegurar que se ejecuta primero

  // Inicializamos altura
  resetFooter(true);

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

  // ============================================
  // BOTONES DE BORRADO PARA DAMAS
  // ============================================

  // Función específica para borrar datos de Damas
  function borrarDatosDamas(modo, nombreJuego) {
    abrirModalConfirmacion(
      `¿Seguro que quieres borrar todos los datos de Damas - ${nombreJuego}?`,
      () => {
        // Claves específicas de Damas
        const clavesDamas = ["damas_jugadores", "damas_estadisticas"];

        clavesDamas.forEach((clave) => {
          if (localStorage.getItem(clave) !== null) {
            localStorage.removeItem(clave);
          }
        });

        mostrarToastIdioma(`Datos de Damas (${nombreJuego}) borrados`);
      },
    );
  }

  // Botón para borrar datos del modo Normal
  const btnDamasNormal = document.getElementById("btn-delete-damas-normal");
  if (btnDamasNormal) {
    btnDamasNormal.addEventListener("click", function () {
      borrarDatosDamas("normal", "Modo Normal");
    });
  }

  // Botón para borrar datos del modo Difícil
  const btnDamasDificil = document.getElementById("btn-delete-damas-dificil");
  if (btnDamasDificil) {
    btnDamasDificil.addEventListener("click", function () {
      borrarDatosDamas("dificil", "Modo Difícil");
    });
  }

  // Botón para borrar todos los datos de Damas
  const btnDamasAll = document.getElementById("btn-delete-damas-all");
  if (btnDamasAll) {
    btnDamasAll.addEventListener("click", function () {
      abrirModalConfirmacion(
        "¿Seguro que quieres borrar TODOS los datos de Damas (todos los modos)?",
        () => {
          const clavesDamas = ["damas_jugadores", "damas_estadisticas"];

          clavesDamas.forEach((clave) => {
            if (localStorage.getItem(clave) !== null) {
              localStorage.removeItem(clave);
            }
          });

          mostrarToastIdioma("Todos los datos de Damas han sido borrados");
        },
      );
    });
  }

  // BOTÓN DE BORRAR TODOS LOS JUEGOS
  const btnDeleteAllGames = document.getElementById("btn-delete-all-games");
  if (btnDeleteAllGames) {
    btnDeleteAllGames.addEventListener("click", function () {
      const todosLosRankings = [
        "ranking_memori",
        "ranking_desafio",
        "rankingAhorcado",
        "damas_jugadores",
        "damas_estadisticas",
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
    btnConfirmAccept.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof confirmAction === "function") {
        confirmAction();
      }
      cerrarModalConfirmacion();
    });
  }

  if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener("click", (e) => {
      e.stopPropagation();
      cerrarModalConfirmacion();
    });
  }

  // Añade esto dentro del DOMContentLoaded
  const closeTermsBtn = document.querySelector("#modal-terms .close-btn");
  if (closeTermsBtn) {
    closeTermsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarModalSettings();
    });
  }

  // También para el botón "Cerrar" específico si tiene otra clase
  const cerrarModalTermsBtn = document.querySelector(
    "#modal-terms .cerrar-modal",
  );
  if (cerrarModalTermsBtn) {
    cerrarModalTermsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarModalSettings();
    });
  }

  function configurarBotonesCierre() {
    // Botones con data-close-modal (los del modal principal)
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      // Remover listeners anteriores para evitar duplicados
      btn.removeEventListener("click", handleCloseModal);
      btn.addEventListener("click", handleCloseModal);
    });

    // Botones específicos de cierre de modales de settings
    document.querySelectorAll(".modal-settings .close-btn").forEach((btn) => {
      btn.removeEventListener("click", handleCloseModal);
      btn.addEventListener("click", handleCloseModal);
    });
  }

  function handleCloseModal(e) {
    e.preventDefault();
    e.stopPropagation();

    // Verificar si estamos dentro de un modal de confirmación
    const isInConfirmModal = e.target.closest("#modal-confirm-delete");

    if (isInConfirmModal) {
      // Si es el modal de confirmación, cerrar solo ese modal
      cerrarModalConfirmacion();
    } else {
      // Si es otro modal, cerrar todos
      cerrarModalSettings();
    }
  }

  // Llamar a la función después de configurar todo
  configurarBotonesCierre();
});
