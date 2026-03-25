let confirmAction = null;
let modalAnterior = null;
let isExpanded = false;
let animationFrame;
let footerAnimationInProgress = false;
let isClosingModal = false;
let footerAutoCloseTimer = null;
let footer, footerTop, footerBottom; // Variables globales para el footer

// ================================
// GESTIÓN DEL SPLASH SCREEN
// ================================
document.addEventListener("DOMContentLoaded", function () {
  const splashScreen = document.getElementById("splash-screen-index");

  function hideSplashScreen() {
    if (splashScreen) {
      splashScreen.classList.add("hidden");
      document.body.classList.add("visible");

      setTimeout(() => {
        if (splashScreen && splashScreen.parentNode) {
          splashScreen.parentNode.removeChild(splashScreen);
        }
      }, 400);
    }
  }

  window.addEventListener("load", function () {
    setTimeout(hideSplashScreen, 300);
  });
});

function resetFooter(force = false) {
  const splash = document.getElementById("splash-screen-index");
  if (splash && !splash.classList.contains("hidden")) {
    splash.classList.add("hidden");
  }

  if (!footer) footer = document.querySelector("footer");
  if (!footer) return;

  if (!footerTop) footerTop = footer.querySelector(".footer-top");
  if (!footerTop) return;

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  footer.classList.remove("expanded");
  footer.style.height = `${footerTop.offsetHeight}px`;
  isExpanded = false;
  footerAnimationInProgress = false;
}

// Funciones de footer movidas al ámbito global
function getExpandedHeight() {
  return footerTop.offsetHeight + footerBottom.scrollHeight;
}

function animateHeight(from, to, duration = 350, callback) {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  footerAnimationInProgress = true;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const newHeight = from + (to - from) * progress;
    if (footer) footer.style.height = `${newHeight}px`;

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
  }, 60000);
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
  // No colapsar si hay un modal abierto (pero no debería estar expandido)
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

// Abrir/cerrar menú de configuración
document.getElementById("settings-btn").addEventListener("click", function (e) {
  e.stopPropagation();
  const menu = document.getElementById("settings-menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

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

  modalAnterior = document.querySelector(".modal-settings[style*='flex']");

  messageEl.textContent = mensaje;
  confirmAction = accion;

  abrirModalSettings("modal-confirm-delete");
}

function cerrarModalConfirmacion() {
  confirmAction = null;
  document.getElementById("modal-confirm-delete").style.display = "none";

  if (modalAnterior) {
    modalAnterior.style.display = "flex";
  } else {
    document.body.classList.remove("modal-open");
  }

  modalAnterior = null;
}

function abrirModalSettings(modalId) {
  // Cerrar el menú de settings si está abierto
  const settingsMenu = document.getElementById("settings-menu");
  if (settingsMenu) settingsMenu.style.display = "none";

  document.body.classList.add("modal-open");

  // IMPORTANTE: Colapsar el footer cuando se abre cualquier modal
  if (isExpanded && !footerAnimationInProgress && collapseFooter) {
    collapseFooter();
  }

  // Ocultar todos los modales
  document
    .querySelectorAll(".modal-settings, .modal-terminos")
    .forEach((modal) => {
      modal.style.display = "none";
    });

  const modalToOpen = document.getElementById(modalId);
  if (modalToOpen) {
    modalToOpen.style.display = "flex";
    // Asegurar que el modal tenga un z-index alto
    modalToOpen.style.zIndex = "20000";
  }
}

// Cerrar modales al hacer clic fuera
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
  document
    .querySelectorAll(".modal-settings, .modal-terminos")
    .forEach((modal) => {
      modal.style.display = "none";
    });
  document.body.classList.remove("modal-open");

  forceResetFooter();

  setTimeout(() => {
    isClosingModal = false;
  }, 300);
}

function forceResetFooter() {
  if (!footer) footer = document.querySelector("footer");
  if (!footer) return;

  if (!footerTop) footerTop = footer.querySelector(".footer-top");
  if (!footerTop) return;

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  footer.classList.remove("expanded");
  footer.style.height = `${footerTop.offsetHeight}px`;
  footer.style.transition = "none";
  footer.style.pointerEvents = "auto";

  isExpanded = false;
  footerAnimationInProgress = false;

  setTimeout(() => {
    if (footer) footer.style.transition = "";
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
  if (!e.detail.manual) return;

  const lang = e.detail.lang;
  const langName = translations[`language.${lang}`] || lang.toUpperCase();
  const template =
    translations["language.selected"] || "Language selected: {lang}";

  mostrarToastIdioma(template.replace("{lang}", langName));
});

document.addEventListener("DOMContentLoaded", function () {
  // Inicializar variables del footer
  footer = document.querySelector("footer");
  if (footer) {
    footerTop = footer.querySelector(".footer-top");
    footerBottom = footer.querySelector(".footer-bottom");
  }

  const btnLanguage = document.getElementById("btn-settings-language");
  if (btnLanguage) {
    btnLanguage.addEventListener("click", function () {
      abrirModalSettings("modal-language");
    });
  }

  document.querySelectorAll(".modal-settings").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        cerrarModalSettings();
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      cerrarModalSettings();
      document.getElementById("settings-menu").style.display = "none";
    }
  });
});

