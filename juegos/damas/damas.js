// ================================
// Juego de Damas
// ================================

function t(key) {
  return window.translations?.[key] || key;
}

// ================================
// SONIDOS
// ================================

// ================================
// SONIDOS OPTIMIZADOS CON PRECARGA
// ================================

const sonidosDamas = (() => {
  // Lista de todos los sonidos necesarios
  const archivosSonidos = {
    movimiento: "sounds/movement.mp3",
    comer: "sounds/comer1.mp3",
    ganar: "sounds/you-win.mp3",
    perder: "sounds/game-over.mp3",
    coronar: "sounds/christmas.mp3",
  };

  // Objeto para almacenar los Audio elements precargados
  const sonidos = {};

  // Estado de carga
  let sonidosCargados = 0;
  const totalSonidos = Object.keys(archivosSonidos).length;
  let precargaCompleta = false;

  /**
   * Precarga todos los sonidos al iniciar
   */
  function precargarSonidos() {
    console.log("🎵 Precargando sonidos...");

    Object.entries(archivosSonidos).forEach(([key, ruta]) => {
      const audio = new Audio();

      // Eventos para monitorear la carga
      audio.addEventListener(
        "canplaythrough",
        () => {
          sonidosCargados++;
          console.log(
            `✅ Sonido cargado: ${key} (${sonidosCargados}/${totalSonidos})`,
          );

          if (sonidosCargados === totalSonidos) {
            precargaCompleta = true;
            console.log("🎵 Todos los sonidos precargados correctamente");
          }
        },
        { once: true },
      );

      audio.addEventListener("error", (e) => {
        console.error(`❌ Error cargando sonido: ${key}`, e);
      });

      // Configurar volumen y precargar
      audio.src = ruta;
      audio.load(); // Inicia la precarga
      audio.volume = key === "movimiento" ? 0.8 : key === "comer" ? 0.9 : 1;

      sonidos[key] = audio;
    });
  }

  /**
   * Reproduce un sonido de forma optimizada
   */
  function playSonido(key) {
    const audio = sonidos[key];
    if (!audio) {
      console.warn(`Sonido no encontrado: ${key}`);
      return;
    }

    // Clonar para permitir reproducción simultánea

    try {
      // Resetear y reproducir
      audio.currentTime = 0;

      // Usar Promise para manejar mejor los errores de autoplay
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name !== "NotAllowedError") {
            console.warn(`Error reproduciendo ${key}:`, error);
          }
        });
      }
    } catch (error) {
      console.warn(`Error en reproducción de ${key}:`, error);
    }
  }

  // Iniciar precarga inmediatamente
  precargarSonidos();

  // Desbloquear audio en la primera interacción del usuario (COMPATIBLE CON CSP)
  const desbloquearAudio = () => {
    // Crear un contexto de audio silencioso en lugar de un data URI
    try {
      // Intentar crear un oscilador silencioso
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        if (ctx.state === "suspended") {
          ctx
            .resume()
            .then(() => {
              console.log("🔊 AudioContext desbloqueado");
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      // Fallback: reproducir uno de los sonidos precargados a volumen 0
      const audioSilencioso = sonidos.movimiento.cloneNode();
      audioSilencioso.volume = 0;
      audioSilencioso.play().catch(() => {});
    }

    document.removeEventListener("click", desbloquearAudio);
    document.removeEventListener("touchstart", desbloquearAudio);
  };

  document.addEventListener("click", desbloquearAudio, { once: true });
  document.addEventListener("touchstart", desbloquearAudio, { once: true });

  // API pública
  return {
    movimiento: () => playSonido("movimiento"),
    comer: () => playSonido("comer"),
    ganar: () => playSonido("ganar"),
    perder: () => playSonido("perder"),
    coronar: () => playSonido("coronar"),
    // Método de utilidad para verificar estado
    estaPrecargado: () => precargaCompleta,
  };
})();

// ELIMINA el bloque anterior de sonidos (el que tenía el document.addEventListener para precarga silenciosa)

// ================================
// CONSTANTES DEL JUEGO
// ================================

const DAMAS = {
  FILAS: 8,
  COLUMNAS: 8,
  ANIMACION_MS: 1000,
  IA_DELAY_MS: 950,
  CORONACION_FILA_TOP: 7,
  CORONACION_FILA_BOTTOM: 0,
};

const JuegoDamas = (() => {
  // ======================================================================
  // VARIABLES
  // ======================================================================
  const tableroDamasPrincipal = document.getElementById("tablero-damas");

  let animacionEnCurso = false;

  const estadoGlobalDamas = {
    matrizDamas: [],
    ladoHumanoAsignado: null,
    colorHumano: null, // "blancas" o "negras"
    turnoActualDamas: null,
    seleccionActualDamas: null,
    movimientosDisponiblesDamas: [],
    tableroGiradoFlag: false,
    juegoTerminadoFlag: false,
    capturasHumano: 0,
    mostrarSugerencias: true,
    sorteoRealizado: false,
    nivelIA: "normal", // "normal" | "dificil"
    capturasIA: 0,
    tiempoRestante: 300000, // 5 minutos en milisegundos (5 * 60 * 1000)
    intervaloInactividad: null,
  };

  // ======================================================================
  // UTILIDADES
  // ======================================================================
  const indicePlanoDamas = (f, c) => f * 8 + c;
  const enLimiteDamas = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const clonarMatrizDamas = (m) =>
    m.map((fila) => fila.map((celda) => (celda ? { ...celda } : null)));

  // ======================================================================
  // FUNCIONES PARA EL TEMPORIZADOR DE INACTIVIDAD
  // ======================================================================

  /**
   * Formatea los milisegundos a un string MM:SS
   */
  function formatearTiempo(ms) {
    if (ms < 0) ms = 0;
    const totalSegundos = Math.floor(ms / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
  }

  /**
   * Actualiza el elemento HTML del temporizador con el tiempo actual
   */
  function actualizarDisplayTiempo() {
    const tiempoSpan = document.getElementById("tiempo-restante-info");
    if (tiempoSpan) {
      tiempoSpan.textContent = formatearTiempo(
        estadoGlobalDamas.tiempoRestante,
      );
    }
  }

  /**
   * Reinicia el temporizador a 5 minutos.
   * Se llama después de cada movimiento del jugador.
   */
  function reiniciarTemporizador() {
    estadoGlobalDamas.tiempoRestante = 300000;
    actualizarDisplayTiempo();
  }

  /**
   * Detiene el intervalo del temporizador.
   */
  function detenerTemporizador() {
    if (estadoGlobalDamas.intervaloInactividad) {
      clearInterval(estadoGlobalDamas.intervaloInactividad);
      estadoGlobalDamas.intervaloInactividad = null;
    }
  }

  /**
   * Inicia (o reinicia) el temporizador de inactividad.
   */
  function iniciarTemporizador() {
    // Si el juego ya terminó, no iniciar temporizador
    if (estadoGlobalDamas.juegoTerminadoFlag) {
      return;
    }

    detenerTemporizador();

    estadoGlobalDamas.intervaloInactividad = setInterval(() => {
      // Doble comprobación: si el juego terminó, detener el intervalo
      if (estadoGlobalDamas.juegoTerminadoFlag) {
        detenerTemporizador();
        return;
      }

      if (estadoGlobalDamas.turnoActualDamas !== "humano") {
        return;
      }

      estadoGlobalDamas.tiempoRestante -= 1000;
      actualizarDisplayTiempo();

      if (estadoGlobalDamas.tiempoRestante <= 0) {
        console.log("Tiempo agotado - Jugador pierde");
        detenerTemporizador();
        estadoGlobalDamas.tiempoRestante = 0;
        actualizarDisplayTiempo();

        // Marcar como terminado ANTES de mostrar el modal
        estadoGlobalDamas.juegoTerminadoFlag = true;

        mostrarModalFin(false);
      }
    }, 1000);
  }
  // ======================================================================
  // INICIALIZAR TABLERO
  // ======================================================================
  function generarTableroInicialDamas() {
    estadoGlobalDamas.matrizDamas = Array.from({ length: 8 }, () =>
      Array(8).fill(null),
    );

    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 8; c++)
        if ((r + c) % 2 === 1)
          estadoGlobalDamas.matrizDamas[r][c] = { dueño: "top", rey: false };

    for (let r = 5; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if ((r + c) % 2 === 1)
          estadoGlobalDamas.matrizDamas[r][c] = { dueño: "bottom", rey: false };
  }

  // ======================================================================
  // SORTEO DE LADOS Y TURNO
  // ======================================================================

  function sortearColoresYTurno() {
    estadoGlobalDamas.colorHumano = Math.random() < 0.5 ? "blancas" : "negras";

    // El que tiene blancas empieza
    estadoGlobalDamas.turnoActualDamas =
      estadoGlobalDamas.colorHumano === "blancas" ? "humano" : "ia";
  }

  function realizarSorteoColores() {
    estadoGlobalDamas.colorHumano = Math.random() < 0.5 ? "blancas" : "negras";

    estadoGlobalDamas.turnoActualDamas =
      estadoGlobalDamas.colorHumano === "blancas" ? "humano" : "ia";

    estadoGlobalDamas.ladoHumanoAsignado =
      estadoGlobalDamas.colorHumano === "blancas" ? "bottom" : "top";

    estadoGlobalDamas.sorteoRealizado = true;

    const res = document.getElementById("resultado-sorteo");
    res.textContent =
      estadoGlobalDamas.colorHumano === "blancas"
        ? t("damas.config.result.white")
        : t("damas.config.result.black");
  }

  // ======================================================================
  // DIBUJAR TABLERO
  // ======================================================================
  function dibujarTableroDamas() {
    tableroDamasPrincipal.innerHTML = "";

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const celda = document.createElement("div");
        celda.className =
          "celda-damas " + ((r + c) % 2 === 0 ? "clara-damas" : "oscura-damas");
        celda.dataset.r = r;
        celda.dataset.c = c;

        if ((r + c) % 2 === 1) {
          const pieza = estadoGlobalDamas.matrizDamas[r][c];
          const dot = document.createElement("div");
          dot.className = "dot-pieza";

          if (pieza) {
            const esHumano =
              pieza.dueño === estadoGlobalDamas.ladoHumanoAsignado;

            const humanoEsBlanco = estadoGlobalDamas.colorHumano === "blancas";

            if (esHumano) {
              dot.classList.add(humanoEsBlanco ? "pieza-humano" : "pieza-ia");
            } else {
              dot.classList.add(humanoEsBlanco ? "pieza-ia" : "pieza-humano");
            }

            if (pieza.rey) {
              dot.classList.add("rey-damas");
              if (!dot.querySelector(".corona-simbolo")) {
                const corona = document.createElement("div");
                corona.className = "corona-simbolo";
                corona.textContent = "♔";
                dot.appendChild(corona);
              }
            }
          } else {
            dot.style.background = "transparent";
            dot.style.cursor = "default";
          }

          if (
            estadoGlobalDamas.seleccionActualDamas &&
            estadoGlobalDamas.seleccionActualDamas.r === r &&
            estadoGlobalDamas.seleccionActualDamas.c === c
          ) {
            dot.style.outline = "4px solid #ffd700";
          }

          celda.addEventListener("click", () => {
            manejarClickPiezaDamas(r, c);
          });

          celda.appendChild(dot);
        }

        tableroDamasPrincipal.appendChild(celda);
      }
    }
    actualizarPanelInfoDamas();
  }

  // ======================================================================
  // SELECCIÓN Y MOVIMIENTOS
  // ======================================================================
  function initCustomSelect() {
    const customSelects = document.querySelectorAll(".custom-select");

    customSelects.forEach((container) => {
      const select = container.querySelector("select");
      const selected = container.querySelector(".select-selected");
      const optionsContainer = container.querySelector(".select-items");

      // Inicializar el texto del selected

      if (!select || !selected || !optionsContainer) return;
      selected.textContent = select.options[select.selectedIndex].text;

      // Llenar las opciones
      optionsContainer.innerHTML = "";
      Array.from(select.options).forEach((opt, idx) => {
        const div = document.createElement("div");
        div.textContent = opt.text;
        div.addEventListener("click", () => {
          select.selectedIndex = idx;
          selected.textContent = opt.text;
          optionsContainer.classList.add("select-hide");
        });
        optionsContainer.appendChild(div);
      });

      // Abrir/cerrar al click
      selected.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllSelects(selected);
        optionsContainer.classList.toggle("select-hide");
        selected.classList.toggle("select-arrow-active");
      });
    });

    function closeAllSelects(except) {
      document.querySelectorAll(".select-items").forEach((el) => {
        if (el.parentElement.querySelector(".select-selected") !== except) {
          el.classList.add("select-hide");
        }
      });

      document.querySelectorAll(".select-selected").forEach((el) => {
        if (el !== except) {
          el.classList.remove("select-arrow-active");
        }
      });
    }

    // Cerrar al hacer click fuera
    document.addEventListener("click", closeAllSelects);
  }

  // Inicializar al cargar la página
  document.addEventListener("DOMContentLoaded", initCustomSelect);

  function manejarClickPiezaDamas(r, c) {
    if (estadoGlobalDamas.juegoTerminadoFlag) return;
    if (estadoGlobalDamas.turnoActualDamas !== "humano") return;

    const seleccion = estadoGlobalDamas.seleccionActualDamas;

    if (seleccion) {
      const mov = estadoGlobalDamas.movimientosDisponiblesDamas.find(
        (m) => m.hacia.r === r && m.hacia.c === c,
      );
      if (mov) {
        ejecutarMovimientoDamas(mov);
        return;
      }
    }

    if (!clickSeguro()) return;

    const ficha = estadoGlobalDamas.matrizDamas[r][c];

    // Si se hace click en una ficha humana seleccionar
    if (ficha && ficha.dueño === estadoGlobalDamas.ladoHumanoAsignado) {
      estadoGlobalDamas.seleccionActualDamas = { r, c };

      const todasLasCapturas = buscarCapturasGeneralesDamas("humano");

      if (todasLasCapturas.length) {
        estadoGlobalDamas.movimientosDisponiblesDamas = todasLasCapturas.filter(
          (m) => m.desde.r === r && m.desde.c === c,
        );
      } else {
        estadoGlobalDamas.movimientosDisponiblesDamas =
          calcularMovimientosDesdeDamas(r, c);
      }

      if (!estadoGlobalDamas.movimientosDisponiblesDamas.length) {
        estadoGlobalDamas.seleccionActualDamas = null;
        return;
      }

      resaltarSeleccionDamas();
      return;
    }

    // Click en vacío sin movimiento válido limpiar selección
    estadoGlobalDamas.seleccionActualDamas = null;
    estadoGlobalDamas.movimientosDisponiblesDamas = [];
    dibujarTableroDamas();
  }

  function resaltarSeleccionDamas() {
    dibujarTableroDamas();

    if (!estadoGlobalDamas.mostrarSugerencias) return;

    estadoGlobalDamas.movimientosDisponiblesDamas.forEach((m) => {
      const id2 = indicePlanoDamas(m.hacia.r, m.hacia.c);
      const destino = tableroDamasPrincipal.children[id2];
      const s = document.createElement("div");
      s.className = "sugerencia-movimiento";
      if (m.capturas.length) s.classList.add("captura");

      s.addEventListener("click", (e) => {
        ejecutarMovimientoDamas(m);
        e.stopPropagation();
      });
      destino.appendChild(s);
    });
  }

  // ======================================================================
  // MOVER / CAPTURAR
  // ======================================================================
  function calcularMovimientosDesdeDamas(r, c) {
    const pieza = estadoGlobalDamas.matrizDamas[r][c];
    if (!pieza) return [];

    const mueveAbajo = pieza.dueño === "top" ? 1 : -1;
    const rey = pieza.rey;

    const direcciones = rey
      ? [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      : [
          [mueveAbajo, 1],
          [mueveAbajo, -1],
        ];

    const capturasTotales = [];

    function buscarSaltos(matriz, x, y, caps, reyAhora) {
      let encontro = false;
      const direccionesSaltos = reyAhora
        ? [
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
          ]
        : [
            [mueveAbajo, 1],
            [mueveAbajo, -1],
          ];

      for (const [dr, dc] of direccionesSaltos) {
        const mr = x + dr,
          mc = y + dc;
        const tr = x + 2 * dr,
          tc = y + 2 * dc;

        if (enLimiteDamas(mr, mc) && enLimiteDamas(tr, tc)) {
          const medio = matriz[mr][mc];
          const dest = matriz[tr][tc];

          if (
            medio &&
            medio.dueño !== matriz[x][y].dueño &&
            !dest &&
            !caps.some((c) => c.r === mr && c.c === mc)
          ) {
            encontro = true;
            const copia = clonarMatrizDamas(matriz);
            copia[tr][tc] = copia[x][y];
            copia[x][y] = null;
            copia[mr][mc] = null;

            const coronar =
              copia[tr][tc].rey ||
              (copia[tr][tc].dueño === "top" && tr === 7) ||
              (copia[tr][tc].dueño === "bottom" && tr === 0);
            if (coronar) copia[tr][tc].rey = true;

            const nuevasCaps = caps.concat([{ r: mr, c: mc }]);

            const rec = buscarSaltos(
              copia,
              tr,
              tc,
              nuevasCaps,
              copia[tr][tc].rey,
            );
            if (!rec) {
              capturasTotales.push({
                desde: { r, c },
                hacia: { r: tr, c: tc },
                capturas: nuevasCaps,
                reyDespues: coronar,
              });
            }
          }
        }
      }
      return encontro;
    }

    buscarSaltos(estadoGlobalDamas.matrizDamas, r, c, [], pieza.rey);

    if (capturasTotales.length) return capturasTotales;

    const movsSimples = [];
    for (const [dr, dc] of direcciones) {
      const nr = r + dr,
        nc = c + dc;
      if (enLimiteDamas(nr, nc) && !estadoGlobalDamas.matrizDamas[nr][nc]) {
        const coronar =
          pieza.rey ||
          (pieza.dueño === "top" && nr === 7) ||
          (pieza.dueño === "bottom" && nr === 0);
        movsSimples.push({
          desde: { r, c },
          hacia: { r: nr, c: nc },
          capturas: [],
          reyDespues: coronar,
        });
      }
    }
    return movsSimples;
  }

  function calcularMovimientosDesdeMatriz(matriz, r, c) {
    const backup = estadoGlobalDamas.matrizDamas;
    estadoGlobalDamas.matrizDamas = matriz;

    const res = calcularMovimientosDesdeDamas(r, c);

    estadoGlobalDamas.matrizDamas = backup;
    return res;
  }

  function ejecutarMovimientoDamas(mov) {
    if (estadoGlobalDamas.juegoTerminadoFlag) return;

    if (animacionEnCurso) return;

    const { desde, hacia, capturas, reyDespues } = mov;
    const pieza = estadoGlobalDamas.matrizDamas[desde.r][desde.c];

    // SONIDO
    if (!pieza.rey && reyDespues) {
      // Solo si NO era rey antes y se va a coronar
      sonidosDamas.coronar();
    } else if (capturas.length) {
      sonidosDamas.comer();
    } else {
      sonidosDamas.movimiento();
    }

    // Renicio temporizador despues de movimiento jugador
    // Solo reiniciamos si fue el humano quien movió
    if (estadoGlobalDamas.turnoActualDamas === "humano") {
      reiniciarTemporizador();
    }

    estadoGlobalDamas.seleccionActualDamas = null;

    const idxDesde = indicePlanoDamas(desde.r, desde.c);
    const celdaDesde = tableroDamasPrincipal.children[idxDesde];
    const ficha = celdaDesde.querySelector(".dot-pieza");

    if (ficha) {
      ficha.classList.add("ficha-animada");
      ficha.style.zIndex = "100";
      animacionEnCurso = true;

      if (capturas.length > 0) {
        // Capturas (simples o múltiples)
        animarCapturasConRuta(desde, capturas, ficha, () => {
          finalizarMovimiento();
        });
      } else {
        // Movimiento simple
        animarMovimientoSimple(desde, hacia, ficha, () => {
          finalizarMovimiento();
        });
      }
    }

    function finalizarMovimiento() {
      // Actualizar matriz
      estadoGlobalDamas.matrizDamas[hacia.r][hacia.c] = pieza;
      estadoGlobalDamas.matrizDamas[desde.r][desde.c] = null;

      // Actualizar contadores
      if (capturas.length) {
        if (estadoGlobalDamas.turnoActualDamas === "humano") {
          estadoGlobalDamas.capturasHumano += capturas.length;
        } else {
          estadoGlobalDamas.capturasIA += capturas.length;
        }

        capturas.forEach((cap) => {
          estadoGlobalDamas.matrizDamas[cap.r][cap.c] = null;
        });
      }

      // Limpiar animación
      animacionEnCurso = false;

      // Redibujar
      dibujarTableroDamas();

      // Continuar
      continuarDespuesDeCapturas();
    }

    function continuarDespuesDeCapturas() {
      if (reyDespues && !pieza.rey) {
        pieza.rey = true;
        efectoCoronacion(hacia.r, hacia.c);
      }

      estadoGlobalDamas.seleccionActualDamas = null;
      estadoGlobalDamas.movimientosDisponiblesDamas = [];

      // Verificar capturas encadenadas
      if (capturas.length && estadoGlobalDamas.turnoActualDamas === "humano") {
        const nuevas = calcularMovimientosDesdeDamas(hacia.r, hacia.c).filter(
          (m) => m.capturas.length,
        );
        if (nuevas.length) {
          estadoGlobalDamas.seleccionActualDamas = { r: hacia.r, c: hacia.c };
          estadoGlobalDamas.movimientosDisponiblesDamas = nuevas;
          resaltarSeleccionDamas();
          return;
        }
      }

      terminarTurnoDamas();
    }
  }

  // ======================================================================
  // FUNCIONES AUXILIARES PARA LA IA MEJORADA
  // ======================================================================

  function simularMovimiento(mov) {
    const m = clonarMatrizDamas(estadoGlobalDamas.matrizDamas);

    const p = m[mov.desde.r][mov.desde.c];
    m[mov.desde.r][mov.desde.c] = null;
    m[mov.hacia.r][mov.hacia.c] = { ...p };

    mov.capturas.forEach((c) => {
      m[c.r][c.c] = null;
    });

    if (mov.reyDespues) m[mov.hacia.r][mov.hacia.c].rey = true;

    return m;
  }

  function estaEnPeligroInmediato(matriz, pos, ladoIA) {
    const { r, c } = pos;
    const ficha = matriz[r][c];
    if (!ficha) return false;

    // Verificar en las 4 direcciones (dependiendo si es rey o no)
    const direcciones = ficha.rey
      ? [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      : ladoIA === "top"
        ? [
            [1, 1],
            [1, -1],
          ] // top se mueve hacia abajo
        : [
            [-1, 1],
            [-1, -1],
          ]; // bottom se mueve hacia arriba

    for (const [dr, dc] of direcciones) {
      const mr = r + dr;
      const mc = c + dc;
      const tr = r + 2 * dr;
      const tc = c + 2 * dc;

      if (enLimiteDamas(mr, mc) && enLimiteDamas(tr, tc)) {
        const medio = matriz[mr][mc];
        const destino = matriz[tr][tc];

        if (medio && medio.dueño !== ladoIA && !destino) {
          // ¡Esta ficha puede ser capturada!
          return true;
        }
      }
    }

    return false;
  }

  function esPosicionPeligrosa(pos, ladoIA) {
    const { r, c } = pos;

    // Las esquinas pueden ser trampas para reyes
    if (
      (r === 0 && c === 0) ||
      (r === 0 && c === 7) ||
      (r === 7 && c === 0) ||
      (r === 7 && c === 7)
    ) {
      return true;
    }

    // Posiciones en los bordes laterales pueden ser peligrosas
    if (c === 0 || c === 7) {
      // Solo una dirección de ataque posible
      return true;
    }

    return false;
  }

  function contarFichasAliadasCercanas(matriz, pos, ladoIA) {
    let count = 0;
    const { r, c } = pos;

    // Verificar en un radio de 2 casillas
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = r + dr;
        const nc = c + dc;

        if (enLimiteDamas(nr, nc) && !(dr === 0 && dc === 0)) {
          const ficha = matriz[nr][nc];
          if (ficha && ficha.dueño === ladoIA) {
            count++;
          }
        }
      }
    }

    return count;
  }

  function contarPiezasExpuestas(matriz, ladoIA) {
    let expuestas = 0;

    // Buscar todas las fichas del lado IA
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const ficha = matriz[r][c];
        if (ficha && ficha.dueño === ladoIA) {
          if (estaEnPeligroInmediato(matriz, { r, c }, ladoIA)) {
            expuestas++;
          }
        }
      }
    }

    return expuestas;
  }

  function creaAmenazaDoble(matriz, pos, ladoIA) {
    const { r, c } = pos;
    const ficha = matriz[r][c];
    if (!ficha) return false;

    let amenazasDobles = 0;

    // Para reyes, verificar las 4 direcciones
    const direcciones = ficha.rey
      ? [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      : ladoIA === "top"
        ? [
            [1, 1],
            [1, -1],
          ]
        : [
            [-1, 1],
            [-1, -1],
          ];

    for (const [dr, dc] of direcciones) {
      const mr = r + dr;
      const mc = c + dc;
      const tr = r + 2 * dr;
      const tc = c + 2 * dc;

      if (enLimiteDamas(mr, mc) && enLimiteDamas(tr, tc)) {
        const medio = matriz[mr][mc];
        const destino = matriz[tr][tc];

        if (medio && medio.dueño !== ladoIA && !destino) {
          amenazasDobles++;

          // Verificar si desde esta posición podemos amenazar otra ficha
          if (ficha.rey) {
            // Para reyes, verificar si podemos amenazar otra ficha desde tr, tc
            for (const [dr2, dc2] of direcciones) {
              const mr2 = tr + dr2;
              const mc2 = tc + dc2;
              const tr2 = tr + 2 * dr2;
              const tc2 = tc + 2 * dc2;

              if (enLimiteDamas(mr2, mc2) && enLimiteDamas(tr2, tc2)) {
                const medio2 = matriz[mr2][mc2];
                const destino2 = matriz[tr2][tc2];

                if (medio2 && medio2.dueño !== ladoIA && !destino2) {
                  return true; // ¡Amenaza doble encontrada!
                }
              }
            }
          }
        }
      }
    }

    // Si tenemos múltiples amenazas desde la misma posición
    return amenazasDobles > 1;
  }

  function bloqueaFichasPropias(matriz, nuevaPos, viejaPos, ladoIA) {
    const { r: nuevaR, c: nuevaC } = nuevaPos;
    const { r: viejaR, c: viejaC } = viejaPos;

    // Verificar si la posición vieja bloqueaba el avance de otras fichas
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const ficha = matriz[r][c];
        if (ficha && ficha.dueño === ladoIA && !ficha.rey) {
          // Verificar si esta ficha ahora está bloqueada
          const direccion = ladoIA === "top" ? 1 : -1;

          // Posiciones de avance posibles
          const avance1 = { r: r + direccion, c: c + 1 };
          const avance2 = { r: r + direccion, c: c - 1 };

          // Si la nueva posición bloquea uno de estos avances
          if (
            (avance1.r === nuevaR && avance1.c === nuevaC) ||
            (avance2.r === nuevaR && avance2.c === nuevaC)
          ) {
            // Verificar si estaba libre antes
            const estabaLibre1 = avance1.r !== viejaR || avance1.c !== viejaC;
            const estabaLibre2 = avance2.r !== viejaR || avance2.c !== viejaC;

            if (
              (avance1.r === nuevaR && avance1.c === nuevaC && estabaLibre1) ||
              (avance2.r === nuevaR && avance2.c === nuevaC && estabaLibre2)
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  // ======================================================================
  // IA MEJORADA PARA NIVEL DIFÍCIL
  // ======================================================================

  function evaluarMovimientoIA_Mejorado(mov) {
    let score = 0;
    const esTop = estadoGlobalDamas.ladoHumanoAsignado === "top";
    const ladoIA = esTop ? "top" : "bottom";

    if (mov.capturas.length > 0) {
      score += mov.capturas.length * 1000;

      const reyesCapturados = mov.capturas.filter((cap) => {
        const pieza = estadoGlobalDamas.matrizDamas[cap.r][cap.c];
        return pieza && pieza.rey;
      }).length;
      score += reyesCapturados * 2000;

      if (mov.capturas.length > 1) {
        score += (mov.capturas.length - 1) * 500;
      }
    }

    if (mov.reyDespues) {
      score += 450;
    }

    if (mov.capturas.length === 0) {
      if (!mov.reyDespues) {
        const pieza = estadoGlobalDamas.matrizDamas[mov.desde.r][mov.desde.c];
        if (!pieza.rey) {
          const filaDestino = mov.hacia.r;

          if (ladoIA === "top") {
            const progreso = filaDestino;
            score += progreso * 8;

            if (filaDestino >= 5) score += 50;
            if (filaDestino === 6) score += 100;
            if (filaDestino === 7) score += 200;
          } else {
            const progreso = 7 - filaDestino;
            score += progreso * 8;

            if (filaDestino <= 2) score += 50;
            if (filaDestino === 1) score += 100;
            if (filaDestino === 0) score += 200;
          }
        }
      }
    }

    const copia = simularMovimiento(mov);
    const posicionDestino = mov.hacia;

    if (estaEnPeligroInmediato(copia, posicionDestino, ladoIA)) {
      if (mov.capturas.length === 0) {
        score -= 600;
      } else {
        score -= 100;
      }
    }

    if (mov.capturas.length === 0) {
      const piezaOriginal =
        estadoGlobalDamas.matrizDamas[mov.desde.r][mov.desde.c];
      if (piezaOriginal.rey) {
        score += 50;

        if (posicionDestino.c === 0 || posicionDestino.c === 7) {
          score -= 30;
        }

        const distanciaCentro = Math.abs(posicionDestino.c - 3.5);
        score -= distanciaCentro * 5;
      }
    }

    const fichasAliadasCercanas = contarFichasAliadasCercanas(
      copia,
      posicionDestino,
      ladoIA,
    );
    score += fichasAliadasCercanas * 15;

    if (mov.reyDespues) {
      const movimientosFuturos = calcularMovimientosDesdeMatriz(
        copia,
        posicionDestino.r,
        posicionDestino.c,
      );
      const capturasFuturas = movimientosFuturos.filter(
        (m) => m.capturas.length > 0,
      ).length;
      score += capturasFuturas * 100;
    }

    if (mov.capturas.length === 0) {
      const piezasExpuestas = contarPiezasExpuestas(copia, ladoIA);
      score -= piezasExpuestas * 80;
    }

    if (creaAmenazaDoble(copia, posicionDestino, ladoIA)) {
      score += 120;
    }

    if (
      mov.capturas.length === 0 &&
      bloqueaFichasPropias(copia, posicionDestino, mov.desde, ladoIA)
    ) {
      score -= 70;
    }

    return score;
  }

  function evaluarMovimientoIA(mov) {
    return evaluarMovimientoIA_Mejorado(mov);
  }

  function piezaQuedaEnPeligro(matriz, pos) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = matriz[r][c];
        if (!p || p.dueño === estadoGlobalDamas.ladoHumanoAsignado) continue;

        const caps = calcularMovimientosDesdeMatriz(matriz, r, c);

        if (
          caps.some((m) =>
            m.capturas.some((cap) => cap.r === pos.r && cap.c === pos.c),
          )
        ) {
          return true;
        }
      }
    return false;
  }

  // ======================================================================
  // ANIMACIONES SIMPLIFICADAS
  // ======================================================================

  function animarCapturasConRuta(desde, capturas, ficha, callback) {
    const posiciones = [];
    let posActual = { r: desde.r, c: desde.c };

    // Calcular cada destino de salto
    capturas.forEach((cap) => {
      const dr = Math.sign(cap.r - posActual.r);
      const dc = Math.sign(cap.c - posActual.c);

      const destinoSalto = {
        r: posActual.r + dr * 2,
        c: posActual.c + dc * 2,
      };

      posiciones.push({
        captura: cap,
        destino: destinoSalto,
      });

      posActual = { ...destinoSalto };
    });

    // Animar paso a paso
    animarPasosDeCaptura(posiciones, 0, ficha, callback);
  }

  function animarPasosDeCaptura(posiciones, pasoIndex, ficha, callback) {
    if (pasoIndex >= posiciones.length) {
      callback();
      return;
    }

    const paso = posiciones[pasoIndex];

    // Mover al destino del salto
    animarMovimientoASalto(ficha, paso.destino, () => {
      // Eliminar ficha capturada
      const idxCaptura = indicePlanoDamas(paso.captura.r, paso.captura.c);
      const celdaCaptura = tableroDamasPrincipal.children[idxCaptura];
      const fichaCapturada = celdaCaptura.querySelector(".dot-pieza");

      if (fichaCapturada) {
        fichaCapturada.classList.add("capturada");
        setTimeout(() => {
          fichaCapturada.remove();
          // Siguiente paso
          animarPasosDeCaptura(posiciones, pasoIndex + 1, ficha, callback);
        }, 300);
      } else {
        animarPasosDeCaptura(posiciones, pasoIndex + 1, ficha, callback);
      }
    });
  }

  function animarMovimientoASalto(ficha, destino, callback) {
    const celdaActual = ficha.parentElement;
    const idxDestino = indicePlanoDamas(destino.r, destino.c);
    const celdaDestino = tableroDamasPrincipal.children[idxDestino];

    if (!celdaActual || !celdaDestino) {
      console.error("Celda no encontrada");
      callback();
      return;
    }

    // Obtener dimensiones de las celdas
    const cellSize = celdaActual.offsetWidth; // Todas las celdas son del mismo tamaño

    // Calcular desplazamiento en celdas
    const dx = (destino.c - parseInt(celdaActual.dataset.c)) * cellSize;
    const dy = (destino.r - parseInt(celdaActual.dataset.r)) * cellSize;

    // Aplicar animación
    ficha.style.transition = `transform ${DAMAS.ANIMACION_MS}ms ease-in-out`;
    ficha.style.transform = `translate(${dx}px, ${dy}px)`;

    setTimeout(() => {
      ficha.style.transition = "none";
      ficha.style.transform = "translate(0, 0)";

      // Mover la ficha al DOM de destino
      celdaDestino.appendChild(ficha);

      callback();
    }, DAMAS.ANIMACION_MS);
  }

  function animarMovimientoSimple(desde, hacia, ficha, callback) {
    const idxDestino = indicePlanoDamas(hacia.r, hacia.c);
    const celdaDestino = tableroDamasPrincipal.children[idxDestino];
    const celdaActual = ficha.parentElement;

    if (!celdaActual || !celdaDestino) {
      console.error("Celda no encontrada");
      callback();
      return;
    }

    // Obtener dimensiones de las celdas
    const cellSize = celdaActual.offsetWidth; // Todas las celdas son del mismo tamaño

    // Calcular desplazamiento en celdas
    const dx = (hacia.c - desde.c) * cellSize;
    const dy = (hacia.r - desde.r) * cellSize;

    ficha.style.transition = "transform 1000ms ease-in-out";
    ficha.style.transform = `translate(${dx}px, ${dy}px)`;

    setTimeout(() => {
      ficha.style.transition = "none";
      ficha.style.transform = "translate(0, 0)";

      // Mover la ficha al DOM de destino
      celdaDestino.appendChild(ficha);

      callback();
    }, 1000);
  }

  function efectoCoronacion(r, c) {
    const idx = indicePlanoDamas(r, c);
    const celda = tableroDamasPrincipal.children[idx];
    const ficha = celda.querySelector(".dot-pieza");

    if (!ficha) return;

    const efecto = document.createElement("div");
    efecto.className = "efecto-coronacion";
    efecto.style.position = "absolute";
    efecto.style.width = "100%";
    efecto.style.height = "100%";
    efecto.style.borderRadius = "50%";
    efecto.style.pointerEvents = "none";
    efecto.style.zIndex = "50";

    celda.appendChild(efecto);

    efecto.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(2.5)", opacity: 0 },
      ],
      { duration: 1200, easing: "ease-out" },
    );

    ficha.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.2)" },
        { transform: "scale(1)" },
      ],
      { duration: 800, easing: "ease-in-out" },
    );

    ficha.classList.add("rey-damas");

    if (!ficha.querySelector(".corona-simbolo")) {
      const corona = document.createElement("div");
      corona.className = "corona-simbolo";
      corona.textContent = "♔";
      ficha.appendChild(corona);
    }

    setTimeout(() => efecto.remove(), 1200);
  }

  function salirAlMenuPrincipal() {
    location.href = "../../index.html";
  }

  // ======================================================================
  // FIN DE TURNO / IA / GANADOR
  // ======================================================================
  function terminarTurnoDamas() {
    if (animacionEnCurso) return;

    evaluarGanadorDamas();

    // Si el juego terminó, NO continuar con el cambio de turno
    if (estadoGlobalDamas.juegoTerminadoFlag) {
      detenerTemporizador(); // Asegurar que el temporizador se detiene
      return;
    }

    // Cambiar el turno SOLO si el juego no ha terminado
    estadoGlobalDamas.turnoActualDamas =
      estadoGlobalDamas.turnoActualDamas === "humano" ? "ia" : "humano";
    actualizarPanelInfoDamas();

    // Control del temporizador según el turno
    if (estadoGlobalDamas.turnoActualDamas === "humano") {
      reiniciarTemporizador();
      iniciarTemporizador();
    } else {
      detenerTemporizador();
    }

    if (estadoGlobalDamas.turnoActualDamas === "ia") {
      setTimeout(movimientoIA_Damas, DAMAS.IA_DELAY_MS);
    }
  }

  function evaluarGanadorDamas() {
    let humano = 0,
      ia = 0;
    for (let r = 0; r < DAMAS.FILAS; r++)
      for (let c = 0; c < 8; c++) {
        const p = estadoGlobalDamas.matrizDamas[r][c];
        if (!p) continue;
        p.dueño === estadoGlobalDamas.ladoHumanoAsignado ? humano++ : ia++;
      }

    if (humano === 0) {
      estadoGlobalDamas.juegoTerminadoFlag = true;
      document.getElementById("ganador-info").textContent = t("damas.ai");
      const mensajeEstado = document.getElementById("mensaje-estado-damas");
      if (mensajeEstado) {
        mensajeEstado.textContent = t("damas.youLose");
      }

      mostrarModalFin(false);
    } else if (ia === 0) {
      estadoGlobalDamas.juegoTerminadoFlag = true;
      document.getElementById("ganador-info").textContent = t("damas.you");
      const mensajeEstado = document.getElementById("mensaje-estado-damas");
      if (mensajeEstado) {
        mensajeEstado.textContent = t("damas.youWin");
      }

      mostrarModalFin(true);
    }
  }

  function mostrarModalFin(gano) {
    // DETENER TEMPORIZADOR INMEDIATAMENTE
    detenerTemporizador();

    // También asegurar que el estado refleja que el juego terminó
    estadoGlobalDamas.juegoTerminadoFlag = true;

    const modal = document.getElementById("modal-fin-damas");
    const icono = document.getElementById("icono-resultado");
    const mensaje = document.getElementById("mensaje-resultado");

    modal.style.display = "flex";

    if (gano) {
      icono.textContent = "🏆";
      mensaje.textContent = t("damas.youWin");
      sonidosDamas.ganar();
    } else {
      icono.textContent = "❌";
      mensaje.textContent = t("damas.youLose");
      sonidosDamas.perder();
    }

    const btnSalirFin = document.getElementById("btn-salir-fin");
    btnSalirFin.onclick = () => {
      document.getElementById("modal-fin-damas").style.display = "none";
      salirAlMenuPrincipal();
    };
  }

  // ======================================================================
  // IA MEJORADA - FUNCIÓN PRINCIPAL
  // ======================================================================

  function movimientoIA_Damas() {
    if (estadoGlobalDamas.juegoTerminadoFlag) return;

    const movs = [];

    // Primero, verificar si hay capturas disponibles para la IA
    const capturasDisponibles = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = estadoGlobalDamas.matrizDamas[r][c];
        if (!p || p.dueño === estadoGlobalDamas.ladoHumanoAsignado) continue;

        const movimientosDesdeCasilla = calcularMovimientosDesdeDamas(r, c);
        movimientosDesdeCasilla.forEach((m) => {
          if (m.capturas.length > 0) {
            capturasDisponibles.push(m);
          }
          movs.push(m);
        });
      }
    }

    if (!movs.length) return;

    let choice;

    const movimientosPermitidos =
      capturasDisponibles.length > 0 ? capturasDisponibles : movs;

    if (estadoGlobalDamas.nivelIA === "dificil") {
      const movimientosEvaluados = movimientosPermitidos.map((m) => ({
        m,
        score: evaluarMovimientoIA_Mejorado(m),
      }));

      // Ordenar por score (mayor primero)
      movimientosEvaluados.sort((a, b) => b.score - a.score);
      const mejores = movimientosEvaluados.slice(0, 3); // Tomar los 3 mejores

      if (Math.random() < 0.8 || mejores.length === 1) {
        choice = mejores[0].m;
      } else {
        const indiceAleatorio = Math.floor(
          Math.random() * Math.min(3, mejores.length),
        );
        choice = mejores[indiceAleatorio].m;
      }
    } else {
      // Nivel normal

      choice =
        movimientosPermitidos[
          Math.floor(Math.random() * movimientosPermitidos.length)
        ];
    }

    estadoGlobalDamas.seleccionActualDamas = choice.desde;
    dibujarTableroDamas();

    setTimeout(() => ejecutarMovimientoDamas(choice), 900);
  }

  // ======================================================================
  // PANEL INFO
  // ======================================================================
  function actualizarPanelInfoDamas() {
    document.getElementById("turno-info").textContent =
      estadoGlobalDamas.turnoActualDamas === "humano"
        ? t("damas.you")
        : t("damas.ai");

    const caps = buscarCapturasGeneralesDamas(
      estadoGlobalDamas.turnoActualDamas,
    );
    document.getElementById("captura-obligatoria-info").textContent =
      caps.length ? caps.length : "—";

    document.getElementById("capturas-humano-info").textContent =
      estadoGlobalDamas.capturasHumano;
    document.getElementById("capturas-ia-info").textContent =
      estadoGlobalDamas.capturasIA;
    document.getElementById("color-humano-info").textContent =
      estadoGlobalDamas.colorHumano === "blancas"
        ? t("damas.white")
        : t("damas.black");
  }

  function buscarCapturasGeneralesDamas(turno) {
    const res = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = estadoGlobalDamas.matrizDamas[r][c];
        if (!p) continue;
        const esHum = p.dueño === estadoGlobalDamas.ladoHumanoAsignado;
        if ((turno === "humano" && esHum) || (turno === "ia" && !esHum)) {
          const m = calcularMovimientosDesdeDamas(r, c).filter(
            (x) => x.capturas.length,
          );
          res.push(...m);
        }
      }
    return res;
  }

  // ======================================================================
  // RESET
  // ======================================================================
  function resetGameDamasUltra() {
    generarTableroInicialDamas();
    estadoGlobalDamas.ladoHumanoAsignado = "bottom";

    // Actualizar color humano de forma segura
    const colorHumanoInfo = document.getElementById("color-humano-info");
    if (colorHumanoInfo) {
      colorHumanoInfo.textContent = t("damas.bottom");
    }

    estadoGlobalDamas.seleccionActualDamas = null;
    estadoGlobalDamas.movimientosDisponiblesDamas = [];
    estadoGlobalDamas.juegoTerminadoFlag = false;
    estadoGlobalDamas.capturasHumano = 0;
    estadoGlobalDamas.capturasIA = 0;

    // Limpiar ganador-info de forma segura
    const ganadorInfo = document.getElementById("ganador-info");
    if (ganadorInfo) {
      ganadorInfo.textContent = "";
    }

    dibujarTableroDamas();

    if (estadoGlobalDamas.turnoActualDamas === "ia") {
      setTimeout(movimientoIA_Damas, 500);
    }
  }
  // ======================================================================
  // RESET COMPLETO DEL JUEGO
  // ======================================================================
  function reiniciarJuegoDamas() {
    // Detener temporizador al reniciar
    detenerTemporizador();
    const estado = JuegoDamas.estado;

    estado.tiempoRestante = 300000;
    estado.ladoHumanoAsignado = null;
    estado.colorHumano = null;
    estado.turnoActualDamas = null;
    estado.seleccionActualDamas = null;
    estado.movimientosDisponiblesDamas = [];
    estado.tableroGiradoFlag = false;
    estado.juegoTerminadoFlag = false;
    estado.capturasHumano = 0;
    estado.capturasIA = 0;
    estado.mostrarSugerencias = true;
    estado.sorteoRealizado = false;
    estado.nivelIA = "normal";

    // Ocultar tablero y modal de fin
    document.getElementById("juego-damas-contenedor").style.display = "none";
    document.getElementById("modal-fin-damas").style.display = "none";

    // Mostrar modal de configuración inicial
    document.getElementById("modal-config-damas").style.display = "flex";

    // Limpiar tablero y paneles de info
    const tableroDamas = document.getElementById("tablero-damas");
    if (tableroDamas) tableroDamas.innerHTML = "";

    const colorHumano = document.getElementById("color-humano-info");
    if (colorHumano) colorHumano.textContent = "—";

    const turnoInfo = document.getElementById("turno-info");
    if (turnoInfo) turnoInfo.textContent = "—";

    const ganadorInfo = document.getElementById("ganador-info");
    if (ganadorInfo) ganadorInfo.textContent = "";

    const capturaObligatoria = document.getElementById(
      "captura-obligatoria-info",
    );
    if (capturaObligatoria) capturaObligatoria.textContent = "—";

    const capturasHumano = document.getElementById("capturas-humano-info");
    if (capturasHumano) capturasHumano.textContent = "0";

    const capturasIA = document.getElementById("capturas-ia-info");
    if (capturasIA) capturasIA.textContent = "0";

    // Resetear estado de JuegoDamas
    generarTableroInicialDamas();

    // Inicialización segura de inputs del modal
    document.getElementById("check-sugerencias").checked = true;
    document.getElementById("resultado-sorteo").textContent = "—";
  }

  // ======================================================================
  // INICIALIZACIÓN
  // ======================================================================
  let origenConfirmExit = null;
  // valores posibles: "config" | "fin"

  document
    .getElementById("boton-salir-config")
    .addEventListener("click", () => {
      origenConfirmExit = "config";

      document.getElementById("modal-config-damas").style.display = "none";
      document.getElementById("modal-confirm-exit").style.display = "flex";
    });

  // ======================================================================
  // INICIALIZACIÓN - VERSIÓN SIMPLIFICADA
  // ======================================================================

  // ======================================================================
  // INICIALIZACIÓN - VERSIÓN SIMPLIFICADA (DENTRO DE JuegoDamas)
  // ======================================================================
  function init() {
    initLanguage();
    document.getElementById("salirDamas").innerText = t("damas.exit");

    // Eventos del modal de fin
    document
      .getElementById("boton-reiniciar-modal")
      .addEventListener("click", () => {
        document.getElementById("modal-fin-damas").style.display = "none";
        reiniciarJuegoDamas();
      });

    document.getElementById("btn-salir-fin").addEventListener("click", () => {
      document.getElementById("modal-fin-damas").style.display = "none";
      salirAlMenuPrincipal();
    });

    // Eventos del botón "Salir" durante la partida
    document.getElementById("salirDamas").addEventListener("click", () => {
      document.getElementById("modal-confirm-exit").style.display = "flex";
    });

    // Eventos del modal de confirmación
    document.getElementById("btn-confirm-yes").addEventListener("click", () => {
      document.getElementById("modal-confirm-exit").style.display = "none";
      if (origenConfirmExit === "config") {
        salirAlMenuPrincipal();
      } else if (origenConfirmExit === "juego") {
        const estado = JuegoDamas.estado;
        estado.juegoTerminadoFlag = true;
        const ganadorInfo = document.getElementById("ganador-info");
        if (ganadorInfo) ganadorInfo.textContent = t("damas.ai");
        mostrarModalFin(false);
      }
    });

    document.getElementById("btn-confirm-no").addEventListener("click", () => {
      document.getElementById("modal-confirm-exit").style.display = "none";
      if (origenConfirmExit === "config") {
        document.getElementById("modal-config-damas").style.display = "flex";
      }
    });

    // Evento para el botón "Salir" de la configuración inicial
    document
      .getElementById("boton-salir-config")
      .addEventListener("click", () => {
        origenConfirmExit = "config";
        document.getElementById("modal-config-damas").style.display = "none";
        document.getElementById("modal-confirm-exit").style.display = "flex";
      });

    // Evento específico para cuando se hace click en "Salir" durante la partida
    document.getElementById("salirDamas").addEventListener("click", () => {
      origenConfirmExit = "juego";
      document.getElementById("modal-confirm-exit").style.display = "flex";
    });

    // EVENTO PARA EL BOTÓN JUGAR
    document
      .getElementById("boton-jugar-config")
      .addEventListener("click", () => {
        const estado = estadoGlobalDamas;

        if (!estado.sorteoRealizado) {
          if (typeof window.mostrarAvisoDamas === "function") {
            window.mostrarAvisoDamas(t("damas.warning.mustShuffle"));
          } else {
            alert(t("damas.warning.mustShuffle")); // Fallback por si acaso
          }
          return;
        }

        estado.nivelIA = document.getElementById("nivel-ia").value;

        document.getElementById("modal-config-damas").style.display = "none";
        document.getElementById("juego-damas-contenedor").style.display =
          "block";

        dibujarTableroDamas();

        // Iniciar temporizador al iniciar partida
        reiniciarTemporizador();
        iniciarTemporizador();

        if (estado.turnoActualDamas === "ia") {
          setTimeout(movimientoIA_Damas, 500);
        }
      });

    document
      .getElementById("boton-reinicio-damas")
      ?.addEventListener("click", resetGameDamasUltra);

    resetGameDamasUltra();
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    reset: resetGameDamasUltra,
    realizarSorteoColores,
    dibujarTableroDamas,
    movimientoIA_Damas,
    estado: estadoGlobalDamas,
  };
})();

