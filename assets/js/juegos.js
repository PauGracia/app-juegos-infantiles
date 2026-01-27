const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");

settingsBtn.addEventListener("click", () => {
  settingsMenu.style.display =
    settingsMenu.style.display === "block" ? "none" : "block";
});

document
  .getElementById("btn-settings-language")
  .addEventListener("click", () => {
    settingsMenu.style.display = "none";
    document.getElementById("modal-language").style.display = "flex";
  });

document
  .getElementById("btn-settings-objective")
  .addEventListener("click", () => {
    settingsMenu.style.display = "none";
    document.getElementById("modal-objective").style.display = "flex";
  });

function cerrarModalSettings() {
  document.querySelectorAll(".modal-settings").forEach((m) => {
    m.style.display = "none";
  });
}
// Control del footer expandible - MEJORADO PARA MÓVIL
document.addEventListener("DOMContentLoaded", function () {
  const footer = document.querySelector("footer");
  const bodyIndex = document.getElementById("body-index");
  let isExpanded = false;
  let lastScrollTop = 0;
  let isMobile = window.innerWidth <= 768;

  // Función para calcular la altura del footer
  function updateBodyPadding() {
    if (!footer) return;

    const footerHeight = footer.offsetHeight;
    // En móvil, cuando está expandido, usar altura dinámica
    const paddingValue =
      isExpanded && isMobile ? "10px" : `${footer.offsetHeight}px`;
    bodyIndex.style.paddingBottom = paddingValue;
  }

  // Inicializar padding
  updateBodyPadding();

  // Detectar si es móvil
  window.addEventListener("resize", function () {
    isMobile = window.innerWidth <= 768;
    updateBodyPadding();
  });

  // Solo expandir con scroll hacia abajo
  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Umbral más pequeño para móvil
    const scrollThreshold = isMobile ? 30 : 50;

    // Expandir cuando se hace scroll hacia abajo
    if (scrollTop > scrollThreshold && scrollTop > lastScrollTop) {
      if (!isExpanded) {
        isExpanded = true;
        footer.classList.add("expanded");
        // Pequeño delay para que la animación de altura termine
        setTimeout(updateBodyPadding, 100);
      }
    }
    // Contraer cuando se vuelve al top (umbral más pequeño para móvil)
    else if (scrollTop < 20) {
      if (isExpanded) {
        isExpanded = false;
        footer.classList.remove("expanded");
        setTimeout(updateBodyPadding, 100);
      }
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });

  // También expandir al hacer hover en desktop
  if (window.matchMedia("(hover: hover)").matches) {
    footer.addEventListener("mouseenter", function () {
      if (!isExpanded) {
        isExpanded = true;
        footer.classList.add("expanded");
        setTimeout(updateBodyPadding, 100);
      }
    });

    footer.addEventListener("mouseleave", function () {
      // Solo contraer si no se ha hecho scroll
      if (isExpanded && window.pageYOffset < 50) {
        isExpanded = false;
        footer.classList.remove("expanded");
        setTimeout(updateBodyPadding, 100);
      }
    });
  }

  // En móvil, también permitir tocar para expandir
  if (isMobile || window.matchMedia("(hover: none)").matches) {
    let touchStartY = 0;
    let touchEndY = 0;

    footer.addEventListener(
      "touchstart",
      function (e) {
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true },
    );

    footer.addEventListener(
      "touchend",
      function (e) {
        touchEndY = e.changedTouches[0].screenY;
        const touchDiff = touchStartY - touchEndY;

        // Deslizar hacia arriba en el footer = expandir
        if (touchDiff > 30 && !isExpanded) {
          isExpanded = true;
          footer.classList.add("expanded");
          setTimeout(updateBodyPadding, 100);
        }
        // Deslizar hacia abajo en el footer = contraer
        else if (touchDiff < -30 && isExpanded) {
          isExpanded = false;
          footer.classList.remove("expanded");
          setTimeout(updateBodyPadding, 100);
        }
      },
      { passive: true },
    );
  }

  // Forzar que el footer esté en su posición correcta al cargar
  window.requestAnimationFrame(function () {
    footer.style.transform = "translateY(0)";
    updateBodyPadding();
  });
});
