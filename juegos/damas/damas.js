// ================================
// Juego de Damas
// ================================

function t(key, params = {}) {
  let text = window.translations?.[key] || key;

  // Reemplazar parámetros en el formato {nombre}
  if (params && Object.keys(params).length > 0) {
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`{${paramKey}}`, "g"), params[paramKey]);
    });
  }

  return text;
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
      audio.volume = key === "movimiento" ? 1 : key === "comer" ? 0.9 : 1;
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
  // ESTRUCTURA DE DATOS PARA ESTADÍSTICAS DE JUGADORES
  // ======================================================================
  const ESTADISTICAS_KEYS = {
    VICTORIAS_NORMAL: "victoriasNormal",
    DERROTAS_NORMAL: "derrotasNormal",
    VICTORIAS_DIFICIL: "victoriasDificil",
    DERROTAS_DIFICIL: "derrotasDificil",
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
  // SELECTOR PERSONALIZADO SIMPLIFICADO
  // ======================================================================
  function initCustomSelect() {
    const container = document.getElementById("nivel-ia-container");
    const select = document.getElementById("nivel-ia");
    const selected = document.getElementById("nivel-ia-selected");
    const optionsContainer = document.getElementById("nivel-ia-options");

    if (!container || !select || !selected || !optionsContainer) return;

    // Función para actualizar el selector (usando traducciones actuales)
    function actualizarSelector() {
      // Actualizar texto seleccionado
      selected.textContent = select.options[select.selectedIndex]?.text || "";

      // Recrear opciones
      optionsContainer.innerHTML = "";
      Array.from(select.options).forEach((opt, index) => {
        const div = document.createElement("div");
        div.textContent = opt.text;
        div.onclick = (e) => {
          e.stopPropagation();
          select.selectedIndex = index;
          selected.textContent = opt.text;
          optionsContainer.classList.add("select-hide");
          selected.classList.remove("select-arrow-active");
        };
        optionsContainer.appendChild(div);
      });
    }

    // Eventos (solo una vez)
    selected.onclick = (e) => {
      e.stopPropagation();
      optionsContainer.classList.toggle("select-hide");
      selected.classList.toggle("select-arrow-active");
    };

    // Guardar función para actualizar después
    container.actualizarSelector = actualizarSelector;

    // Cerrar al hacer click fuera
    document.addEventListener("click", () => {
      optionsContainer.classList.add("select-hide");
      selected.classList.remove("select-arrow-active");
    });
  }

  // Función initLanguage mejorada con promesa y control de carga
  function initLanguage() {
    return new Promise((resolve) => {
      // El idioma ya está en localStorage por i18n.js
      const lang = localStorage.getItem("appLang") || "es";

      // Las traducciones ya están en window.translations (cargadas por i18n.js)
      const translations = window.translations;
      if (!translations) {
        console.warn("Traducciones no disponibles");
        resolve();
        return;
      }

      // Aplicar traducciones a todos los elementos
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
          el.textContent = translations[key];
        }
      });

      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[key]) {
          el.placeholder = translations[key];
        }
      });

      const nivelSelect = document.getElementById("nivel-ia");
      if (nivelSelect) {
        Array.from(nivelSelect.options).forEach((option) => {
          const key = option.getAttribute("data-i18n");
          if (key && translations[key]) {
            option.text = translations[key];
          }
        });
      }

      const container = document.getElementById("nivel-ia-container");
      if (container && container.actualizarSelector) {
        container.actualizarSelector();
      }

      const resultadoSorteo = document.getElementById("resultado-sorteo");
      if (
        resultadoSorteo &&
        JuegoDamas &&
        JuegoDamas.estado &&
        JuegoDamas.estado.sorteoRealizado
      ) {
        resultadoSorteo.textContent =
          JuegoDamas.estado.colorHumano === "blancas"
            ? translations["damas.config.result.white"]
            : translations["damas.config.result.black"];
      }

      // Marcar que las traducciones están cargadas
      document.body.classList.add("translations-loaded");
      resolve();
    });
  }

  // Inicializar al cargar la página
  document.addEventListener("DOMContentLoaded", initCustomSelect);

  function manejarClickPiezaDamas(r, c) {
    if (estadoGlobalDamas.juegoTerminadoFlag) return;
    if (estadoGlobalDamas.turnoActualDamas !== "humano") return;

    if (!tieneMovimientosJugador("humano")) {
      console.log("♨️ Humano AHOGADO - Gana la IA");
      mostrarModalFin(false);
      return;
    }

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

    document.querySelectorAll(".sugerencia-movimiento").forEach((s) => {
      s.style.display = "none";
      s.style.opacity = "0";
      s.style.pointerEvents = "none";
    });

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

      document.querySelectorAll(".sugerencia-movimiento").forEach((s) => {
        s.style.display = "";
        s.style.opacity = "";
        s.style.pointerEvents = "";
      });

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
  // IA MEJORADA PARA NIVEL DIFÍCIL - VERSIÓN 3.0
  // ======================================================================

  function evaluarMovimientoIA_Mejorado(mov) {
    const esTop = estadoGlobalDamas.ladoHumanoAsignado === "top";
    const ladoIA = esTop ? "top" : "bottom";

    // Obtener pieza original
    const piezaOriginal =
      estadoGlobalDamas.matrizDamas[mov.desde.r][mov.desde.c];

    // Simular el movimiento para evaluar consecuencias
    const estadoDespues = simularMovimiento(mov);
    const posDestino = mov.hacia;

    let score = 0;

    if (estaEnPeligroInmediato(estadoDespues, posDestino, ladoIA)) {
      if (mov.capturas.length === 0) {
        score -= 10000; // Penalización masiva

        // Añadir penalización extra si además expone otras fichas
        const fichasExpuestas = contarFichasPropiasEnPeligro(
          estadoDespues,
          ladoIA,
        );
        if (fichasExpuestas > 1) {
          score -= 5000; // Penalización extra por exposición en cadena
        }
      } else {
        score -= 2000;
      }
    }

    if (mov.capturas.length > 0) {
      // Base por capturar (reducido para priorizar seguridad)
      score += mov.capturas.length * 800;

      // Bonus extra por capturar reyes
      const reyesCapturados = mov.capturas.filter((cap) => {
        const pieza = estadoGlobalDamas.matrizDamas[cap.r][cap.c];
        return pieza && pieza.rey;
      }).length;
      score += reyesCapturados * 1500;

      // Bonus por capturas múltiples
      if (mov.capturas.length > 1) {
        score += (mov.capturas.length - 1) * 300;
      }

      // Verificar si después de capturar, la pieza queda en peligro
      const piezaDespues = estadoDespues[posDestino.r][posDestino.c];
      if (
        piezaDespues &&
        estaEnPeligroInmediato(estadoDespues, posDestino, ladoIA)
      ) {
        score -= 1500; // Penalizar si quedamos expuestos tras capturar
      }
    }

    if (mov.reyDespues) {
      score += 800;

      // Verificar si la coronación es segura
      if (!estaEnPeligroInmediato(estadoDespues, posDestino, ladoIA)) {
        score += 400; // Bonus por coronación segura
      }
    }

    if (mov.capturas.length === 0 && !mov.reyDespues && !piezaOriginal.rey) {
      const filaDestino = mov.hacia.r;
      let progreso = 0;

      if (ladoIA === "top") {
        progreso = filaDestino; // 0-7
      } else {
        progreso = 7 - filaDestino;
      }

      // Solo dar bonus por progreso si es seguro
      if (!estaEnPeligroInmediato(estadoDespues, posDestino, ladoIA)) {
        score += progreso * 10;

        // Bonificación por acercarse a coronar (solo si es seguro)
        if (progreso >= 5) score += 40;
        if (progreso === 6) score += 80;
        if (progreso === 7) score += 200;
      } else {
        // Penalizar avance peligroso
        score -= progreso * 15;
      }

      // Contar fichas propias en peligro DESPUÉS del movimiento
      const fichasPropiasEnPeligro = contarFichasPropiasEnPeligro(
        estadoDespues,
        ladoIA,
      );
      if (fichasPropiasEnPeligro > 0) {
        // Penalizar según cuántas fichas queden expuestas
        // Si es 1, penalización moderada; si son varias, penalización masiva
        const penalizacion =
          fichasPropiasEnPeligro * (fichasPropiasEnPeligro === 1 ? 500 : 2000);
        score -= penalizacion;

        if (fichasPropiasEnPeligro > 1) {
          console.log(
            `⚠️ Movimiento PELIGROSO: expone ${fichasPropiasEnPeligro} fichas`,
          );
        }
      }
    }

    // ======================================================================
    // FUNCIÓN PARA EVALUAR CONTROL DEL CENTRO
    // ======================================================================

    /**
     * Evalúa el control del centro del tablero
     * @param {Object} pos - Posición {r, c}
     * @param {boolean} esRey - Si la pieza es rey
     * @returns {number} - Puntuación de control del centro
     */
    function evaluarControlCentro(pos, esRey) {
      const { r, c } = pos;

      // Centro ampliado (casillas 2-5)
      if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
        // Centro exacto (3-4) vale más
        if ((r === 3 || r === 4) && (c === 3 || c === 4)) {
          return esRey ? 25 : 35; // Las piezas normales controlan mejor el centro
        }
        return esRey ? 15 : 20;
      }
      return 0;
    }

    // ======================================================================
    // FUNCIÓN PARA CONTAR FICHAS ENEMIGAS EXPUESTAS
    // ======================================================================

    /**
     * Cuenta las fichas del contrario que están en peligro de ser capturadas
     * @param {Array} matriz - Estado del tablero a evaluar
     * @param {string} ladoIA - Lado de la IA ("top" o "bottom")
     * @returns {number} - Número de fichas enemigas expuestas
     */
    function contarFichasExpuestasContrario(matriz, ladoIA) {
      let contador = 0;
      const ladoHumano = ladoIA === "top" ? "bottom" : "top";

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const ficha = matriz[r][c];
          if (ficha && ficha.dueño === ladoHumano) {
            // Verificar si esta ficha puede ser capturada
            if (estaEnPeligroInmediato(matriz, { r, c }, ladoHumano)) {
              contador++;
            }
          }
        }
      }
      return contador;
    }

    // ======================================================================
    // FUNCIÓN PARA EVALUAR CUÁNTAS FICHAS SE PIERDEN EN UN MOVIMIENTO
    // ======================================================================

    /**
     * Evalúa cuántas fichas propias quedarían expuestas o se perderían
     * @param {Array} matriz - Estado del tablero después del movimiento
     * @param {string} ladoIA - Lado de la IA
     * @returns {number} - Número de fichas en peligro
     */
    function contarFichasPropiasEnPeligro(matriz, ladoIA) {
      let contador = 0;

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const ficha = matriz[r][c];
          if (ficha && ficha.dueño === ladoIA) {
            if (estaEnPeligroInmediato(matriz, { r, c }, ladoIA)) {
              contador++;
            }
          }
        }
      }
      return contador;
    }

    // ======================================================================
    // FUNCIÓN PARA CONTAR FICHAS ENEMIGAS EXPUESTAS
    // ======================================================================

    /**
     * @param {Array} matriz
     * @param {string} ladoIA
     * @returns {number}
     */
    function contarFichasExpuestasContrario(matriz, ladoIA) {
      let contador = 0;
      const ladoHumano = ladoIA === "top" ? "bottom" : "top";

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const ficha = matriz[r][c];
          if (ficha && ficha.dueño === ladoHumano) {
            // Verificar si esta ficha puede ser capturada
            if (estaEnPeligroInmediato(matriz, { r, c }, ladoHumano)) {
              contador++;
            }
          }
        }
      }
      return contador;
    }

    // Contar cuántas fichas enemigas están en peligro DESPUÉS de nuestro movimiento
    const fichasEnPeligro = contarFichasExpuestasContrario(
      estadoDespues,
      ladoIA,
    );
    score += fichasEnPeligro * 60; // Bueno si dejamos al rival expuesto

    const centroBonus = evaluarControlCentro(
      posDestino,
      piezaOriginal?.rey || false,
    );
    if (!estaEnPeligroInmediato(estadoDespues, posDestino, ladoIA)) {
      score += centroBonus;
    } else {
      // No dar bonus por centro si es peligroso
      score -= 100;
    }

    const fichasAliadasCercanas = contarFichasAliadasCercanas(
      estadoDespues,
      posDestino,
      ladoIA,
    );

    // Si tenemos apoyo, es más seguro
    if (fichasAliadasCercanas > 0) {
      score += fichasAliadasCercanas * 30;
    }

    if (!estaEnPeligroInmediato(estadoDespues, posDestino, ladoIA)) {
      if (creaAmenazaDoble(estadoDespues, posDestino, ladoIA)) {
        score += 300;
      }
    }

    if (
      mov.capturas.length === 0 &&
      bloqueaFichasPropias(estadoDespues, posDestino, mov.desde, ladoIA)
    ) {
      score -= 150;
    }

    return score;
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
      detenerTemporizador();
      return;
    }

    // Cambiar el turno SOLO si el juego no ha terminado
    estadoGlobalDamas.turnoActualDamas =
      estadoGlobalDamas.turnoActualDamas === "humano" ? "ia" : "humano";
    actualizarPanelInfoDamas();

    const jugadorActual = estadoGlobalDamas.turnoActualDamas;
    if (!tieneMovimientosJugador(jugadorActual)) {
      console.log(`♨️ ¡AHOGADO! ${jugadorActual} no puede mover - Pierde`);

      // El jugador que no puede mover PIERDE
      if (jugadorActual === "humano") {
        // El humano no puede mover -> gana la IA
        mostrarModalFin(false);
      } else {
        // La IA no puede mover -> gana el humano
        mostrarModalFin(true);
      }
      return;
    }

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

  // ======================================================================
  // FUNCIÓN PARA DETECTAR SI UN JUGADOR TIENE MOVIMIENTOS
  // ======================================================================

  /**
   * Verifica si un jugador tiene al menos un movimiento válido
   * @param {string} jugador - "humano" o "ia"
   * @returns {boolean} - true si tiene movimientos, false si está bloqueado
   */
  function tieneMovimientosJugador(jugador) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pieza = estadoGlobalDamas.matrizDamas[r][c];
        if (!pieza) continue;

        // Determinar si la pieza es del jugador que estamos verificando
        const esDelJugador =
          jugador === "humano"
            ? pieza.dueño === estadoGlobalDamas.ladoHumanoAsignado
            : pieza.dueño !== estadoGlobalDamas.ladoHumanoAsignado;

        if (esDelJugador) {
          const movimientos = calcularMovimientosDesdeDamas(r, c);
          if (movimientos.length > 0) {
            return true; // Encontró al menos un movimiento
          }
        }
      }
    }
    return false; // Ninguna pieza tiene movimientos
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
      mostrarModalFin(false); // Gana la IA
    } else if (ia === 0) {
      estadoGlobalDamas.juegoTerminadoFlag = true;
      mostrarModalFin(true); // Gana el humano
    }
  }

  function mostrarModalFin(gano) {
    // DETENER TEMPORIZADOR INMEDIATAMENTE
    detenerTemporizador();

    // También asegurar que el estado refleja que el juego terminó
    estadoGlobalDamas.juegoTerminadoFlag = true;

    // Registrar estadísticas
    const nivel = estadoGlobalDamas.nivelIA;
    if (gano) {
      GestorJugadores.registrarVictoria(nivel);
    } else {
      GestorJugadores.registrarDerrota(nivel);
    }

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
  // MODAL RANKING DE JUGADORES
  // ======================================================================

  function mostrarModalRanking() {
    const ranking = GestorJugadores.obtenerRanking();

    let contenidoRanking = "";

    if (ranking.length === 0) {
      contenidoRanking = `<p class="sin-jugadores-msg" data-i18n="damas.ranking.noPlayers">No hay jugadores registrados</p>`;
    } else {
      ranking.forEach((jugador) => {
        contenidoRanking += `
      <div class="ranking-item">
        <div class="ranking-nombre">${jugador.nombre}</div>
        <div class="ranking-estadisticas">
          <div class="ranking-nivel">
            <span data-i18n="damas.config.aiNormal">Normal</span>
            <span class="ranking-victorias">🏆 ${jugador.stats.victoriasNormal}</span>
            <span class="ranking-derrotas">❌ ${jugador.stats.derrotasNormal}</span>
          </div>
          <div class="ranking-nivel">
            <span data-i18n="damas.config.aiHard">Difícil</span>
            <span class="ranking-victorias">🏆 ${jugador.stats.victoriasDificil}</span>
            <span class="ranking-derrotas">❌ ${jugador.stats.derrotasDificil}</span>
          </div>
        </div>
      </div>
    `;
      });
    }

    const modalHTML = `
  <div id="modal-ranking-jugadores" class="modal-fin-damas" style="display: flex;">
    <div class="modal-contenido modal-ranking">
      <h2 data-i18n="damas.ranking.title">Ranking de jugadores</h2>
      <div class="ranking-lista">
        ${contenidoRanking}
      </div>
      <div class="botones-modal">
        <button class="boton-damas" id="btn-cerrar-ranking" data-i18n="common.close">Cerrar</button>
      </div>
    </div>
  </div>
`;

    // Eliminar modal anterior si existe
    const oldModal = document.getElementById("modal-ranking-jugadores");
    if (oldModal) oldModal.remove();

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("modal-ranking-jugadores");

    // Evento cerrar
    document.getElementById("btn-cerrar-ranking").onclick = () => {
      modal.style.display = "none";
    };

    // Cerrar al hacer click fuera
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // ======================================================================
  // IA MEJORADA - FUNCIÓN PRINCIPAL
  // ======================================================================

  function movimientoIA_Damas() {
    if (estadoGlobalDamas.juegoTerminadoFlag) return;

    if (!tieneMovimientosJugador("ia")) {
      console.log("♨️ IA AHOGADA - Gana el humano");
      mostrarModalFin(true);
      return;
    }

    const ladoIA =
      estadoGlobalDamas.ladoHumanoAsignado === "top" ? "bottom" : "top";

    // DECISIÓN SEGÚN EL NIVEL
    if (estadoGlobalDamas.nivelIA === "dificil") {
      movimientoIA_Dificil(ladoIA);
    } else {
      movimientoIA_Normal(ladoIA);
    }
  }

  function movimientoIA_Normal(ladoIA) {
    console.log("🤖 IA Nivel: NORMAL");

    // Implementación SIMPLE para nivel normal
    // Por ejemplo: movimiento aleatorio entre los disponibles
    const movimientos = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = estadoGlobalDamas.matrizDamas[r][c];
        if (!p || p.dueño === estadoGlobalDamas.ladoHumanoAsignado) continue;

        const movs = calcularMovimientosDesdeDamas(r, c);
        movimientos.push(...movs);
      }
    }

    if (movimientos.length === 0) return;

    // Priorizar capturas (pero sin evaluación compleja)
    const capturas = movimientos.filter((m) => m.capturas.length > 0);
    let choice;

    if (capturas.length > 0) {
      // Elegir una captura aleatoria
      choice = capturas[Math.floor(Math.random() * capturas.length)];
      console.log("  → Captura aleatoria");
    } else {
      // Elegir movimiento aleatorio
      choice = movimientos[Math.floor(Math.random() * movimientos.length)];
      console.log("  → Movimiento aleatorio");
    }

    estadoGlobalDamas.seleccionActualDamas = choice.desde;
    dibujarTableroDamas();

    setTimeout(() => ejecutarMovimientoDamas(choice), 900);
  }

  function movimientoIA_Dificil(ladoIA) {
    console.log("🤖 IA Nivel: DIFÍCIL");

    const movimientos = [];
    const capturasDisponibles = [];
    const movimientosSeguros = [];

    // Recolectar todos los movimientos posibles
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = estadoGlobalDamas.matrizDamas[r][c];
        if (!p || p.dueño === estadoGlobalDamas.ladoHumanoAsignado) continue;

        const movsDesdeCasilla = calcularMovimientosDesdeDamas(r, c);

        movsDesdeCasilla.forEach((m) => {
          // Clasificar movimientos
          if (m.capturas.length > 0) {
            capturasDisponibles.push(m);
          }
          movimientos.push(m);

          // Evaluar si es seguro (no ser capturado después)
          const estadoSimulado = simularMovimiento(m);
          if (!estaEnPeligroInmediato(estadoSimulado, m.hacia, ladoIA)) {
            movimientosSeguros.push(m);
          }
        });
      }
    }

    if (!movimientos.length) return;

    let choice;

    const capturasSeguras = capturasDisponibles.filter((m) => {
      const estadoSimulado = simularMovimiento(m);
      return !estaEnPeligroInmediato(estadoSimulado, m.hacia, ladoIA);
    });

    if (capturasSeguras.length > 0) {
      console.log("🎯 Prioridad 1: Capturas seguras");
      const movimientosEvaluados = capturasSeguras.map((m) => ({
        m,
        score: evaluarMovimientoIA_Mejorado(m),
      }));
      movimientosEvaluados.sort((a, b) => b.score - a.score);
      choice = movimientosEvaluados[0].m;
    } else if (capturasDisponibles.length > 0) {
      console.log("⚡ Prioridad 2: Capturas (con riesgo)");
      const movimientosEvaluados = capturasDisponibles.map((m) => ({
        m,
        score: evaluarMovimientoIA_Mejorado(m),
      }));
      movimientosEvaluados.sort((a, b) => b.score - a.score);
      choice = movimientosEvaluados[0].m;
    } else if (movimientosSeguros.length > 0) {
      console.log("🛡️ Prioridad 3: Movimientos seguros");
      const movimientosEvaluados = movimientosSeguros.map((m) => ({
        m,
        score: evaluarMovimientoIA_Mejorado(m),
      }));
      movimientosEvaluados.sort((a, b) => b.score - a.score);

      // Elegir entre top 3 con probabilidad
      const mejores = movimientosEvaluados.slice(0, 3);
      if (mejores.length === 1 || Math.random() < 0.7) {
        choice = mejores[0].m;
      } else {
        const idx = Math.floor(Math.random() * Math.min(2, mejores.length));
        choice = mejores[idx].m;
      }
    } else {
      console.log("⚠️ Prioridad 4: Minimizar daños");

      // Evaluar todos los movimientos con énfasis en minimizar pérdidas
      const movimientosEvaluados = movimientos.map((m) => {
        const score = evaluarMovimientoIA_Mejorado(m);
        return { m, score };
      });

      // Ordenar por score (mayor primero, que significa menos malo)
      movimientosEvaluados.sort((a, b) => b.score - a.score);

      // Mostrar top 3 para debug
      console.log("  Opciones desesperadas:");
      movimientosEvaluados.slice(0, 3).forEach((item, i) => {
        console.log(
          `    ${i + 1}. Score: ${item.score} - De: ${item.m.desde.r},${item.m.desde.c} A: ${item.m.hacia.r},${item.m.hacia.c}`,
        );
      });

      // Elegir el mejor (menos malo) - sin aleatoriedad cuando estamos desesperados
      choice = movimientosEvaluados[0].m;
    }

    // Mostrar decisión en consola
    const scoreElegido = evaluarMovimientoIA_Mejorado(choice);
    console.log(
      `🤖 IA elige: [${choice.desde.r},${choice.desde.c}] → [${choice.hacia.r},${choice.hacia.c}] | Score: ${scoreElegido} | ${choice.capturas.length > 0 ? "🔥" : "👟"}`,
    );

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
  // SISTEMA DE GESTIÓN DE JUGADORES CON ESTADÍSTICAS
  // ======================================================================

  const GestorJugadores = (() => {
    const STORAGE_KEY = "damas_jugadores";
    const STATS_KEY = "damas_estadisticas";
    const MAX_JUGADORES = 10;

    let jugadores = [];
    let jugadorSeleccionado = null;
    let estadisticas = {};

    // Cargar jugadores y estadísticas del localStorage
    function cargarDatos() {
      try {
        // Cargar jugadores
        const stored = localStorage.getItem(STORAGE_KEY);
        jugadores = stored ? JSON.parse(stored) : [];

        // Cargar estadísticas
        const statsStored = localStorage.getItem(STATS_KEY);
        estadisticas = statsStored ? JSON.parse(statsStored) : {};
      } catch (e) {
        console.error("Error cargando datos:", e);
        jugadores = [];
        estadisticas = {};
      }
      return { jugadores, estadisticas };
    }

    // Guardar jugadores en localStorage
    function guardarJugadores() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jugadores));
      } catch (e) {
        console.error("Error guardando jugadores:", e);
      }
    }

    // Guardar estadísticas
    function guardarEstadisticas() {
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(estadisticas));
      } catch (e) {
        console.error("Error guardando estadísticas:", e);
      }
    }

    // Obtener lista de jugadores ordenada alfabéticamente
    function obtenerJugadores() {
      return [...jugadores].sort((a, b) => a.localeCompare(b));
    }

    // Añadir nuevo jugador (con límite de 10)
    function añadirJugador(nombre) {
      // Validar nombre
      nombre = nombre.trim();

      // Comprobar límite de 10 jugadores
      if (jugadores.length >= MAX_JUGADORES) {
        return { exito: false, mensaje: "damas.player.error.maxPlayers" };
      }

      if (nombre.length < 3 || nombre.length > 12) {
        return { exito: false, mensaje: "damas.player.error.length" };
      }

      // Comprobar si ya existe
      if (jugadores.some((j) => j.toLowerCase() === nombre.toLowerCase())) {
        return { exito: false, mensaje: "damas.player.error.exists" };
      }

      jugadores.push(nombre);
      guardarJugadores();

      // Inicializar estadísticas para el nuevo jugador
      if (!estadisticas[nombre]) {
        estadisticas[nombre] = {
          [ESTADISTICAS_KEYS.VICTORIAS_NORMAL]: 0,
          [ESTADISTICAS_KEYS.DERROTAS_NORMAL]: 0,
          [ESTADISTICAS_KEYS.VICTORIAS_DIFICIL]: 0,
          [ESTADISTICAS_KEYS.DERROTAS_DIFICIL]: 0,
        };
        guardarEstadisticas();
      }

      return { exito: true, mensaje: "damas.player.created" };
    }

    // Eliminar jugador
    function eliminarJugador(nombre) {
      // Proteger al jugador "Player" de ser eliminado
      if (nombre === "Player") {
        console.warn("El jugador Player no puede ser eliminado");
        return false;
      }

      const index = jugadores.findIndex((j) => j === nombre);
      if (index !== -1) {
        jugadores.splice(index, 1);
        guardarJugadores();

        // Eliminar también sus estadísticas
        delete estadisticas[nombre];
        guardarEstadisticas();

        // Si el jugador eliminado era el seleccionado, limpiar selección
        if (jugadorSeleccionado === nombre) {
          jugadorSeleccionado = null;
        }
        return true;
      }
      return false;
    }

    // Seleccionar jugador
    function seleccionarJugador(nombre) {
      if (nombre && jugadores.includes(nombre)) {
        jugadorSeleccionado = nombre;
        return true;
      }
      return false;
    }

    // Obtener jugador seleccionado
    function obtenerJugadorSeleccionado() {
      return jugadorSeleccionado;
    }

    // Registrar victoria para el jugador actual
    function registrarVictoria(nivel) {
      if (!jugadorSeleccionado || jugadorSeleccionado === "Player") return;
      if (!estadisticas[jugadorSeleccionado]) {
        inicializarEstadisticasJugador(jugadorSeleccionado);
      }

      const key =
        nivel === "dificil"
          ? ESTADISTICAS_KEYS.VICTORIAS_DIFICIL
          : ESTADISTICAS_KEYS.VICTORIAS_NORMAL;

      estadisticas[jugadorSeleccionado][key] =
        (estadisticas[jugadorSeleccionado][key] || 0) + 1;
      guardarEstadisticas();
    }

    // Registrar derrota para el jugador actual
    function registrarDerrota(nivel) {
      if (!jugadorSeleccionado || jugadorSeleccionado === "Player") return;
      if (!estadisticas[jugadorSeleccionado]) {
        inicializarEstadisticasJugador(jugadorSeleccionado);
      }

      const key =
        nivel === "dificil"
          ? ESTADISTICAS_KEYS.DERROTAS_DIFICIL
          : ESTADISTICAS_KEYS.DERROTAS_NORMAL;

      estadisticas[jugadorSeleccionado][key] =
        (estadisticas[jugadorSeleccionado][key] || 0) + 1;
      guardarEstadisticas();
    }

    function inicializarEstadisticasJugador(nombre) {
      estadisticas[nombre] = {
        [ESTADISTICAS_KEYS.VICTORIAS_NORMAL]: 0,
        [ESTADISTICAS_KEYS.DERROTAS_NORMAL]: 0,
        [ESTADISTICAS_KEYS.VICTORIAS_DIFICIL]: 0,
        [ESTADISTICAS_KEYS.DERROTAS_DIFICIL]: 0,
      };
    }

    // Obtener estadísticas de un jugador
    function obtenerEstadisticas(nombre) {
      return (
        estadisticas[nombre] || {
          [ESTADISTICAS_KEYS.VICTORIAS_NORMAL]: 0,
          [ESTADISTICAS_KEYS.DERROTAS_NORMAL]: 0,
          [ESTADISTICAS_KEYS.VICTORIAS_DIFICIL]: 0,
          [ESTADISTICAS_KEYS.DERROTAS_DIFICIL]: 0,
        }
      );
    }

    // Obtener todos los jugadores con sus estadísticas (ordenados alfabéticamente)
    function obtenerRanking() {
      const jugadoresOrdenados = obtenerJugadores();
      return jugadoresOrdenados
        .filter((nombre) => nombre !== "Player") // Excluir al jugador Player
        .map((nombre) => ({
          nombre,
          stats: obtenerEstadisticas(nombre),
        }));
    }

    // Inicializar
    cargarDatos();

    return {
      obtenerJugadores,
      añadirJugador,
      eliminarJugador,
      seleccionarJugador,
      obtenerJugadorSeleccionado,
      registrarVictoria,
      registrarDerrota,
      obtenerEstadisticas,
      obtenerRanking,
      MAX_JUGADORES,
    };
  })();

  // ======================================================================
  // ACTUALIZAR NOMBRE DEL JUGADOR EN EL PANEL
  // ======================================================================
  function actualizarNombreJugadorPanel() {
    const jugadorActual = GestorJugadores.obtenerJugadorSeleccionado();
    const spanJugador = document.getElementById("jugador-actual-info");
    if (spanJugador) {
      spanJugador.textContent = jugadorActual || "—";
    }
  }

  // ======================================================================
  // SELECTOR PERSONALIZADO DE JUGADORES
  // ======================================================================

  function actualizarSelectorJugadores() {
    const container = document.getElementById("selector-jugadores-container");
    const selected = document.getElementById("jugador-selected");
    const optionsContainer = document.getElementById("jugador-options");

    if (!container || !selected || !optionsContainer) return;

    // Obtener jugadores y filtrar para EXCLUIR a "Player"
    const jugadores = GestorJugadores.obtenerJugadores().filter(
      (nombre) => nombre !== "Player",
    );
    const jugadorActual = GestorJugadores.obtenerJugadorSeleccionado();

    // Si el jugador actual es "Player", lo deseleccionamos
    if (jugadorActual === "Player") {
      GestorJugadores.seleccionarJugador(null);
    }

    // Actualizar texto seleccionado
    if (jugadorActual && jugadorActual !== "Player") {
      selected.textContent = jugadorActual;
      selected.removeAttribute("data-vacio");
    } else {
      selected.textContent = t("damas.config.noPlayer");
      selected.setAttribute("data-vacio", "true");
    }

    // Recrear opciones (excluyendo a "Player")
    optionsContainer.innerHTML = "";

    if (jugadores.length === 0) {
      const div = document.createElement("div");
      div.textContent = t("damas.config.noPlayers");
      div.setAttribute("data-i18n", "damas.config.noPlayers");
      div.style.fontStyle = "italic";
      div.style.opacity = "0.7";
      div.onclick = (e) => {
        e.stopPropagation();
        optionsContainer.classList.add("select-hide");
        selected.classList.remove("select-arrow-active");
      };
      optionsContainer.appendChild(div);
    } else {
      jugadores.forEach((nombre) => {
        const div = document.createElement("div");
        div.textContent = nombre;
        div.onclick = (e) => {
          e.stopPropagation();
          GestorJugadores.seleccionarJugador(nombre);
          selected.textContent = nombre;
          selected.setAttribute("data-i18n", "damas.config.noPlayer");
          selected.removeAttribute("data-vacio");
          optionsContainer.classList.add("select-hide");
          selected.classList.remove("select-arrow-active");
          actualizarNombreJugadorPanel();
        };
        optionsContainer.appendChild(div);
      });
    }
  }

  // ======================================================================
  // MODAL CREAR JUGADOR
  // ======================================================================

  function mostrarModalCrearJugador() {
    // Ocultar cualquier otro modal abierto
    const modalAviso = document.getElementById("modal-aviso-damas");
    if (modalAviso.style.display === "flex") {
      modalAviso.style.display = "none";
    }

    const modalHTML = `
    <div id="modal-crear-jugador" class="modal-fin-damas" style="display: flex; z-index: 9999;">
      <div class="modal-contenido modal-crear-jugador">
        <h2 data-i18n="damas.player.create.title">Crear nuevo jugador</h2>
        <input type="text" id="input-nuevo-jugador" placeholder="${t("damas.player.namePlaceholder")}" maxlength="12" autocomplete="off">
        <div class="botones-modal">
          <button class="boton-damas" id="btn-crear-jugador-confirm" data-i18n="common.create">Crear</button>
          <button class="boton-damas" id="btn-crear-jugador-cancel" data-i18n="common.close">Cerrar</button>
        </div>
      </div>
    </div>
  `;

    // Eliminar modal anterior si existe
    const oldModal = document.getElementById("modal-crear-jugador");
    if (oldModal) oldModal.remove();

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("modal-crear-jugador");
    const input = document.getElementById("input-nuevo-jugador");

    // Enfocar input
    setTimeout(() => input.focus(), 100);

    // Evento crear
    document.getElementById("btn-crear-jugador-confirm").onclick = () => {
      const nombre = input.value.trim();
      const resultado = GestorJugadores.añadirJugador(nombre);

      if (resultado.exito) {
        modal.style.display = "none";
        mostrarAvisoDamas(t(resultado.mensaje, { nombre }));
        actualizarSelectorJugadores();
      } else {
        mostrarAvisoDamas(t(resultado.mensaje));
      }
    };

    // Evento cerrar
    document.getElementById("btn-crear-jugador-cancel").onclick = () => {
      modal.style.display = "none";
    };

    // Cerrar al hacer click fuera
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // ======================================================================
  // MODAL BORRAR JUGADOR
  // ======================================================================

  function mostrarModalBorrarJugador() {
    // Obtener jugadores y filtrar para EXCLUIR a "Player"
    const jugadores = GestorJugadores.obtenerJugadores().filter(
      (nombre) => nombre !== "Player",
    );

    if (jugadores.length === 0) {
      mostrarAvisoDamas(t("damas.player.error.noPlayers"));
      return;
    }

    const listaJugadores = jugadores
      .map(
        (nombre) => `
    <div class="item-jugador-borrar" data-nombre="${nombre}">
      <input type="radio" name="jugador-borrar" value="${nombre}" id="radio-${nombre}">
      <label for="radio-${nombre}">${nombre}</label>
    </div>
  `,
      )
      .join("");

    const modalHTML = `
    <div id="modal-borrar-jugador" class="modal-fin-damas" style="display: flex;">
      <div class="modal-contenido modal-borrar-jugador">
        <h2 data-i18n="damas.player.delete.title">Seleccionar jugador a borrar</h2>
        <div class="lista-jugadores-borrar">
          ${listaJugadores}
        </div>
        <div class="botones-modal">
          <button class="boton-damas" id="btn-borrar-jugador-confirm" data-i18n="common.delete">Borrar</button>
          <button class="boton-damas" id="btn-borrar-jugador-cancel" data-i18n="common.close">Cerrar</button>
        </div>
      </div>
    </div>
  `;

    // Eliminar modal anterior si existe
    const oldModal = document.getElementById("modal-borrar-jugador");
    if (oldModal) oldModal.remove();

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("modal-borrar-jugador");

    // Añadir efecto de selección
    document.querySelectorAll(".item-jugador-borrar").forEach((item) => {
      item.addEventListener("click", () => {
        document
          .querySelectorAll(".item-jugador-borrar")
          .forEach((i) => i.classList.remove("seleccionado"));
        item.classList.add("seleccionado");
        const radio = item.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // Evento borrar
    document.getElementById("btn-borrar-jugador-confirm").onclick = () => {
      const seleccionado = document.querySelector(
        'input[name="jugador-borrar"]:checked',
      );
      if (!seleccionado) {
        mostrarAvisoDamas(t("damas.player.error.select"));
        return;
      }

      const nombre = seleccionado.value;
      GestorJugadores.eliminarJugador(nombre);
      modal.style.display = "none";
      mostrarAvisoDamas(t("damas.player.deleted", { nombre }));
      actualizarSelectorJugadores();
    };

    actualizarNombreJugadorPanel();

    // Evento cerrar
    document.getElementById("btn-borrar-jugador-cancel").onclick = () => {
      modal.style.display = "none";
    };

    // Cerrar al hacer click fuera
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
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

  function init() {
    // --- Mostrar el splash screen al inicio ---
    const splashScreen = document.getElementById("splash-screen-damas");
    if (splashScreen) {
      splashScreen.classList.remove("hidden"); // Asegurarse de que sea visible
    }
    // Ocultar contenido inicialmente
    document.body.classList.remove("translations-loaded");

    const modalConfig = document.getElementById("modal-config-damas");

    modalConfig.style.display = "none";

    // También ocultar el contenedor del juego
    const juegoContenedor = document.getElementById("juego-damas-contenedor");
    if (juegoContenedor) {
      juegoContenedor.style.display = "none";
    }

    // Inicializar selector personalizado
    initCustomSelect();

    // Esperar a que las traducciones estén listas
    initLanguage().then(() => {
      // Aplicar traducciones a elementos específicos

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
        origenConfirmExit = "juego";
        document.getElementById("modal-confirm-exit").style.display = "flex";
      });

      // Eventos del modal de confirmación
      document
        .getElementById("btn-confirm-yes")
        .addEventListener("click", () => {
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
          origenConfirmExit = null;
        });

      document
        .getElementById("btn-confirm-no")
        .addEventListener("click", () => {
          document.getElementById("modal-confirm-exit").style.display = "none";
          if (origenConfirmExit === "config") {
            document.getElementById("modal-config-damas").style.display =
              "flex";
          }
          origenConfirmExit = null;
        });

      // ======================================================================
      // EVENTO PARA EL BOTÓN DE INSTRUCCIONES EN MODAL CONFIGURACIÓN
      // ======================================================================
      const botonInstrucciones = document.getElementById(
        "boton-instrucciones-modal",
      );
      if (botonInstrucciones) {
        botonInstrucciones.addEventListener("click", () => {
          document.getElementById("modal-instrucciones-damas").style.display =
            "flex";
        });
      } else {
        console.warn("⚠️ boton-instrucciones-modal no encontrado");
      }

      // evento del botón de cerrar instrucciones
      const botonCerrar = document.getElementById("boton-cerrar-instrucciones");
      if (botonCerrar) {
        botonCerrar.addEventListener("click", () => {
          document.getElementById("modal-instrucciones-damas").style.display =
            "none";
        });
      } else {
        console.warn("⚠️ boton-cerrar-instrucciones no encontrado");
      }

      // ======================================================================
      // SORTEO
      // =============================================================

      document
        .getElementById("boton-sortear-colores")
        .addEventListener("click", () => {
          JuegoDamas.realizarSorteoColores();
        });

      document
        .getElementById("check-sugerencias")
        .addEventListener("change", (e) => {
          JuegoDamas.estado.mostrarSugerencias = e.target.checked;
        });

      // Evento botón jugadores (ranking)
      document.getElementById("btn-jugadores").addEventListener("click", () => {
        mostrarModalRanking();
      });

      // Evento para PARTIDA RÁPIDA
      document
        .getElementById("boton-partida-rapida")
        .addEventListener("click", () => {
          const estado = estadoGlobalDamas;

          // Seleccionar jugador "Player" por defecto
          const jugadoresExistentes = GestorJugadores.obtenerJugadores();
          if (!jugadoresExistentes.includes("Player")) {
            GestorJugadores.añadirJugador("Player");
          }
          GestorJugadores.seleccionarJugador("Player");
          actualizarSelectorJugadores();
          actualizarNombreJugadorPanel();

          mostrarAvisoDamas(
            "Jugando como 'Player' - Las estadísticas no se guardarán en el ranking",
          );

          // Realizar sorteo automático de colores
          realizarSorteoColores(); // Esta función ya existe y actualiza el estado

          // Establecer nivel normal
          estado.nivelIA = "normal";
          document.getElementById("nivel-ia").value = "normal";

          // Actualizar el selector visual de nivel
          const nivelContainer = document.getElementById("nivel-ia-container");
          if (nivelContainer && nivelContainer.actualizarSelector) {
            nivelContainer.actualizarSelector();
          }

          // Sugerencias activadas por defecto
          estado.mostrarSugerencias = true;
          document.getElementById("check-sugerencias").checked = true;

          // Ocultar modal de configuración y mostrar juego
          document.getElementById("modal-config-damas").style.display = "none";
          document.getElementById("juego-damas-contenedor").style.display =
            "block";

          // Dibujar tablero
          dibujarTableroDamas();

          // Iniciar temporizador
          reiniciarTemporizador();
          iniciarTemporizador();

          // Si el turno es de la IA, iniciar su movimiento
          if (estado.turnoActualDamas === "ia") {
            setTimeout(movimientoIA_Damas, 500);
          }
        });

      // Inicializar selector de jugadores
      actualizarSelectorJugadores();

      // Evento para abrir selector de jugadores
      const jugadorSelected = document.getElementById("jugador-selected");
      const jugadorOptions = document.getElementById("jugador-options");

      if (jugadorSelected) {
        jugadorSelected.onclick = (e) => {
          e.stopPropagation();
          jugadorOptions.classList.toggle("select-hide");
          jugadorSelected.classList.toggle("select-arrow-active");
        };
      }

      // Evento botón crear jugador
      document
        .getElementById("btn-crear-jugador")
        .addEventListener("click", () => {
          mostrarModalCrearJugador();
        });

      // Evento botón borrar jugador
      document
        .getElementById("btn-borrar-jugador")
        .addEventListener("click", () => {
          mostrarModalBorrarJugador();
        });

      // EVENTO PARA EL BOTÓN JUGAR
      document
        .getElementById("boton-jugar-config")
        .addEventListener("click", () => {
          const estado = estadoGlobalDamas;

          // Verificar que se haya realizado el sorteo
          if (!estado.sorteoRealizado) {
            mostrarAvisoDamas(t("damas.warning.mustShuffle"));
            return;
          }

          // Verificar si hay jugador seleccionado
          if (!GestorJugadores.obtenerJugadorSeleccionado()) {
            mostrarAvisoDamas(t("damas.warning.noPlayer"));
            return;
          }

          // Obtener el nivel de IA seleccionado
          estado.nivelIA = document.getElementById("nivel-ia").value;

          // Ocultar modal de configuración
          document.getElementById("modal-config-damas").style.display = "none";

          // Mostrar el contenedor del juego
          const juegoContenedor = document.getElementById(
            "juego-damas-contenedor",
          );
          juegoContenedor.style.display = "block";

          // Inicializar el tablero
          resetGameDamasUltra();

          // Iniciar temporizador
          reiniciarTemporizador();
          iniciarTemporizador();

          // Si el turno es de la IA, iniciar su movimiento
          if (estado.turnoActualDamas === "ia") {
            setTimeout(movimientoIA_Damas, 500);
          }
        });

      // Evento para el botón de reinicio (si existe)
      document
        .getElementById("boton-reinicio-damas")
        ?.addEventListener("click", resetGameDamasUltra);

      // Ocultar el splash
      if (splashScreen) {
        splashScreen.classList.add("hidden");
      }

      // AHORA mostrar el modal CON LAS TRADUCCIONES YA APLICADAS
      modalConfig.style.display = "flex";

      // Forzar otro reflow después de mostrar
      void modalConfig.offsetHeight;

      // Eliminar el splash del DOM después de la transición
      setTimeout(() => {
        if (splashScreen && splashScreen.parentNode) {
          splashScreen.parentNode.removeChild(splashScreen);
        }
      }, 600);

      // Marcar que las traducciones están cargadas
      document.body.classList.add("translations-loaded");

      // Inicializar el juego
      resetGameDamasUltra();
    });
  }

  // Escuchar cambios de idioma (importante)
  document.addEventListener("languageChanged", function () {
    if (typeof initLanguage === "function") {
      initLanguage();
    }
  });
  document.addEventListener("DOMContentLoaded", init);

  return {
    reset: resetGameDamasUltra,
    realizarSorteoColores,
    dibujarTableroDamas,
    movimientoIA_Damas,
    estado: estadoGlobalDamas,
  };
})();

let ultimoClickTiempo = 0;

function clickSeguro() {
  const ahora = Date.now();
  if (ahora - ultimoClickTiempo < 250) return false;
  ultimoClickTiempo = ahora;
  return true;
}

// Funcion de avisos
function mostrarAvisoDamas(texto, parametros = {}) {
  // Cerrar otros modales si es necesario
  const modalCrear = document.getElementById("modal-crear-jugador");
  if (modalCrear) {
    modalCrear.style.display = "none";
  }

  const modalBorrar = document.getElementById("modal-borrar-jugador");
  if (modalBorrar) {
    modalBorrar.style.display = "none";
  }

  const modal = document.getElementById("modal-aviso-damas");
  const mensaje = document.getElementById("modal-aviso-texto");

  // Asegurar z-index alto
  modal.style.zIndex = "10001";

  // Si hay parámetros, reemplazar en el texto
  let textoFinal = texto;
  if (parametros && Object.keys(parametros).length > 0) {
    Object.keys(parametros).forEach((key) => {
      textoFinal = textoFinal.replace(`{${key}}`, parametros[key]);
    });
  }

  mensaje.textContent = textoFinal;
  modal.style.display = "flex";

  document.getElementById("boton-cerrar-aviso").onclick = () => {
    modal.style.display = "none";
  };
}
