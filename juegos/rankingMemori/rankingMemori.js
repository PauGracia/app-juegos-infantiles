// ------------------ RANKING ------------------

document.addEventListener("DOMContentLoaded", () => {
  // Cargar el idioma inicial
  if (typeof initLanguage === "function") {
    initLanguage();
  }

  // Escuchar cambios de idioma
  document.addEventListener("languageChanged", () => {
    // Actualizar la interfaz cuando cambie el idioma
    aplicarTraduccionesRanking();
  });

  function aplicarTraduccionesRanking() {
    // Aplicar traducciones a elementos específicos del ranking
    if (window.translations) {
      // Actualizar texto de botones de paginación
      const prevBtn = document.getElementById("prev");
      const nextBtn = document.getElementById("next");
      const atrasBtn = document.getElementById("atras");

      if (prevBtn && window.translations["common.previous"]) {
        prevBtn.textContent = window.translations["common.previous"];
      }
      if (nextBtn && window.translations["common.next"]) {
        nextBtn.textContent = window.translations["common.next"];
      }
      if (atrasBtn && window.translations["common.back"]) {
        atrasBtn.textContent = window.translations["common.back"];
      }
    }
  }

  function iniciarRanking() {
    // Obtener referencias a elementos del DOM del ranking
    const listaDiv = document.getElementById("lista");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const paginaSpan = document.getElementById("pagina");
    const atrasBtn = document.getElementById("atras");

    // Validar que todos los elementos necesarios existen
    if (!listaDiv || !prevBtn || !nextBtn || !paginaSpan || !atrasBtn) return;

    // Variables para gestionar el ranking y paginación
    let ranking = []; // Array para almacenar todas las puntuaciones
    let paginaActual = 1; // Página actual que se está mostrando
    let tipoRanking = "normal"; // "normal" | "desafio"

    const porPagina = 25; // Número de elementos por página

    // Función para prevenir ataques XSS escapando caracteres HTML
    function escapeHtml(str) {
      return str.replace(
        /[&<>"']/g,
        (m) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[m])
      );
    }

    // Función para obtener texto traducido
    function t(key, fallback = key) {
      return window.translations && window.translations[key]
        ? window.translations[key]
        : fallback;
    }

    // Función para mostrar una página específica del ranking
    function mostrarPagina() {
      // Calcular el número total de páginas
      const totalPaginas = Math.max(1, Math.ceil(ranking.length / porPagina));
      // Asegurar que la página actual esté dentro de los límites válidos
      paginaActual = Math.min(Math.max(1, paginaActual), totalPaginas);

      // Manejar caso cuando no hay datos
      if (ranking.length === 0) {
        listaDiv.innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-state-icon">🏆</div>
        <div class="empty-state-title">${t(
          "ranking.noScores",
          "No hay puntuaciones aún"
        )}</div>
        <div class="empty-state-subtitle">Sé el primero en jugar y aparecer aquí</div>
      </div>
    `;
        paginaSpan.textContent = `${t("ranking.page", "Página")} 0 ${t(
          "ranking.of",
          "de"
        )} 0`;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      // Calcular índices para los datos de la página actual
      const inicio = (paginaActual - 1) * porPagina;
      const fin = inicio + porPagina;
      const paginaDatos = ranking.slice(inicio, fin);

      // Generar HTML para la lista de ranking
      let html = `<ol>`;
      paginaDatos.forEach((r, index) => {
        const esNormal = tipoRanking === "normal";
        const puntosTexto = esNormal
          ? `${r.puntuacion} ${t("ranking.points", "pts")}`
          : `${t("ranking.level", "Nivel")} ${r.nivel}`;

        const badgeClass = esNormal ? "badge-normal" : "badge-desafio";
        const puntosClass = esNormal ? "normal" : "desafio";

        html += `
      <li class="fade-in">
        <div class="ranking-item-content">
          <div class="nombre-container">
            <span class="nombre">${escapeHtml(r.nombre)}</span>
            <span class="ranking-badge ${badgeClass}">
              ${t(
                esNormal ? "ranking.normal" : "ranking.challenge",
                esNormal ? "Normal" : "Desafío"
              )}
            </span>
          </div>
          <div class="puntos-container">
            <span class="puntos-label">${
              esNormal
                ? t("ranking.points", "Puntos")
                : t("ranking.level", "Nivel")
            }</span>
            <span class="puntos ${puntosClass}">${puntosTexto}</span>
          </div>
        </div>
      </li>
    `;
      });

      html += "</ol>";
      listaDiv.innerHTML = html;
      listaDiv.classList.remove("loading");

      // Actualizar información de paginación
      paginaSpan.textContent = `${t(
        "ranking.page",
        "Página"
      )} ${paginaActual} ${t("ranking.of", "de")} ${totalPaginas}`;
      prevBtn.disabled = paginaActual === 1;
      nextBtn.disabled = paginaActual === totalPaginas;
    }

    // Función asíncrona para cargar el ranking desde el servidor
    function cargarRanking() {
      const clave =
        tipoRanking === "normal" ? "ranking_memori" : "ranking_desafio";

      ranking = JSON.parse(localStorage.getItem(clave)) || [];

      ranking.sort((a, b) =>
        tipoRanking === "normal"
          ? b.puntuacion - a.puntuacion
          : b.nivel - a.nivel
      );

      paginaActual = 1;
      mostrarPagina();
    }

    // Eventos para navegación entre páginas
    prevBtn.addEventListener("click", () => {
      if (paginaActual > 1) {
        paginaActual--;
        mostrarPagina(); // Mostrar página anterior
      }
    });

    nextBtn.addEventListener("click", () => {
      if (paginaActual < Math.ceil(ranking.length / porPagina)) {
        paginaActual++;
        mostrarPagina(); // Mostrar página siguiente
      }
    });

    // Evento para volver al juego de memori
    atrasBtn.addEventListener(
      "click",
      () => (location.href = "../memori/index.html")
    );

    document.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".tab")
          .forEach((b) => b.classList.remove("activa"));

        btn.classList.add("activa");
        tipoRanking = btn.dataset.tipo;
        cargarRanking();
      });
    });

    // Aplicar traducciones iniciales
    aplicarTraduccionesRanking();

    // Cargar el ranking inicial
    cargarRanking();
  }

  // Iniciar el sistema de ranking solo si existe el elemento lista (página correcta)
  if (document.getElementById("lista")) {
    iniciarRanking();
  }
});
