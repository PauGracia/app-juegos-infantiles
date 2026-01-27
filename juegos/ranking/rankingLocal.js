let rankingInicializado = false;

// Función para actualizar placeholders
function actualizarPlaceholders() {
  const filtroInput = document.getElementById("filtroUsuario");
  if (
    filtroInput &&
    window.translations &&
    window.translations["ranking.filterUser"]
  ) {
    filtroInput.placeholder = window.translations["ranking.filterUser"];
  }
}

// Función para actualizar etiquetas de select
function actualizarEtiquetasSelect() {
  const ordenSelect = document.getElementById("ordenRanking");
  if (!ordenSelect || !window.translations) return;

  const options = ordenSelect.querySelectorAll("option");
  options.forEach((option) => {
    const value = option.value;
    const translationKey = `ranking.sort.${value}`;
    if (window.translations[translationKey]) {
      option.textContent = window.translations[translationKey];
    }
  });

  // Forzar redibujado en móviles
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const temp = ordenSelect.style.display;
    ordenSelect.style.display = "none";
    setTimeout(() => {
      ordenSelect.style.display = temp;
    }, 50);
  }
}

// Función para obtener nombre del idioma
function obtenerNombreIdioma(codigo) {
  // Intentar obtener traducción
  if (window.translations && window.translations[`language.${codigo}`]) {
    return window.translations[`language.${codigo}`];
  }
  // Si no hay traducción, mostrar código en mayúsculas
  return codigo.toUpperCase();
}

function initRanking() {
  const lista = document.getElementById("listaRanking");

  if (rankingInicializado) return;
  rankingInicializado = true;
  if (!lista) return;

  const ordenSelect = document.getElementById("ordenRanking");
  const filtroInput = document.getElementById("filtroUsuario");

  let ranking = [];

  function cargarRanking() {
    ranking = JSON.parse(localStorage.getItem("rankingAhorcado") || "[]");
    renderRanking();
  }

  function renderRanking() {
    const filtro = filtroInput.value.toLowerCase();
    let datos = [...ranking];

    // Filtro por usuario
    if (filtro) {
      datos = datos.filter((r) => r.usuario.toLowerCase().includes(filtro));
    }

    // Orden
    const orden = ordenSelect.value;
    if (orden === "puntos") {
      datos.sort((a, b) => b.puntos - a.puntos);
    } else if (orden === "fecha") {
      datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } else if (orden === "usuario") {
      datos.sort((a, b) => a.usuario.localeCompare(b.usuario));
    } else if (orden === "idioma") {
      // Ordenar por idioma (nombre del idioma en el idioma actual)
      datos.sort((a, b) => {
        const idiomaA = obtenerNombreIdioma(a.idioma || "es");
        const idiomaB = obtenerNombreIdioma(b.idioma || "es");
        return idiomaA.localeCompare(idiomaB);
      });
    }

    lista.innerHTML = "";

    if (datos.length === 0) {
      const li = document.createElement("li");
      li.innerHTML = `<div class="no-results">${translations["ranking.noResults"] || "No hay resultados"}</div>`;
      lista.appendChild(li);
      return;
    }

    datos.forEach((r, i) => {
      const li = document.createElement("li");

      // Obtener idioma (por defecto "es")
      const idioma = r.idioma || "es";
      // Mostrar nombre del idioma
      const idiomaTexto = obtenerNombreIdioma(idioma);

      li.innerHTML = `
        <div class="ranking-left">
          <div class="ranking-pos">${i + 1}</div>
          <div class="ranking-info">
            <div class="ranking-usuario">
              ${r.usuario} <span class="ranking-idioma">- ${idiomaTexto}</span>
            </div>
            <div class="ranking-fecha">
              ${new Date(r.fecha).toLocaleString("es-ES")}
            </div>
          </div>
        </div>
        <div class="ranking-right">
          <div class="ranking-puntos">
            ${r.puntos} <span class="ranking-puntos-text">pts</span>
          </div>
        </div>
      `;
      lista.appendChild(li);
    });
  }

  // Eventos
  ordenSelect.addEventListener("change", renderRanking);
  filtroInput.addEventListener("input", renderRanking);

  // Botón Limpiar filtro
  document.getElementById("btnLimpiarFiltro").addEventListener("click", () => {
    filtroInput.value = "";
    renderRanking();
  });

  // Botón Volver al juego
  document.getElementById("btnVolverJuego").addEventListener("click", () => {
    location.href = "../juegoAhorcado/index.html";
  });

  // Modal para borrar ranking
  const modal = document.getElementById("modalConfirm");
  const modalOk = document.getElementById("modalOk");
  const modalCancel = document.getElementById("modalCancel");

  document.getElementById("btnBorrarRanking").addEventListener("click", () => {
    modal.style.display = "flex";

    const aceptar = () => {
      localStorage.removeItem("rankingAhorcado");
      cargarRanking();
      cerrarModal();
    };

    const cerrarModal = () => {
      modal.style.display = "none";
      modalOk.removeEventListener("click", aceptar);
      modalCancel.removeEventListener("click", cerrarModal);
    };

    modalOk.addEventListener("click", aceptar);
    modalCancel.addEventListener("click", cerrarModal);
  });

  cargarRanking();

  // Actualizar placeholders y etiquetas cuando haya traducciones
  if (window.translations) {
    actualizarPlaceholders();
    actualizarEtiquetasSelect();
  } else {
    setTimeout(() => {
      if (window.translations) {
        actualizarPlaceholders();
        actualizarEtiquetasSelect();
      }
    }, 300);
  }
}

// Inicializar cuando cambie el idioma
document.addEventListener("languageChanged", () => {
  initRanking();
  actualizarPlaceholders();
  actualizarEtiquetasSelect();
});

// Inicializar cuando se cargue la página
document.addEventListener("DOMContentLoaded", () => {
  initRanking();

  // Actualizar placeholders después de un tiempo
  setTimeout(() => {
    if (window.translations) {
      actualizarPlaceholders();
      actualizarEtiquetasSelect();
    } else {
      setTimeout(() => {
        if (window.translations) {
          actualizarPlaceholders();
          actualizarEtiquetasSelect();
        }
      }, 500);
    }
  }, 200);
});
