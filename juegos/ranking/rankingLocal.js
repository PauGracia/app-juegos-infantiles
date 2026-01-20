let rankingInicializado = false;
function initRanking() {
  const lista = document.getElementById("listaRanking");

  if (rankingInicializado) return;
  rankingInicializado = true;
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
      const li = document.createElement("li");
      li.innerHTML = `<div class="no-results">${translations["ranking.noResults"]}</div>`;
      lista.appendChild(li);
      return;
    }

    datos.forEach((r, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
            <div class="ranking-left">
                <div class="ranking-pos">${i + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-usuario">${r.usuario}</div>
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

  document
    .getElementById("btnVolverJuego")
    .addEventListener(
      "click",
      () => (location.href = "../juegoAhorcado/index.html"),
    );

  // Seleccionar elementos del modal
  const modal = document.getElementById("modalConfirm");
  const modalOk = document.getElementById("modalOk");
  const modalCancel = document.getElementById("modalCancel");
  const modalMessage = document.getElementById("modalMessage");

  document.getElementById("btnBorrarRanking").addEventListener("click", () => {
    // Actualizar texto del mensaje desde translations
    const modalMessage = document.getElementById("modalMessage");
    modalMessage.textContent =
      translations["ranking.clearConfirm"] ||
      "¿Seguro que quieres borrar todo el ranking?";

    const modal = document.getElementById("modalConfirm");
    const modalOk = document.getElementById("modalOk");
    const modalCancel = document.getElementById("modalCancel");

    modal.style.display = "flex";

    // Función aceptar
    const aceptar = () => {
      localStorage.removeItem("rankingAhorcado");
      cargarRanking();
      cerrarModal();
    };

    // Función cerrar
    const cerrarModal = () => {
      modal.style.display = "none";
      modalOk.removeEventListener("click", aceptar);
      modalCancel.removeEventListener("click", cerrarModal);
    };

    modalOk.addEventListener("click", aceptar);
    modalCancel.addEventListener("click", cerrarModal);
  });

  document
    .getElementById("btnVolverJuego")
    .addEventListener(
      "click",
      () => (location.href = "../juegoAhorcado/index.html"),
    );

  cargarRanking();
}

document.addEventListener("languageChanged", () => {
  initRanking();
});
