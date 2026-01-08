document.addEventListener("DOMContentLoaded", () => {
  function iniciarMemori() {
    // Referencias DOM
    const tablero = document.getElementById("tablero");
    const marcador = document.getElementById("marcador");
    const modal = document.getElementById("modal-memori");
    const puntuacionFinal = document.getElementById("puntuacionFinal");
    const salirBtn = document.getElementById("salir");
    const salirJuegoBtn = document.getElementById("salir-juego-memori");
    const reiniciarBtn = document.getElementById("reiniciar");
    const guardarBtn = document.getElementById("guardar");
    const registro = document.getElementById("registro");
    const registrarBtn = document.getElementById("registrar");
    const nombreJugador = document.getElementById("nombreJugador");
    const rankingBtn = document.getElementById("ranking-btn");
    // ------------------ BOTONES SALIR ------------------
    function volverAlModalInicial() {
      // Cerrar modal de victoria si está abierto
      modal.classList.remove("mostrar");

      // Limpiar tablero y estado
      tablero.innerHTML = "";
      puntuacion = 0;
      parejasEncontradas = 0;
      primeraCarta = null;
      bloqueo = false;

      if (intervaloTiempo) clearInterval(intervaloTiempo);

      // Mostrar el modal ORIGINAL (el que tiene instrucciones)
      modalInicio.classList.add("mostrar");
    }

    // ---------- BOTÓN REINICIAR ----------
    reiniciarBtn.addEventListener("click", () => {
      modal.classList.remove("mostrar");
      tablero.innerHTML = "";
      puntuacion = 0;
      parejasEncontradas = 0;
      primeraCarta = null;
      bloqueo = false;

      iniciarJuegoNormal();
    });

    // ---------- BOTÓN RANKING ----------

    rankingBtn.addEventListener("click", () => {
      window.location.href = "../rankingMemori/index.html";
    });

    const modalInicio = document.getElementById("modal-inicio");
    const modalInstrucciones = document.getElementById("modal-instrucciones");

    const instruccionesBtn = document.getElementById("instruccionesBtn");
    const cerrarInstruccionesBtn = document.getElementById(
      "cerrarInstrucciones"
    );

    // Mostrar modal de inicio al cargar
    modalInicio.classList.add("mostrar");

    // Abrir modal instrucciones
    instruccionesBtn.addEventListener("click", () => {
      modalInstrucciones.classList.add("mostrar");
    });

    // Cerrar modal instrucciones
    cerrarInstruccionesBtn.addEventListener("click", () => {
      modalInstrucciones.classList.remove("mostrar");
    });

    // Selección de modo
    document.getElementById("modoNormal").addEventListener("click", () => {
      modalInicio.classList.remove("mostrar");
      iniciarJuegoNormal();
    });

    document.getElementById("modoDesafio").addEventListener("click", () => {
      modalInicio.classList.remove("mostrar");
      iniciarJuegoDesafio();
    });

    // Cambiar funcionalidad de los botones dentro del juego
    salirJuegoBtn.addEventListener("click", volverAlModalInicial);
    salirBtn.addEventListener("click", volverAlModalInicial); // solo si es botón dentro del juego

    // Variables generales
    let puntuacion = 0;
    let primeraCarta = null;
    let bloqueo = false;
    let parejasEncontradas = 0;
    let parejasDelNivel = 0;
    let tiempoRestante = 0;
    let intervaloTiempo = null;
    let nivelActual = 0;

    // ------------------ NIVELES DESAFÍO ------------------
    const niveles = [
      { nivel: 1, parejas: 4, tiempo: 300 },
      { nivel: 2, parejas: 8, tiempo: 360 },
      { nivel: 3, parejas: 12, tiempo: 420 },
      { nivel: 4, parejas: 16, tiempo: 480 },
      { nivel: 5, parejas: 20, tiempo: 540 },
    ];

    // ------------------ FUNCIONES COMUNES ------------------

    function ajustarGrid(totalCartas) {
      let columnas;

      if (totalCartas <= 8) columnas = 4;
      else if (totalCartas <= 16) columnas = 4;
      else if (totalCartas <= 24) columnas = 6;
      else if (totalCartas <= 36) columnas = 6;
      else if (totalCartas <= 48) columnas = 8;
      else columnas = 10;

      tablero.style.gridTemplateColumns = `repeat(${columnas}, auto)`;
    }

    function mezclar(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function actualizarBotonGuardar(claveRanking) {
      if (puntuacion <= 0) {
        guardarBtn.disabled = true;
        guardarBtn.textContent = "0 puntos no se pueden guardar";
      } else {
        guardarBtn.disabled = false;
        guardarBtn.textContent = "Guardar";
      }
      // Guardar puntuación usando la clave correspondiente
      guardarBtn.onclick = () => {
        registro.style.display = "block";
        registrarBtn.onclick = () => {
          const nombre = nombreJugador.value.trim();
          if (nombre.length < 3 || nombre.length > 10) {
            alert("El nombre debe tener entre 3 y 10 caracteres");
            return;
          }
          guardarRankingLocal(claveRanking, nombre, puntuacion);
          registro.style.display = "none";
          nombreJugador.value = "";
          cargarRankingLocal(claveRanking);
        };
      };
    }

    function mostrarRanking(ranking) {
      const divRanking = document.getElementById("ranking");
      divRanking.innerHTML =
        "<h3>Ranking</h3><ol>" +
        ranking
          .slice(0, 3) // solo los 3 primeros
          .map((r) => `<li>${r.nombre}: ${r.puntuacion}</li>`)
          .join("") +
        "</ol>";
    }

    function guardarRankingLocal(clave, nombre, puntuacion) {
      const ranking = JSON.parse(localStorage.getItem(clave)) || [];
      ranking.push({ nombre, puntuacion });
      ranking.sort((a, b) => b.puntuacion - a.puntuacion); // ordenar de mayor a menor
      localStorage.setItem(clave, JSON.stringify(ranking)); // sin slice, guardamos todo
    }

    function cargarRankingLocal(clave) {
      const ranking = JSON.parse(localStorage.getItem(clave)) || [];
      mostrarRanking(ranking);
    }

    // ------------------ JUEGO NORMAL ------------------
    function iniciarJuegoNormal() {
      const seleccionados = elementos.slice(0, 40);
      if (!seleccionados.length) return alert("No hay elementos para jugar.");
      let valores = [...seleccionados, ...seleccionados];
      valores = mezclar(valores);

      // Crear cartas y lógica normal
      tablero.innerHTML = "";
      valores.forEach(crearCartaNormal);
      ajustarGrid(valores.length);
      puntuacion = 0;
      parejasEncontradas = 0;
      actualizarMarcador();
      actualizarBotonGuardar("ranking_memori");
      cargarRankingLocal("ranking_memori");
    }

    function crearCartaNormal(elemento) {
      const div = document.createElement("div");
      div.classList.add("carta");
      div.dataset.valor = elemento.id;
      const img = document.createElement("img");
      img.src = elemento.imagen;
      img.style.width = "70%";
      img.style.display = "none";
      div.appendChild(img);

      div.addEventListener("click", () => {
        if (bloqueo || div.classList.contains("volteada")) return;
        div.classList.add("volteada");
        img.style.display = "block";
        if (!primeraCarta) {
          primeraCarta = div;
        } else {
          if (primeraCarta.dataset.valor === div.dataset.valor) {
            puntuacion += 100;
            parejasEncontradas++;
            actualizarMarcador();
            if (parejasEncontradas === 1) mostrarModal();
            //if (parejasEncontradas === 40) mostrarModal();
            primeraCarta = null;
            bloqueo = false;
          } else {
            bloqueo = true;
            puntuacion = Math.max(0, puntuacion - 5);
            actualizarMarcador();
            setTimeout(() => {
              div.classList.remove("volteada");
              primeraCarta.classList.remove("volteada");
              div.querySelector("img").style.display = "none";
              primeraCarta.querySelector("img").style.display = "none";
              primeraCarta = null;
              bloqueo = false;
            }, 1000);
          }
        }
      });
      tablero.appendChild(div);
    }

    function mostrarModal() {
      // Mostrar el modal de victoria
      modal.classList.add("mostrar");

      // Mostrar puntuación final
      puntuacionFinal.textContent = `Puntuación final: ${puntuacion}`;

      // Ocultar registro por si estaba abierto
      registro.style.display = "none";

      // Preparar botón guardar
      actualizarBotonGuardar("ranking_memori");
    }

    // ------------------ MODO DESAFÍO ------------------
    function iniciarJuegoDesafio() {
      nivelActual = 0;
      siguienteNivel();
    }

    function siguienteNivel() {
      if (nivelActual >= niveles.length) {
        alert("¡Has completado todos los niveles!");
        return;
      }
      parejasEncontradas = 0;
      nivelActual++;
      const nivel = niveles[nivelActual - 1];
      parejasDelNivel = nivel.parejas;
      tiempoRestante = nivel.tiempo;

      // Modal nivel
      const modalNivel = document.createElement("div");
      modalNivel.classList.add("modal-memori", "mostrar");
      modalNivel.innerHTML = `
        <div class="modal-contentMemori">
          <h2>Nivel ${nivel.nivel}</h2>
          <p>${nivel.parejas} parejas - ${Math.floor(tiempoRestante / 60)}:${
        tiempoRestante % 60
      } minutos</p>
          <button id="iniciarNivel">Iniciar</button>
        </div>
      `;
      document.body.appendChild(modalNivel);
      document.getElementById("iniciarNivel").addEventListener("click", () => {
        modalNivel.remove();
        cargarNivelDesafio();
      });
    }

    function cargarNivelDesafio() {
      // Seleccionamos parejas al azar
      const seleccionados = mezclar(elementos).slice(0, parejasDelNivel);
      let valores = [...seleccionados, ...seleccionados];
      valores = mezclar(valores);

      tablero.innerHTML = "";
      valores.forEach(crearCartaDesafio);
      ajustarGrid(valores.length);
      actualizarMarcador();
      actualizarBotonGuardar("ranking_desafio");
      cargarRankingLocal("ranking_desafio");

      // Iniciar cronómetro
      if (intervaloTiempo) clearInterval(intervaloTiempo);
      intervaloTiempo = setInterval(() => {
        tiempoRestante--;
        marcador.textContent = `${Math.floor(tiempoRestante / 60)}:${String(
          tiempoRestante % 60
        ).padStart(2, "0")}`;
        if (tiempoRestante <= 0) {
          clearInterval(intervaloTiempo);
          mostrarModalTiempoAgotado();
        }
      }, 1000);
    }

    function crearCartaDesafio(elemento) {
      const div = document.createElement("div");
      div.classList.add("carta");
      div.dataset.valor = elemento.id;
      const img = document.createElement("img");
      img.src = elemento.imagen;
      img.style.width = "70%";
      img.style.display = "none";
      div.appendChild(img);

      div.addEventListener("click", () => {
        if (bloqueo || div.classList.contains("volteada")) return;
        div.classList.add("volteada");
        img.style.display = "block";
        if (!primeraCarta) {
          primeraCarta = div;
        } else {
          if (primeraCarta.dataset.valor === div.dataset.valor) {
            puntuacion += 100;
            parejasEncontradas++;
            if (parejasEncontradas === parejasDelNivel) {
              clearInterval(intervaloTiempo);
              if (nivelActual < niveles.length) siguienteNivel();
              else mostrarModal();
            }
            primeraCarta = null;
            bloqueo = false;
          } else {
            bloqueo = true;
            puntuacion = Math.max(0, puntuacion - 5);
            setTimeout(() => {
              div.classList.remove("volteada");
              primeraCarta.classList.remove("volteada");
              div.querySelector("img").style.display = "none";
              primeraCarta.querySelector("img").style.display = "none";
              primeraCarta = null;
              bloqueo = false;
            }, 1000);
          }
        }
      });

      tablero.appendChild(div);
    }

    function mostrarModalTiempoAgotado() {
      alert("¡Se acabó el tiempo!");
      reiniciarBtn.click();
    }

    function actualizarMarcador() {
      marcador.textContent = puntuacion;
    }
  }

  if (document.getElementById("tablero")) iniciarMemori();
});