// ======================================================================
// MODAL INSTRUCCIONES
// =============================================================

document
  .getElementById("boton-instrucciones-damas")
  .addEventListener("click", () => {
    document.getElementById("modal-instrucciones-damas").style.display = "flex";
  });

document
  .getElementById("boton-cerrar-instrucciones")
  .addEventListener("click", () => {
    document.getElementById("modal-instrucciones-damas").style.display = "none";
  });

document
  .getElementById("boton-sortear-colores")
  .addEventListener("click", () => {
    JuegoDamas.realizarSorteoColores();
  });

document.getElementById("check-sugerencias").addEventListener("change", (e) => {
  JuegoDamas.estado.mostrarSugerencias = e.target.checked;
});

let ultimoClickTiempo = 0;

function clickSeguro() {
  const ahora = Date.now();
  if (ahora - ultimoClickTiempo < 250) return false;
  ultimoClickTiempo = ahora;
  return true;
}

// Funcion de avisos
function mostrarAvisoDamas(texto) {
  const modal = document.getElementById("modal-aviso-damas");
  const mensaje = document.getElementById("modal-aviso-texto");

  mensaje.textContent = texto;
  modal.style.display = "flex";

  document.getElementById("boton-cerrar-aviso").onclick = () => {
    modal.style.display = "none";
  };
}
