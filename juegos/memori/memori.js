function t(key) {
  return window.translations?.[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.innerText = translations[key] || key;
  });

  // Traducir placeholders de inputs
  document.querySelectorAll("[data-placeholder-i18n]").forEach((input) => {
    const key = input.getAttribute("data-placeholder-i18n");
    input.placeholder = translations[key] || key;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
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
    sonidos.girar.volume = 0.8;
    sonidos.pareja.volume = 1.0;
    sonidos.error.volume = 0.2;
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

      // Limpiar timeout del modal de inicio
      if (timeoutNivelActual) {
        clearTimeout(timeoutNivelActual);
        timeoutNivelActual = null;
      }

      modalInicio.classList.add("mostrar");
    }

    // En reiniciarBtn:
    reiniciarBtn.addEventListener("click", () => {
      modal.classList.remove("mostrar");

      tablero.innerHTML = "";
      puntuacion = 0;
      parejasEncontradas = 0;
      primeraCarta = null;
      bloqueo = false;

      if (intervaloTiempo) clearInterval(intervaloTiempo);

      // Limpiar timeout del modal de inicio
      if (timeoutNivelActual) {
        clearTimeout(timeoutNivelActual);
        timeoutNivelActual = null;
      }

      // Reset flags de desafío
      desafioTerminado = false;
      nivelActual = 0;

      // Volver al modal inicial
      modalInicio.classList.add("mostrar");
    });

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
      "cerrarInstrucciones",
    );

    // ---------- BOTÓN SALIR ----------

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

    // Botón salir del modal de victoria o modal principal
    salirBtn.addEventListener("click", () => {
      confirmarSalida(() => {
        volverAlModalInicial();
      });
    });

    // Botón salir durante el juego (reinicia)
    salirJuegoBtn.addEventListener("click", () => {
      confirmarSalida(() => {
        volverAlModalInicial();
      });
    });

    // Botón salir del modal inicial
    document.getElementById("salirInicio").addEventListener("click", () => {
      confirmarSalida(() => {
        window.location.href = "../../index.html";
      });
    });

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
    let nivelEnCurso = null;
    const TIEMPO_MAX_ESPERA_NIVEL = 5 * 60 * 1000;
    let timeoutNivelActual = null;

    // ------------------ NIVELES DESAFÍO ------------------
    const niveles = [
      //{ nivel: 1, parejas: 4, columnas: 4, tiempo: 300 },
      { nivel: 1, parejas: 4, columnas: 4, tiempo: 90 },
      { nivel: 2, parejas: 6, columnas: 4, tiempo: 90 },
      { nivel: 3, parejas: 8, columnas: 4, tiempo: 100 },
      { nivel: 4, parejas: 10, columnas: 5, tiempo: 120 },
      { nivel: 5, parejas: 12, columnas: 6, tiempo: 140 },
      { nivel: 6, parejas: 15, columnas: 6, tiempo: 160 },
      { nivel: 7, parejas: 18, columnas: 6, tiempo: 200 },
      { nivel: 8, parejas: 20, columnas: 8, tiempo: 240 },
      { nivel: 9, parejas: 24, columnas: 8, tiempo: 280 },
      { nivel: 10, parejas: 30, columnas: 10, tiempo: 300 },
      { nivel: 11, parejas: 36, columnas: 9, tiempo: 360 },
      { nivel: 12, parejas: 40, columnas: 10, tiempo: 420 }, // MODO NORMAL
    ];

    // ------------------ FUNCIONES COMUNES ------------------

    function mostrarBonusTiempo() {
      const bonus = document.createElement("span");
      bonus.classList.add("bonus-tiempo");
      bonus.textContent = "+2";

      // Añadimos al body
      document.body.appendChild(bonus);

      // Calculamos la posición del marcador en pantalla
      const rect = marcador.getBoundingClientRect();
      bonus.style.left = `${rect.left + rect.width / 2}px`;
      bonus.style.top = `${rect.top}px`;
      bonus.style.transform = "translateX(-50%)";

      // Eliminamos tras la animación
      bonus.addEventListener("animationend", () => bonus.remove());
    }

    // Función para mostrar modal de confirmación de salida
    function confirmarSalida(callbackYes) {
      // Crear modal confirmación de salida
      let modalConfirm = document.getElementById("modal-confirm-exit");

      if (!modalConfirm) {
        modalConfirm = document.createElement("div");
        modalConfirm.id = "modal-confirm-exit";
        modalConfirm.classList.add("modal-memori");
        modalConfirm.innerHTML = `
    <div class="modal-contentMemori">
      <h2>${t("common.confirmExit")}</h2>
      <div class="botones">
        <button id="btnConfirmYes">${t("common.confirmYes")}</button>
        <button id="btnConfirmNo">${t("common.confirmNo")}</button>
      </div>
    </div>
  `;
        document.body.appendChild(modalConfirm);

        const btnYes = modalConfirm.querySelector("#btnConfirmYes");
        const btnNo = modalConfirm.querySelector("#btnConfirmNo");

        btnYes.addEventListener("click", () => {
          modalConfirm.classList.remove("mostrar");
          if (typeof modalConfirm.callback === "function") {
            modalConfirm.callback();
          }
        });

        btnNo.addEventListener("click", () => {
          modalConfirm.classList.remove("mostrar");
        });
      }

      modalConfirm.callback = callbackYes;
      modalConfirm.classList.add("mostrar");
    }

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
        guardarBtn.textContent = t("memori.noSaveZero");
      } else {
        guardarBtn.disabled = false;
        guardarBtn.textContent = t("common.save");
      }
      // Guardar puntuación usando la clave correspondiente
      guardarBtn.onclick = () => {
        registro.style.display = "block";

        registrarBtn.onclick = () => {
          const nombre = nombreJugador.value.trim();

          if (nombre.length < 3 || nombre.length > 10) {
            mostrarModalAviso(t("memori.invalidName"));
            return;
          }

          guardarRankingLocal(claveRanking, nombre, puntuacion);
          cargarRankingLocal(claveRanking);

          // BLOQUEAR GUARDADO
          guardarBtn.disabled = true;
          guardarBtn.textContent = t("memori.recordSaved");

          registro.style.display = "none";
          nombreJugador.value = "";
        };
      };
    }

    function mostrarRanking(ranking) {
      const divRanking = document.getElementById("ranking");

      divRanking.innerHTML =
        `<h3>${t("ranking.title")}</h3><ol>` +
        ranking
          .slice(0, 3)
          .map((r) =>
            r.puntuacion !== undefined
              ? `<li>${r.nombre}: ${r.puntuacion}</li>`
              : `<li>${r.nombre} - ${t("operaciones.levelCompleted")} ${
                  r.nivel
                }</li>`,
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
      if (!elementos || elementos.length === 0)
        return alert(t("memori.noElements"));

      // Limpiar cualquier intervalo de tiempo si existiera
      if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
        intervaloTiempo = null;
      }

      const cantidadParejas = 40;
      const seleccionados = mezclar([...elementos]).slice(0, cantidadParejas); // selecciona al azar

      let valores = [...seleccionados, ...seleccionados]; // duplicar para parejas
      valores = mezclar(valores); // mezclar el orden final

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

      const inner = document.createElement("div");
      inner.classList.add("carta-inner");

      const front = document.createElement("div");
      front.classList.add("carta-front");

      const back = document.createElement("div");
      back.classList.add("carta-back");
      const img = document.createElement("img");
      img.src = elemento.imagen;
      img.alt = elemento.nombre || "Carta";
      back.appendChild(img);

      inner.appendChild(front);
      inner.appendChild(back);
      div.appendChild(inner);

      div.addEventListener("click", () => {
        if (bloqueo || div.classList.contains("volteada")) return;
        playSound(sonidos.girar);
        div.classList.add("volteada");

        if (!primeraCarta) {
          primeraCarta = div;
        } else {
          if (primeraCarta.dataset.valor === div.dataset.valor) {
            playSound(sonidos.pareja);

            // Añadir clase emparejada a ambas cartas
            primeraCarta.classList.add("emparejada");
            div.classList.add("emparejada");

            puntuacion += 100;
            parejasEncontradas++;
            actualizarMarcador();

            if (parejasEncontradas === 40) mostrarModal();

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
      modal.classList.add("mostrar");

      // Crear un elemento para mostrar la puntuación si no existe
      let puntuacionElement = modal.querySelector("#puntuacionFinal");
      if (!puntuacionElement) {
        puntuacionElement = document.createElement("p");
        puntuacionElement.id = "puntuacionFinal";
        // Insertar después del título
        modal.querySelector("h2").after(puntuacionElement);
      }

      puntuacionElement.textContent = `${t("memori.finalScore")} ${puntuacion}`;

      // Ocultar registro por si estaba abierto
      registro.style.display = "none";

      // Preparar botón guardar
      actualizarBotonGuardar("ranking_memori");
    }

    // ------------------ MODO DESAFÍO ------------------
    function mostrarModalTiempoAgotadoConRecord() {
      playSound(sonidos.finTiempo);

      modal.classList.add("mostrar");

      modal.querySelector("h2").textContent = t("memori.timeUpTitle");

      // Texto principal
      let texto = modal.querySelector("#mensajeTiempo");
      if (!texto) {
        texto = document.createElement("p");
        texto.id = "mensajeTiempo";
        modal.querySelector("h2").after(texto);
      }

      texto.textContent = t("memori.timeUpFinal");

      // Nivel alcanzado
      let nivelElement = modal.querySelector("#nivelAlcanzado");
      if (!nivelElement) {
        nivelElement = document.createElement("p");
        nivelElement.id = "nivelAlcanzado";
        texto.after(nivelElement);
      }

      nivelElement.textContent = `${t("memori.levelReached")} ${nivelMaximoAlcanzado}`;

      // Ocultar registro inicialmente
      registro.style.display = "none";

      // Activar guardado
      actualizarBotonGuardarDesafio();
    }

    function mostrarModalDesafioFinal() {
      guardarBtn.disabled = false;
      guardarBtn.textContent = t("memori.saveRecord");

      playSound(sonidos.win);
      modal.classList.add("mostrar");

      // Crear/actualizar elemento para nivel alcanzado
      let nivelElement = modal.querySelector("#nivelAlcanzado");
      if (!nivelElement) {
        nivelElement = document.createElement("p");
        nivelElement.id = "nivelAlcanzado";
        // Insertar después del título
        modal.querySelector("h2").after(nivelElement);
      }

      nivelElement.textContent = `${t(
        "memori.levelReached",
      )} ${nivelMaximoAlcanzado}`;

      // Ocultar registro por si estaba abierto
      registro.style.display = "none";

      actualizarBotonGuardarDesafio();
    }

    function iniciarJuegoDesafio() {
      // Limpiar cualquier intervalo y resetear variables
      if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
        intervaloTiempo = null;
      }

      if (timeoutNivelActual) {
        clearTimeout(timeoutNivelActual);
        timeoutNivelActual = null;
      }

      nivelActual = 0;
      puntuacion = 0;
      parejasEncontradas = 0;

      marcador.textContent = "0:00";

      siguienteNivel();
    }

    function siguienteNivel() {
      // Limpiar cualquier intervalo anterior antes de continuar
      if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
        intervaloTiempo = null;
      }

      // IMPORTANTE: Limpiar el timeout del nivel anterior si existe
      if (timeoutNivelActual) {
        clearTimeout(timeoutNivelActual);
        timeoutNivelActual = null;
      }

      if (nivelActual >= niveles.length) {
        alert(t("memori.completedAllLevels"));
        nivelEnCurso = niveles[nivelActual - 1];
        return;
      }

      // Eliminar modal existente si lo hay
      const modalExistente = document.getElementById("modal-nivel");
      if (modalExistente) {
        modalExistente.remove();
      }

      parejasEncontradas = 0;
      nivelActual++;
      const nivel = niveles[nivelActual - 1];
      nivelEnCurso = nivel;
      parejasDelNivel = nivel.parejas;
      columnasNivel = nivel.columnas;
      tiempoRestante = nivel.tiempo;

      // Función para actualizar el texto del modal
      function actualizarModalTexto() {
        if (!modalNivel) return;

        const minutos = Math.floor(tiempoRestante / 60);
        const segundos = tiempoRestante % 60;
        const tiempoFormateado = `${minutos}:${
          segundos < 10 ? "0" : ""
        }${segundos}`;

        const titulo = t("memori.levelModalTitle").replace(
          "{{level}}",
          nivel.nivel,
        );
        const info = t("memori.levelModalInfo")
          .replace("{{pairs}}", nivel.parejas)
          .replace("{{time}}", tiempoFormateado);

        modalNivel.querySelector("h2").textContent = titulo;
        modalNivel.querySelector("p").textContent = info;
        modalNivel.querySelector("button").textContent = t("common.start");
      }

      // Crear modal nivel
      const modalNivel = document.createElement("div");
      modalNivel.classList.add("modal-memori", "mostrar");
      modalNivel.setAttribute("id", "modal-nivel");
      modalNivel.innerHTML = `
    <div class="modal-contentMemori">
      <h2></h2>
      <p></p>
      <button id="iniciarNivel"></button>
    </div>
  `;
      document.body.appendChild(modalNivel);

      // Guardar el timeout en la variable global
      timeoutNivelActual = setTimeout(() => {
        console.warn("Tiempo de espera agotado en selección de nivel");

        // Cerrar modal si sigue abierto
        if (modalNivel.parentNode) {
          modalNivel.remove();
        }

        // Simular fin de tiempo
        nivelMaximoAlcanzado = Math.max(nivelMaximoAlcanzado, nivelActual - 1);
        mostrarModalTiempoAgotado();

        timeoutNivelActual = null; // Limpiar referencia
      }, TIEMPO_MAX_ESPERA_NIVEL);

      // Actualizar texto inicial
      actualizarModalTexto();

      const btnIniciar = modalNivel.querySelector("#iniciarNivel");

      const languageHandler = () => {
        actualizarModalTexto();
      };

      // Escuchar cambios de idioma
      document.addEventListener("languageChanged", languageHandler);

      const iniciarHandler = () => {
        console.log("Botón Iniciar clickeado, nivel:", nivelActual);

        // Cancelar timeout de espera
        if (timeoutNivelActual) {
          clearTimeout(timeoutNivelActual);
          timeoutNivelActual = null;
        }

        if (!elementos || elementos.length < parejasDelNivel) {
          alert(t("memori.notEnoughElements"));
          return;
        }

        // Remover el event listener del cambio de idioma
        document.removeEventListener("languageChanged", languageHandler);
        modalNivel.remove();
        console.log("Modal removido, cargando nivel...");

        cargarNivelDesafio();
      };

      btnIniciar.addEventListener("click", iniciarHandler, { once: true });
    }

    function cargarNivelDesafio() {
      // Limpiar cualquier intervalo previo
      if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
        intervaloTiempo = null;
      }

      // Seleccionamos parejas al azar
      const seleccionados = mezclar(elementos).slice(0, parejasDelNivel);
      let valores = [...seleccionados, ...seleccionados];
      valores = mezclar(valores);

      tablero.innerHTML = "";
      valores.forEach(crearCartaDesafio);
      ajustarGridPorNivel(parejasDelNivel, columnasNivel);

      actualizarMarcador();

      cargarRankingLocal("ranking_desafio");

      const minutos = Math.floor(tiempoRestante / 60);
      const segundos = tiempoRestante % 60;
      marcador.textContent = `${minutos}:${segundos.toString().padStart(2, "0")}`;

      // Iniciar cronómetro
      intervaloTiempo = setInterval(() => {
        tiempoRestante--;

        // Actualizar marcador con formato mm:ss
        const mins = Math.floor(tiempoRestante / 60);
        const segs = tiempoRestante % 60;
        marcador.textContent = `${mins}:${segs.toString().padStart(2, "0")}`;

        if (tiempoRestante <= 0) {
          clearInterval(intervaloTiempo);
          intervaloTiempo = null;
          mostrarModalTiempoAgotado();
        }
      }, 1000);
    }

    function crearCartaDesafio(elemento) {
      const div = document.createElement("div");
      div.classList.add("carta");
      div.dataset.valor = elemento.id;

      const inner = document.createElement("div");
      inner.classList.add("carta-inner");

      const front = document.createElement("div");
      front.classList.add("carta-front");

      const back = document.createElement("div");
      back.classList.add("carta-back");
      const img = document.createElement("img");
      img.src = elemento.imagen;
      img.alt = elemento.nombre || "Carta";
      back.appendChild(img);

      inner.appendChild(front);
      inner.appendChild(back);
      div.appendChild(inner);

      div.addEventListener("click", () => {
        if (bloqueo || div.classList.contains("volteada")) return;
        playSound(sonidos.girar);
        div.classList.add("volteada");

        if (!primeraCarta) {
          primeraCarta = div;
        } else {
          if (primeraCarta.dataset.valor === div.dataset.valor) {
            playSound(sonidos.pareja);

            // Añadir clase emparejada a ambas cartas
            primeraCarta.classList.add("emparejada");
            div.classList.add("emparejada");

            puntuacion += 100;
            parejasEncontradas++;

            // BONUS DE TIEMPO a partir del nivel 9
            if (nivelEnCurso && nivelEnCurso.nivel >= 9) {
              tiempoRestante += 2;
              marcador.textContent = `${Math.floor(tiempoRestante / 60)}:${String(
                tiempoRestante % 60,
              ).padStart(2, "0")}`;
              // Mostrar animación +2
              mostrarBonusTiempo();
            }

            if (parejasEncontradas === parejasDelNivel) {
              clearInterval(intervaloTiempo);
              intervaloTiempo = null;
              nivelMaximoAlcanzado = Math.max(
                nivelMaximoAlcanzado,
                nivelActual,
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
      guardarBtn.textContent = t("memori.saveRecord");

      guardarBtn.onclick = () => {
        registro.style.display = "block";

        registrarBtn.onclick = () => {
          const nombre = nombreJugador.value.trim();

          if (nombre.length < 3 || nombre.length > 10) {
            mostrarModalAviso(t("memori.invalidName"));
            return;
          }

          guardarRankingDesafio(nombre, nivelMaximoAlcanzado);
          cargarRankingDesafio();

          // BLOQUEAR GUARDADO
          guardarBtn.disabled = true;
          guardarBtn.textContent = t("memori.recordSaved");

          registro.style.display = "none";
          nombreJugador.value = "";
        };
      };
    }

    function cargarRankingDesafio() {
      const ranking = JSON.parse(localStorage.getItem("ranking_desafio")) || [];
      mostrarRanking(ranking);
    }

    function mostrarModalTiempoAgotado() {
      clearInterval(intervaloTiempo);
      playSound(sonidos.finTiempo);

      // Guardamos el nivel alcanzado
      nivelMaximoAlcanzado = Math.max(nivelMaximoAlcanzado, nivelActual);

      if (nivelActual >= 6) {
        // Modal tipo victoria (pero sin victoria)
        mostrarModalTiempoAgotadoConRecord();
      } else {
        // Derrota simple (reiniciar)
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
    <h2>${t("memori.timeUpTitle")}</h2>
    <p>${t("memori.timeUpText")}</p>
    <p>${t("memori.levelReached")} ${nivelMaximoAlcanzado}</p>
    <button id="reiniciarTiempo">${t("memori.restartChallenge")}</button>
  </div>
`;

      document.body.appendChild(modalTiempo);

      const btnAceptar = modalTiempo.querySelector("#reiniciarTiempo");

      btnAceptar.addEventListener("click", () => {
        modalTiempo.remove();
        reiniciarBtn.click(); // reutilizamos tu lógica existente
      });
    }

    function mostrarModalAviso(mensaje) {
      // Eliminar si ya existe
      const existente = document.getElementById("modal-aviso");
      if (existente) existente.remove();

      const modalAviso = document.createElement("div");
      modalAviso.classList.add("modal-memori", "mostrar");
      modalAviso.id = "modal-aviso";

      modalAviso.innerHTML = `
  <div class="modal-contentMemori">
    <h2>${t("memori.warning")}</h2>
    <p>${mensaje}</p>
    <button id="cerrarAviso">${t("common.accept")}</button>
  </div>
`;

      document.body.appendChild(modalAviso);

      modalAviso.querySelector("#cerrarAviso").addEventListener("click", () => {
        modalAviso.remove();
        nombreJugador.value = ""; // limpiar input
      });
    }

    function actualizarMarcador() {
      // En modo normal muestra puntuación, en modo desafío el tiempo se maneja por separado
      if (modoActual === "normal") {
        marcador.textContent = puntuacion;
      }
      // En modo desafío, el tiempo se actualiza en el intervalo
    }

    // También modificar en los bonus de tiempo:
    if (nivelEnCurso && nivelEnCurso.nivel >= 9) {
      tiempoRestante += 2;
      const mins = Math.floor(tiempoRestante / 60);
      const segs = tiempoRestante % 60;
      marcador.textContent = `${mins}:${segs.toString().padStart(2, "0")}`;
      mostrarBonusTiempo();
    }
  }

  if (document.getElementById("tablero")) iniciarMemori();
});