const footerAttributions = document.getElementById("footer-attributions");
if (footerAttributions) {
  footerAttributions.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalSettings("modal-attributions");
  });
}

const footerTerms = document.getElementById("footer-terms");
if (footerTerms) {
  footerTerms.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalSettings("modal-terms");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();

  // Re-inicializar variables del footer si no se hicieron antes
  if (!footer) footer = document.querySelector("footer");
  if (!footerTop) footerTop = footer?.querySelector(".footer-top");
  if (!footerBottom) footerBottom = footer?.querySelector(".footer-bottom");

  if (!footer) return;

  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  let scrollTimeout;

  // Configurar eventos del footer
  window.addEventListener("scroll", () => {
    if (document.body.classList.contains("modal-open")) return;

    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (!isTouch) {
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

  if (!isTouch) {
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

  if (isTouch) {
    footer.addEventListener("pointerdown", (e) => {
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
      if (
        e.target.closest("[data-close-modal]") ||
        e.target.closest(".close-btn")
      ) {
        isClosingModal = true;
      }
    },
    true,
  );

  resetFooter(true);

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      loadLanguage(lang, true);
    });
  });

  document.addEventListener("pointerdown", (e) => {
    if (footer && !footer.contains(e.target) && isExpanded) {
      collapseFooter();
    }
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

  const btnHistory = document.getElementById("btn-settings-history");
  if (btnHistory) {
    btnHistory.addEventListener("click", function () {
      abrirModalSettings("modal-history");
    });
  }

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

  function borrarDatosDamas(modo, nombreJuego) {
    abrirModalConfirmacion(
      `¿Seguro que quieres borrar todos los datos de Damas - ${nombreJuego}?`,
      () => {
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

  const btnDamasNormal = document.getElementById("btn-delete-damas-normal");
  if (btnDamasNormal) {
    btnDamasNormal.addEventListener("click", function () {
      borrarDatosDamas("normal", "Modo Normal");
    });
  }

  const btnDamasDificil = document.getElementById("btn-delete-damas-dificil");
  if (btnDamasDificil) {
    btnDamasDificil.addEventListener("click", function () {
      borrarDatosDamas("dificil", "Modo Difícil");
    });
  }

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

  const closeTermsBtn = document.querySelector("#modal-terms .close-btn");
  if (closeTermsBtn) {
    closeTermsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarModalSettings();
    });
  }

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
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.removeEventListener("click", handleCloseModal);
      btn.addEventListener("click", handleCloseModal);
    });

    document.querySelectorAll(".modal-settings .close-btn").forEach((btn) => {
      btn.removeEventListener("click", handleCloseModal);
      btn.addEventListener("click", handleCloseModal);
    });
  }

  function handleCloseModal(e) {
    e.preventDefault();
    e.stopPropagation();
    const isInConfirmModal = e.target.closest("#modal-confirm-delete");

    if (isInConfirmModal) {
      cerrarModalConfirmacion();
    } else {
      cerrarModalSettings();
    }
  }

  configurarBotonesCierre();
});
