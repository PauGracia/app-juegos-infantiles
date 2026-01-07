// ================================
// Juego de Damas
// ================================

// ================================
// SONIDOS
// ================================

document.addEventListener(
  "click",
  () => {
    ["movement", "comer1", "you-win", "game-over"].forEach((s) => {
      const a = new Audio(`sounds/${s}.mp3`);
      a.volume = 0;
      a.play().catch(() => {});
    });
  },
  { once: true }
);

const sonidosDamas = {
  movimiento: () => {
    const a = new Audio("sounds/movement.mp3");
    a.volume = 0.8;
    a.play();
  },
  comer: () => {
    const a = new Audio("sounds/comer1.mp3");
    a.volume = 0.9;
    a.play();
  },
  ganar: () => {
    const a = new Audio("sounds/you-win.mp3");
    a.volume = 1;
    a.play();
  },
  perder: () => {
    const a = new Audio("sounds/game-over.mp3");
    a.volume = 1;
    a.play();
  },
  coronar: () => {
    const a = new Audio("sounds/christmas.mp3");
    a.volume = 1;
    a.play();
  },
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
    capturasIA: 0,
  };

  // ======================================================================
  // UTILIDADES
  // ======================================================================
  const indicePlanoDamas = (f, c) => f * 8 + c;
  const enLimiteDamas = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const clonarMatrizDamas = (m) =>
    m.map((fila) => fila.map((celda) => (celda ? { ...celda } : null)));

  // ======================================================================
  // INICIALIZAR TABLERO
  // ======================================================================
  function generarTableroInicialDamas() {
    estadoGlobalDamas.matrizDamas = Array.from({ length: 8 }, () =>
      Array(8).fill(null)
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
  /*function sortearRolesDamas() {
    estadoGlobalDamas.ladoHumanoAsignado =
      Math.random() < 0.5 ? "top" : "bottom";
    estadoGlobalDamas.turnoActualDamas = Math.random() < 0.5 ? "humano" : "ia";

    document.getElementById("lado-humano-info").textContent =
      estadoGlobalDamas.ladoHumanoAsignado === "top" ? "Arriba" : "Abajo";
  }*/

  function sortearColoresYTurno() {
    estadoGlobalDamas.colorHumano = Math.random() < 0.5 ? "blancas" : "negras";

    // El que tiene blancas empieza
    estadoGlobalDamas.turnoActualDamas =
      estadoGlobalDamas.colorHumano === "blancas" ? "humano" : "ia";
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

          dot.addEventListener("click", (e) => {
            manejarClickPiezaDamas(r, c);
            e.stopPropagation();
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
  function manejarClickPiezaDamas(r, c) {
    const seleccion = estadoGlobalDamas.seleccionActualDamas;
    if (seleccion && seleccion.r === r && seleccion.c === c) {
      estadoGlobalDamas.seleccionActualDamas = null;
      estadoGlobalDamas.movimientosDisponiblesDamas = [];
      dibujarTableroDamas();
      return;
    }
    if (estadoGlobalDamas.juegoTerminadoFlag) return;
    if (estadoGlobalDamas.turnoActualDamas !== "humano") return;

    const ficha = estadoGlobalDamas.matrizDamas[r][c];
    const esHumano =
      ficha && ficha.dueño === estadoGlobalDamas.ladoHumanoAsignado;

    if (esHumano) {
      estadoGlobalDamas.seleccionActualDamas = { r, c };

      const todasLasCapturas = buscarCapturasGeneralesDamas("humano");

      if (todasLasCapturas.length) {
        estadoGlobalDamas.movimientosDisponiblesDamas = todasLasCapturas.filter(
          (m) => m.desde.r === r && m.desde.c === c
        );
      } else {
        estadoGlobalDamas.movimientosDisponiblesDamas =
          calcularMovimientosDesdeDamas(r, c);
      }

      if (estadoGlobalDamas.movimientosDisponiblesDamas.length === 0) {
        estadoGlobalDamas.seleccionActualDamas = null;
        return;
      }

      resaltarSeleccionDamas();
      return;
    }

    if (estadoGlobalDamas.seleccionActualDamas) {
      const mov = estadoGlobalDamas.movimientosDisponiblesDamas.find(
        (m) => m.hacia.r === r && m.hacia.c === c
      );
      if (mov) ejecutarMovimientoDamas(mov);
    }
  }

  function resaltarSeleccionDamas() {
    dibujarTableroDamas();
    const { r, c } = estadoGlobalDamas.seleccionActualDamas;
    const idx = indicePlanoDamas(r, c);
    const celda = tableroDamasPrincipal.children[idx];
    const dot = celda.querySelector(".dot-pieza");
    if (dot) dot.style.outline = "4px solid #fff8";

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
              copia[tr][tc].rey
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

  function ejecutarMovimientoDamas(mov) {
    if (animacionEnCurso) return;

    const { desde, hacia, capturas, reyDespues } = mov;
    const pieza = estadoGlobalDamas.matrizDamas[desde.r][desde.c];

    // SONIDO
    if (reyDespues && !pieza.rey) {
      sonidosDamas.coronar();
    } else if (capturas.length) {
      sonidosDamas.comer();
    } else {
      sonidosDamas.movimiento();
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
          (m) => m.capturas.length
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

    const rectActual = celdaActual.getBoundingClientRect();
    const rectDestino = celdaDestino.getBoundingClientRect();
    const dx = rectDestino.left - rectActual.left;
    const dy = rectDestino.top - rectActual.top;

    ficha.style.transition = "transform 1000ms ease-in-out";
    ficha.style.transform = `translate(${dx}px, ${dy}px)`;

    setTimeout(() => {
      ficha.style.transition = "none";
      ficha.style.transform = "translate(0, 0)";
      celdaDestino.appendChild(ficha);
      callback();
    }, 1000);
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

    const rectActual = celdaActual.getBoundingClientRect();
    const rectDestino = celdaDestino.getBoundingClientRect();
    const dx = rectDestino.left - rectActual.left;
    const dy = rectDestino.top - rectActual.top;

    ficha.style.transition = "transform 1000ms ease-in-out";
    ficha.style.transform = `translate(${dx}px, ${dy}px)`;

    setTimeout(() => {
      ficha.style.transition = "none";
      ficha.style.transform = "translate(0, 0)";
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
      { duration: 1200, easing: "ease-out" }
    );

    ficha.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.2)" },
        { transform: "scale(1)" },
      ],
      { duration: 800, easing: "ease-in-out" }
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

  // ======================================================================
  // FIN DE TURNO / IA / GANADOR
  // ======================================================================
  function terminarTurnoDamas() {
    if (animacionEnCurso) return;

    evaluarGanadorDamas();
    if (estadoGlobalDamas.juegoTerminadoFlag) return;

    estadoGlobalDamas.turnoActualDamas =
      estadoGlobalDamas.turnoActualDamas === "humano" ? "ia" : "humano";
    actualizarPanelInfoDamas();

    if (estadoGlobalDamas.turnoActualDamas === "ia")
      setTimeout(movimientoIA_Damas, 950);
  }

  function evaluarGanadorDamas() {
    let humano = 0,
      ia = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = estadoGlobalDamas.matrizDamas[r][c];
        if (!p) continue;
        p.dueño === estadoGlobalDamas.ladoHumanoAsignado ? humano++ : ia++;
      }

    if (humano === 0) {
      estadoGlobalDamas.juegoTerminadoFlag = true;
      document.getElementById("ganador-info").textContent = "MÁQUINA";
      document.getElementById("mensaje-estado-damas").textContent =
        "Perdiste sin fichas.";
      mostrarModalFin(false);
    } else if (ia === 0) {
      estadoGlobalDamas.juegoTerminadoFlag = true;
      document.getElementById("ganador-info").textContent = "TÚ";
      document.getElementById("mensaje-estado-damas").textContent =
        "Ganaste sin oposición.";
      mostrarModalFin(true);
    }
  }

  function mostrarModalFin(gano) {
    const modal = document.getElementById("modal-fin-damas");
    const icono = document.getElementById("icono-resultado");
    const mensaje = document.getElementById("mensaje-resultado");

    modal.style.display = "flex";
    if (gano) {
      icono.textContent = "🏆";
      mensaje.textContent = "¡Has ganado!";
      sonidosDamas.ganar();
    } else {
      icono.textContent = "❌";
      mensaje.textContent = "Has perdido";
      sonidosDamas.perder();
    }

    document.getElementById("boton-reiniciar-modal").onclick = () => {
      modal.style.display = "none";
      estadoGlobalDamas.juegoTerminadoFlag = false;
      JuegoDamas.reset();
    };

    document.getElementById("boton-salir-modal").onclick = () => {
      location.href = "../../index.html";
    };
  }

  function movimientoIA_Damas() {
    if (estadoGlobalDamas.juegoTerminadoFlag) return;

    const movs = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = estadoGlobalDamas.matrizDamas[r][c];
        if (!p || p.dueño === estadoGlobalDamas.ladoHumanoAsignado) continue;
        calcularMovimientosDesdeDamas(r, c).forEach((m) => movs.push(m));
      }

    if (!movs.length) {
      estadoGlobalDamas.juegoTerminadoFlag = true;
      document.getElementById("ganador-info").textContent = "TÚ";
      return;
    }

    const capt = movs.filter((m) => m.capturas.length);
    const pool = capt.length ? capt : movs;
    const choice = pool[Math.floor(Math.random() * pool.length)];

    estadoGlobalDamas.seleccionActualDamas = choice.desde;
    dibujarTableroDamas();

    setTimeout(() => ejecutarMovimientoDamas(choice), 1000);
  }

  // ======================================================================
  // PANEL INFO
  // ======================================================================
  function actualizarPanelInfoDamas() {
    document.getElementById("turno-info").textContent =
      estadoGlobalDamas.turnoActualDamas === "humano" ? "TÚ" : "MÁQUINA";

    const caps = buscarCapturasGeneralesDamas(
      estadoGlobalDamas.turnoActualDamas
    );
    document.getElementById("captura-obligatoria-info").textContent =
      caps.length ? caps.length : "—";

    document.getElementById("capturas-humano-info").textContent =
      estadoGlobalDamas.capturasHumano;
    document.getElementById("capturas-ia-info").textContent =
      estadoGlobalDamas.capturasIA;
    document.getElementById("color-humano-info").textContent =
      estadoGlobalDamas.colorHumano === "blancas" ? "Blancas" : "Negras";
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
            (x) => x.capturas.length
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
    document.getElementById("lado-humano-info").textContent = "Abajo";
    sortearColoresYTurno();

    estadoGlobalDamas.seleccionActualDamas = null;
    estadoGlobalDamas.movimientosDisponiblesDamas = [];
    estadoGlobalDamas.juegoTerminadoFlag = false;
    estadoGlobalDamas.capturasHumano = 0;
    estadoGlobalDamas.capturasIA = 0;

    document.getElementById("ganador-info").textContent = "—";
    document.getElementById("mensaje-estado-damas").textContent = "";

    dibujarTableroDamas();

    if (estadoGlobalDamas.turnoActualDamas === "ia")
      setTimeout(movimientoIA_Damas, 500);
  }

  // ======================================================================
  // INICIALIZACIÓN
  // ======================================================================
  function init() {
    document
      .getElementById("salirDamas")
      ?.addEventListener("click", () => (location.href = "../../index.html"));

    document
      .getElementById("boton-reinicio-damas")
      .addEventListener("click", resetGameDamasUltra);

    /*document
      .getElementById("boton-voltear-damas")
      .addEventListener("click", () => {
        estadoGlobalDamas.tableroGiradoFlag =
          !estadoGlobalDamas.tableroGiradoFlag;
        tableroDamasPrincipal.style.transform =
          estadoGlobalDamas.tableroGiradoFlag ? "rotate(180deg)" : "";
      });*/

    resetGameDamasUltra();
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    reset: resetGameDamasUltra,
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
