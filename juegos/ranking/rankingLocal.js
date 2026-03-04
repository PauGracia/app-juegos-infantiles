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

// Funcion de prueba para ver como queda ranking
function seedRankingAhorcado() {
  if (localStorage.getItem("rankingAhorcado")) return; // No sobrescribir

  const datosPrueba = [
    {
      usuario: "Lucía",
      puntos: 120,
      fecha: "2025-01-12T18:45:00",
      idioma: "es",
    },
    {
      usuario: "Alex",
      puntos: 95,
      fecha: "2025-01-10T17:20:00",
      idioma: "en",
    },
    {
      usuario: "Martí",
      puntos: 140,
      fecha: "2025-01-15T16:05:00",
      idioma: "ca",
    },
    {
      usuario: "Émilie",
      puntos: 110,
      fecha: "2025-01-11T19:30:00",
      idioma: "fr",
    },
    {
      usuario: "Giulia",
      puntos: 85,
      fecha: "2025-01-09T15:10:00",
      idioma: "it",
    },
    {
      usuario: "João",
      puntos: 100,
      fecha: "2025-01-14T20:00:00",
      idioma: "pt",
    },
    {
      usuario: "Pepin",
      puntos: 33,
      fecha: "2025-01-14T20:33:00",
      idioma: "es",
    },
    {
      usuario: "AntonioPolo",
      puntos: 75,
      fecha: "2025-01-14T12:00:00",
      idioma: "ca",
    },
  ];

  localStorage.setItem("rankingAhorcado", JSON.stringify(datosPrueba));
}

function initRanking() {
  const lista = document.getElementById("listaRanking");

  if (rankingInicializado) return;

  if (!lista) {
    // Si no existe la lista, esperar un momento y reintentar
    setTimeout(initRanking, 100);
    return;
  }

  rankingInicializado = true;

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
      li.innerHTML = `<div class="no-results">${
        window.translations?.["ranking.noResults"] || "No hay resultados"
      }</div>`;
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
    // AÑADIR: elemento invisible al final para dar espacio
    const spacer = document.createElement("li");
    spacer.style.height = "20px";
    spacer.style.background = "transparent";
    spacer.style.boxShadow = "none";
    spacer.style.pointerEvents = "none";
    lista.appendChild(spacer);
  }

  // Eventos
  ordenSelect.addEventListener("change", renderRanking);
  filtroInput.addEventListener("input", renderRanking);

  // Botón Limpiar filtro
  const btnLimpiar = document.getElementById("btnLimpiarFiltro");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      filtroInput.value = "";
      renderRanking();
    });
  }

  // Botón Volver al juego
  const btnVolver = document.getElementById("btnVolverJuego");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      location.href = "../juegoAhorcado/index.html";
    });
  }

  // Cargar ranking y actualizar traducciones
  window.ranking_refrescarUI = function () {
    actualizarPlaceholders();
    actualizarEtiquetasSelect();
    renderRanking();
  };

  //seedRankingAhorcado(); // LLamar funcuon de prueba del ranking
  cargarRanking();
}

// Inicializar cuando cambie el idioma
document.addEventListener("languageChanged", () => {
  if (typeof window.ranking_refrescarUI === "function") {
    window.ranking_refrescarUI();
  }
});

// Inicializar cuando se cargue la página
document.addEventListener("DOMContentLoaded", initRanking);

// También inicializar si el DOM ya está listo
if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  setTimeout(initRanking, 100);
}
