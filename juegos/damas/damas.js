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

  const estadoGlobalDamas = {
    matrizDamas: [],
    ladoHumanoAsignado: null, // 'top' / 'bottom'
    turnoActualDamas: null, // 'humano' / 'ia'
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

    // Coloca fichas arriba (top)
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 8; c++)
        if ((r + c) % 2 === 1)
          estadoGlobalDamas.matrizDamas[r][c] = { dueño: "top", rey: false };

    // Coloca fichas abajo (bottom)
    for (let r = 5; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if ((r + c) % 2 === 1)
          estadoGlobalDamas.matrizDamas[r][c] = { dueño: "bottom", rey: false };
  }

  // ======================================================================
  // SORTEO DE LADOS Y TURNO
  // ======================================================================
  function sortearRolesDamas() {
    estadoGlobalDamas.ladoHumanoAsignado =
      Math.random() < 0.5 ? "top" : "bottom";
    estadoGlobalDamas.turnoActualDamas = Math.random() < 0.5 ? "humano" : "ia";

    document.getElementById("lado-humano-info").textContent =
      estadoGlobalDamas.ladoHumanoAsignado === "top" ? "Arriba" : "Abajo";
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
            dot.classList.add(esHumano ? "pieza-humano" : "pieza-ia");
            if (pieza.rey) dot.classList.add("rey-damas");
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
      for (const [dr, dc] of reyAhora
        ? direcciones
        : [
            [mueveAbajo, 1],
            [mueveAbajo, -1],
          ]) {
        const mr = x + dr,
          mc = y + dc;
        const tr = x + 2 * dr,
          tc = y + 2 * dc;
        if (enLimiteDamas(mr, mc) && enLimiteDamas(tr, tc)) {
          const medio = matriz[mr][mc];
          const dest = matriz[tr][tc];
          if (medio && medio.dueño !== matriz[x][y].dueño && !dest) {
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

    // Movimientos simples
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
    const { desde, hacia, capturas, reyDespues } = mov;

    const pieza = estadoGlobalDamas.matrizDamas[desde.r][desde.c];
    estadoGlobalDamas.matrizDamas[hacia.r][hacia.c] = pieza;
    estadoGlobalDamas.matrizDamas[desde.r][desde.c] = null;

    if (capturas.length) {
      capturas.forEach((c) => (estadoGlobalDamas.matrizDamas[c.r][c.c] = null));
      if (estadoGlobalDamas.turnoActualDamas === "humano") {
        estadoGlobalDamas.capturasHumano += capturas.length;
      } else {
        estadoGlobalDamas.capturasIA += capturas.length;
      }
    }

    if (reyDespues && !pieza.rey) {
      pieza.rey = true;
      sonidosDamas.coronar();
    } else if (capturas.length) {
      sonidosDamas.comer();
    } else {
      sonidosDamas.movimiento();
    }

    estadoGlobalDamas.seleccionActualDamas = null;
    estadoGlobalDamas.movimientosDisponiblesDamas = [];
    dibujarTableroDamas();

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

  // ======================================================================
  // FIN DE TURNO / IA / GANADOR
  // ======================================================================
  function terminarTurnoDamas() {
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

    // Botones
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

    setTimeout(() => ejecutarMovimientoDamas(choice), 600);
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
    sortearRolesDamas();
    estadoGlobalDamas.seleccionActualDamas = null;
    estadoGlobalDamas.movimientosDisponiblesDamas = [];
    estadoGlobalDamas.juegoTerminadoFlag = false;
    estadoGlobalDamas.capturasHumano = 0;
    estadoGlobalDamas.capturasIA = 0;

    document.getElementById("ganador-info").textContent = "—";
    document.getElementById("mensaje-estado-damas").textContent = "";

    dibujarTableroDamas();

    if (estadoGlobalDamas.turnoActualDamas === "ia")
      setTimeout(movimientoIA_Damas, 300);
  }

  // ======================================================================
  // INICIALIZACIÓN
  // ======================================================================
  function init() {
    const salirDamas = document.getElementById("salirDamas");
    if (salirDamas)
      salirDamas.addEventListener(
        "click",
        () => (location.href = "../../index.html")
      );

    document
      .getElementById("boton-reinicio-damas")
      .addEventListener("click", resetGameDamasUltra);

    document
      .getElementById("boton-voltear-damas")
      .addEventListener("click", () => {
        estadoGlobalDamas.tableroGiradoFlag =
          !estadoGlobalDamas.tableroGiradoFlag;
        tableroDamasPrincipal.style.transform =
          estadoGlobalDamas.tableroGiradoFlag ? "rotate(180deg)" : "";
      });

    resetGameDamasUltra();
  }

  document.addEventListener("DOMContentLoaded", init);

  // ==========================
  // EXPONER FUNCIONES (OPCIONAL)
  // ==========================
  return {
    reset: resetGameDamasUltra,
  };
})();
