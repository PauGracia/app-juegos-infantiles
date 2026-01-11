function initRanking() {
  const lista = document.getElementById("listaRanking");
  if (!lista) return; // no estamos en rankingLocal.html

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
      datos.sort((a, b) => b.fecha - a.fecha);
    } else if (orden === "usuario") {
      datos.sort((a, b) => a.usuario.localeCompare(b.usuario));
    }

    lista.innerHTML = "";

    if (datos.length === 0) {
      lista.innerHTML = "<li>No hay resultados</li>";
      return;
    }

    datos.forEach((r, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
          <div class="ranking-pos">${i + 1}</div>
          <div>
            <div class="ranking-usuario">${r.usuario}</div>
            <div class="ranking-fecha">
              ${new Date(r.fecha).toLocaleString("es-ES")}
            </div>

          </div>
          <div class="ranking-puntos">${r.puntos} pts</div>
        `;
      lista.appendChild(li);
    });
  }

  // Eventos
  ordenSelect.addEventListener("change", renderRanking);
  filtroInput.addEventListener("input", renderRanking);

  document.getElementById("btnLimpiarFiltro").addEventListener("click", () => {
    filtroInput.value = "";
    renderRanking();
  });

  document.getElementById("btnBorrarRanking").addEventListener("click", () => {
    mostrarModalInfo(
      "Confirmación",
      "¿Seguro que quieres borrar todo el ranking?"
    );

    localStorage.removeItem("rankingAhorcado");
    cargarRanking();
  });

  document
    .getElementById("btnVolverJuego")
    .addEventListener(
      "click",
      () => (location.href = "../juegoAhorcado/index.html")
    );

  cargarRanking();
}

// Ejecutamos al cargar el DOM
window.addEventListener("DOMContentLoaded", initRanking);
