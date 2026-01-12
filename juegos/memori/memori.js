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

    // ------------------ SONIDOS ------------------
    const sonidos = {
      girar: new Audio("sounds/girar2.mp3"),
      pareja: new Audio("sounds/descubierto.mp3"),
      error: new Audio("sounds/error.mp3"),
      pasoNivel: new Audio("sounds/paso-nivel.mp3"),
      finTiempo: new Audio("sounds/fin-tiempo.mp3"),
      win: new Audio("sounds/win.mp3"),
    };

    Object.values(sonidos).forEach((audio) => {
      audio.preload = "auto";
    });

    // Volúmenes individuales (0.0 a 1.0)
    sonidos.girar.volume = 0.6;
    sonidos.pareja.volume = 0.9;
    sonidos.error.volume = 0.1;
    sonidos.pasoNivel.volume = 0.2;
    sonidos.finTiempo.volume = 0.5;
    sonidos.win.volume = 0.7;

    // Función segura para reproducir sonido
    function playSound(sound) {
      if (!sound) return;
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Evita errores en móviles si aún no hay interacción
      });
    }

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

      if (intervaloTiempo) clearInterval(intervaloTiempo);

      // Reset flags de desafío
      desafioTerminado = false;
      nivelActual = 0;

      // Volver al modal inicial
      modalInicio.classList.add("mostrar");
    });

    document.getElementById("rankingInicio").addEventListener("click", () => {
      window.location.href = "../rankingMemori/index.html";
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
    let nivelMaximoAlcanzado = 0;
    let desafioTerminado = false;
    let modoActual = null; // "normal" | "desafio"
    let tiempoRestante = 0;
    let intervaloTiempo = null;
    let nivelActual = 0;
    let columnasNivel = 0;
    let parejasDelNivel = 0; // para el modo desafío

    // ------------------ NIVELES DESAFÍO ------------------
    const niveles = [
      //{ nivel: 1, parejas: 4, columnas: 4, tiempo: 300 },
      { nivel: 1, parejas: 4, columnas: 4, tiempo: 30 },
      { nivel: 2, parejas: 6, columnas: 4, tiempo: 330 },
      { nivel: 3, parejas: 8, columnas: 4, tiempo: 360 },
      { nivel: 4, parejas: 10, columnas: 5, tiempo: 390 },
      { nivel: 5, parejas: 12, columnas: 6, tiempo: 420 },
      { nivel: 6, parejas: 15, columnas: 6, tiempo: 450 },
      { nivel: 7, parejas: 18, columnas: 6, tiempo: 480 },
      { nivel: 8, parejas: 20, columnas: 8, tiempo: 510 },
      { nivel: 9, parejas: 24, columnas: 8, tiempo: 540 },
      { nivel: 10, parejas: 30, columnas: 10, tiempo: 570 },
      { nivel: 11, parejas: 36, columnas: 9, tiempo: 585 },
      { nivel: 12, parejas: 40, columnas: 10, tiempo: 600 }, // MODO NORMAL
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

    function ajustarGridPorNivel(parejas, columnas) {
      const totalCartas = parejas * 2;
      tablero.style.gridTemplateColumns = `repeat(${columnas}, auto)`;
    }

    function mezclar(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    document.getElementById("modoNormal").addEventListener("click", () => {
      modoActual = "normal";
      modalInicio.classList.remove("mostrar");
      iniciarJuegoNormal();
    });

    document.getElementById("modoDesafio").addEventListener("click", () => {
      modoActual = "desafio";
      modalInicio.classList.remove("mostrar");
      iniciarJuegoDesafio();
    });

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
          .slice(0, 3)
          .map((r) =>
            r.puntuacion !== undefined
              ? `<li>${r.nombre}: ${r.puntuacion}</li>`
              : `<li>${r.nombre} - Nivel ${r.nivel}</li>`
          )
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
        playSound(sonidos.girar);
        div.classList.add("volteada");
        img.style.display = "block";
        if (!primeraCarta) {
          primeraCarta = div;
        } else {
          if (primeraCarta.dataset.valor === div.dataset.valor) {
            playSound(sonidos.pareja);
            puntuacion += 100;
            parejasEncontradas++;
            actualizarMarcador();
            if (parejasEncontradas === 1) mostrarModal();
            //if (parejasEncontradas === 40) mostrarModal();
            primeraCarta = null;
            bloqueo = false;
          } else {
            playSound(sonidos.error);
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
      playSound(sonidos.win);
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
    function mostrarModalDesafioFinal() {
      playSound(sonidos.win);
      modal.classList.add("mostrar");

      puntuacionFinal.textContent = `
    Has alcanzado el nivel ${nivelMaximoAlcanzado}
  `;

      registro.style.display = "none";

      actualizarBotonGuardarDesafio();
    }

    function iniciarJuegoDesafio() {
      nivelActual = 0;
      siguienteNivel();
    }

    function siguienteNivel() {
      if (nivelActual >= niveles.length) {
        alert("¡Has completado todos los niveles!");
        return;
      }

      // Limpiar cualquier modal anterior
      const modalExistente = document.getElementById("modal-nivel");
      if (modalExistente) {
        modalExistente.remove();
      }

      parejasEncontradas = 0;
      nivelActual++;
      const nivel = niveles[nivelActual - 1];
      parejasDelNivel = nivel.parejas;
      columnasNivel = nivel.columnas;
      tiempoRestante = nivel.tiempo;

      // Modal nivel
      const modalNivel = document.createElement("div");
      modalNivel.classList.add("modal-memori", "mostrar");
      modalNivel.setAttribute("id", "modal-nivel");
      modalNivel.innerHTML = `
    <div class="modal-contentMemori">
      <h2>Nivel ${nivel.nivel}</h2>
      <p>${nivel.parejas} parejas - ${Math.floor(tiempoRestante / 60)}:${
        tiempoRestante % 60 < 10 ? "0" : ""
      }${tiempoRestante % 60} minutos</p>
      <button id="iniciarNivel">Iniciar</button>
    </div>
  `;
      document.body.appendChild(modalNivel);

      const btnIniciar = modalNivel.querySelector("#iniciarNivel");

      const iniciarHandler = () => {
        console.log("Botón Iniciar clickeado, nivel:", nivelActual);

        if (!elementos || elementos.length < parejasDelNivel) {
          alert("No hay suficientes elementos para este nivel.");
          return;
        }

        console.log("Removiendo modal...");

        btnIniciar.addEventListener("click", iniciarHandler, { once: true });

        modalNivel.remove();
        console.log("Modal removido, cargando nivel...");

        cargarNivelDesafio();
      };

      btnIniciar.addEventListener("click", iniciarHandler, { once: true }); // { once: true } asegura que solo se ejecute una vez
    }
    function cargarNivelDesafio() {
      // Seleccionamos parejas al azar
      const seleccionados = mezclar(elementos).slice(0, parejasDelNivel);
      let valores = [...seleccionados, ...seleccionados];
      valores = mezclar(valores);

      tablero.innerHTML = "";
      valores.forEach(crearCartaDesafio);
      ajustarGridPorNivel(parejasDelNivel, columnasNivel);

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
        playSound(sonidos.girar);
        div.classList.add("volteada");
        img.style.display = "block";
        if (!primeraCarta) {
          primeraCarta = div;
        } else {
          if (primeraCarta.dataset.valor === div.dataset.valor) {
            playSound(sonidos.pareja);
            puntuacion += 100;
            parejasEncontradas++;
            if (parejasEncontradas === parejasDelNivel) {
              clearInterval(intervaloTiempo);

              nivelMaximoAlcanzado = Math.max(
                nivelMaximoAlcanzado,
                nivelActual
              );

              if (nivelActual < niveles.length) {
                playSound(sonidos.pasoNivel);
                setTimeout(() => {
                  siguienteNivel();
                }, 400);
              } else {
                desafioTerminado = true;
                mostrarModalDesafioFinal();
              }
            }

            primeraCarta = null;
            bloqueo = false;
          } else {
            playSound(sonidos.error);
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

    function guardarRankingDesafio(nombre, nivel) {
      const ranking = JSON.parse(localStorage.getItem("ranking_desafio")) || [];

      ranking.push({ nombre, nivel });

      ranking.sort((a, b) => b.nivel - a.nivel);

      localStorage.setItem("ranking_desafio", JSON.stringify(ranking));
    }

    function actualizarBotonGuardarDesafio() {
      guardarBtn.disabled = false;
      guardarBtn.textContent = "Guardar récord";

      guardarBtn.onclick = () => {
        registro.style.display = "block";

        registrarBtn.onclick = () => {
          const nombre = nombreJugador.value.trim();

          if (nombre.length < 3 || nombre.length > 10) {
            alert("El nombre debe tener entre 3 y 10 caracteres");
            return;
          }

          guardarRankingDesafio(nombre, nivelMaximoAlcanzado);
          registro.style.display = "none";
          nombreJugador.value = "";

          cargarRankingDesafio();
        };
      };
    }

    function cargarRankingDesafio() {
      const ranking = JSON.parse(localStorage.getItem("ranking_desafio")) || [];
      mostrarRanking(ranking);
    }

    function mostrarModalTiempoAgotado() {
      playSound(sonidos.finTiempo);
      clearInterval(intervaloTiempo);

      // Guardamos el nivel alcanzado aunque no se complete
      nivelMaximoAlcanzado = Math.max(nivelMaximoAlcanzado, nivelActual);

      if (nivelActual >= 5) {
        mostrarModalDesafioFinal();
      } else {
        mostrarModalTiempoAgotadoDesafio();
      }
    }

    function mostrarModalTiempoAgotadoDesafio() {
      playSound(sonidos.finTiempo);

      // Eliminar si ya existe
      const modalExistente = document.getElementById("modal-tiempo");
      if (modalExistente) modalExistente.remove();

      const modalTiempo = document.createElement("div");
      modalTiempo.classList.add("modal-memori", "mostrar");
      modalTiempo.id = "modal-tiempo";

      modalTiempo.innerHTML = `
    <div class="modal-contentMemori">
      <h2>⏰ Tiempo agotado</h2>
      <p>No has completado el nivel a tiempo.</p>
      <p>Has alcanzado el nivel ${nivelMaximoAlcanzado}</p>
      <button id="reiniciarTiempo">Volver a empezar</button>

    </div>
  `;

      document.body.appendChild(modalTiempo);

      const btnAceptar = modalTiempo.querySelector("#reiniciarTiempo");

      btnAceptar.addEventListener("click", () => {
        modalTiempo.remove();
        reiniciarBtn.click(); // reutilizamos tu lógica existente
      });
    }

    function actualizarMarcador() {
      marcador.textContent = puntuacion;
    }
  }

  if (document.getElementById("tablero")) iniciarMemori();
});
