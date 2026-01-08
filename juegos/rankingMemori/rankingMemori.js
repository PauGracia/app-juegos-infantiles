// ------------------ RANKING ------------------

document.addEventListener("DOMContentLoaded", () => {
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

    // Función para mostrar una página específica del ranking
    function mostrarPagina() {
      // Calcular el número total de páginas
      const totalPaginas = Math.max(1, Math.ceil(ranking.length / porPagina));
      // Asegurar que la página actual esté dentro de los límites válidos
      paginaActual = Math.min(Math.max(1, paginaActual), totalPaginas);

      // Manejar caso cuando no hay datos
      if (ranking.length === 0) {
        listaDiv.innerHTML = "<p>No hay puntuaciones aún.</p>";
        paginaSpan.textContent = "Página 0 de 0";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      // Calcular índices para los datos de la página actual
      const inicio = (paginaActual - 1) * porPagina;
      const fin = inicio + porPagina;
      const paginaDatos = ranking.slice(inicio, fin); // Obtener datos de la página

      // Generar HTML para la lista de ranking
      let html = `<ol start="${inicio + 1}">`; // Iniciar numeración desde el índice correcto
      paginaDatos.forEach(
        (r) =>
          (html += `<li>
                    <span class="nombre">${escapeHtml(r.nombre)}</span>
                    <span class="relleno"></span>  <!-- Espacio flexible entre nombre y puntos -->
                    <span class="puntos">${r.puntuacion}</span>
                  </li>`)
      );
      html += "</ol>";
      listaDiv.innerHTML = html;

      // Actualizar información de paginación
      paginaSpan.textContent = `Página ${paginaActual} de ${totalPaginas}`;
      // Deshabilitar botones cuando sea necesario
      prevBtn.disabled = paginaActual === 1;
      nextBtn.disabled = paginaActual === totalPaginas;
    }

    // Función asíncrona para cargar el ranking desde el servidor
    function cargarRanking() {
      ranking = JSON.parse(localStorage.getItem("ranking_memori")) || [];

      // Ordenar por si acaso (seguridad)
      ranking.sort((a, b) => b.puntuacion - a.puntuacion);

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

    // Cargar el ranking al iniciar la página
    cargarRanking();
  }

  // Iniciar el sistema de ranking solo si existe el elemento lista (página correcta)
  if (document.getElementById("lista")) {
    iniciarRanking();
  }
});
