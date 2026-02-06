// -----JUEGO OPERACIONES-----

// Constantes globales para el juego de operaciones
const MIN_OPERACIONES = 3;
const MAX_OPERACIONES = 50;

const MIN_OPERANDO = 3;
const MAX_OPERANDO = 1000;

const MIN_TIEMPO = 5; // si lo usas luego

// =============================
// INICIALIZACIÓN DE IDIOMA
// =============================

// Función auxiliar para obtener traducciones
function t(key) {
  if (!window.translations) return key;
  return window.translations[key] || key;
}

document.addEventListener("languageChanged", () => {
  applyStaticTranslations();
  updateDynamicTexts();
});

function applyStaticTranslations() {
  if (!window.translations) return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (window.translations[key]) {
      el.textContent = window.translations[key];
    }
  });

  // Marcar que las traducciones se han cargado
  document.body.classList.add("translations-loaded");
}

// Asegurar que se muestre incluso si no hay traducciones
setTimeout(() => {
  document.body.classList.add("translations-loaded");
}, 500);

function updateDynamicTexts() {
  if (!window.translations) return;

  // Placeholders
  const elements = [
    { id: "input-operaciones", key: "operaciones.numOperationsPlaceholder" },
    { id: "input-maximo", key: "operaciones.maxOperatorPlaceholder" },
    { id: "input-tiempo", key: "operaciones.timeOptionalPlaceholder" },
    { id: "input-maximo-nivel2", key: "operaciones.maxCoefficientPlaceholder" },
  ];

  elements.forEach((item) => {
    const element = document.getElementById(item.id);
    if (element && window.translations[item.key]) {
      element.placeholder = window.translations[item.key];
    }
  });

  // Select opciones
  const nivelSelectElement = document.getElementById("nivel");
  if (nivelSelectElement) {
    const option1 = nivelSelectElement.options[0];
    const option2 = nivelSelectElement.options[1];
    if (option1 && window.translations["operaciones.level1"]) {
      option1.text = window.translations["operaciones.level1"];
    }
    if (option2 && window.translations["operaciones.level2"]) {
      option2.text = window.translations["operaciones.level2"];
    }
  }

  // Labels checkboxes
  const labels = [
    { selector: 'label[for="op-suma"] span', key: "operaciones.additions" },
    { selector: 'label[for="op-resta"] span', key: "operaciones.subtractions" },
    {
      selector: 'label[for="op-multi"] span',
      key: "operaciones.multiplications",
    },
    { selector: 'label[for="op-div"] span', key: "operaciones.divisions" },
    {
      selector: 'label[for="resta-negativa"] span',
      key: "operaciones.allowNegative",
    },
  ];

  labels.forEach((item) => {
    const label = document.querySelector(item.selector);
    if (label && window.translations[item.key]) {
      label.textContent = window.translations[item.key];
    }
  });
}

document.addEventListener("languageChanged", () => {
  applyStaticTranslations();
  updateDynamicTexts();
});

// Obtener elementos del DOM para configuración
const nivelSelect = document.getElementById("nivel");
const inputMaximo = document.getElementById("input-maximo");

let numeroComprobaciones = 0;
let nivelDesafio = 1;
let tiempoRestante = 480;
let intervaloCrono = null;
let modoActual = "normal";
let comprobacionBloqueada = false;
let inicioTiempo = null;
let tiempoLimiteModoNormal = null;
let contextoSalida = null; // "juego" | "menu"
let ultimoGrupoEdadSuperado = "";

// ───── SONIDOS ─────
const sonidoComprobar = new Audio("sounds/ping.mp3");
const sonidoFinal = new Audio("sounds/finalOperaciones.mp3");
const sonidoFinTiempo = new Audio("sounds/fin-time.mp3");
const sonidoNuevoNivel = new Audio("sounds/new-level.mp3");
const sonidoGranVictoria = new Audio("sounds/gran-victoria.mp3");
const sonidoSuperacionEdad = new Audio("sounds/edad.mp3");
sonidoGranVictoria.preload = "auto";
sonidoSuperacionEdad.preload = "auto";

// Para evitar retrasos al reproducir
[sonidoComprobar, sonidoFinal, sonidoFinTiempo, sonidoNuevoNivel].forEach(
  (audio) => (audio.preload = "auto"),
);

function reproducirSonido(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// Modal instrucciones
function abrirModalInstrucciones() {
  document.getElementById("modal-instrucciones").classList.remove("oculto");
}

function cerrarModalInstrucciones() {
  document.getElementById("modal-instrucciones").classList.add("oculto");
}

function reglasNivel(nivel) {
  let reglas = {
    cantidad: 5,
    max: 10,
    negativos: false,
    ops: ["+"],
    tiempo: 480,
    grupoEdad: "",
    minEdad: 0,
    maxEdad: 0,
  };

  // ───────────────
  // 6–7 años
  // ───────────────
  if (nivel === 1) {
    reglas.ops = ["+"];
    reglas.cantidad = 5;
    reglas.max = 5;
    reglas.grupoEdad = "6 a 7 años";
    reglas.minEdad = 6;
    reglas.maxEdad = 7;
  }

  if (nivel === 2) {
    reglas.ops = ["+", "-"];
    reglas.cantidad = 5;
    reglas.max = 5;
    reglas.grupoEdad = "6 a 7 años";
    reglas.minEdad = 6;
    reglas.maxEdad = 7;
  }

  if (nivel === 3) {
    reglas.cantidad = 6;
    reglas.max = 10;
    reglas.grupoEdad = "6 a 7 años";
    reglas.minEdad = 6;
    reglas.maxEdad = 7;
  }

  if (nivel === 4) {
    reglas.cantidad = 8;
    reglas.max = 10;
    reglas.grupoEdad = "6 a 7 años";
    reglas.minEdad = 6;
    reglas.maxEdad = 7;
  }

  if (nivel === 5) {
    reglas.cantidad = 10;
    reglas.max = 10;
    reglas.tiempo = 420;
    reglas.grupoEdad = "6 a 7 años";
    reglas.minEdad = 6;
    reglas.maxEdad = 7;
  }

  // ───────────────
  // 7–8 años
  // ───────────────
  if (nivel === 6) {
    reglas.cantidad = 8;
    reglas.max = 20;
    reglas.grupoEdad = "7 a 8 años";
    reglas.minEdad = 7;
    reglas.maxEdad = 8;
  }

  if (nivel === 7) {
    reglas.cantidad = 10;
    reglas.max = 20;
    reglas.grupoEdad = "7 a 8 años";
    reglas.minEdad = 7;
    reglas.maxEdad = 8;
  }

  if (nivel === 8) {
    reglas.cantidad = 10;
    reglas.max = 30;
    reglas.grupoEdad = "7 a 8 años";
    reglas.minEdad = 7;
    reglas.maxEdad = 8;
  }

  if (nivel === 9) {
    reglas.cantidad = 12;
    reglas.max = 30;
    reglas.grupoEdad = "7 a 8 años";
    reglas.minEdad = 7;
    reglas.maxEdad = 8;
  }

  if (nivel === 10) {
    reglas.cantidad = 12;
    reglas.max = 50;
    reglas.tiempo = 360;
    reglas.grupoEdad = "7 a 8 años";
    reglas.minEdad = 7;
    reglas.maxEdad = 8;
  }

  // ───────────────
  // 8–9 años (multiplicación)
  // ───────────────
  if (nivel === 11) {
    reglas.ops = ["+", "-", "*"];
    reglas.cantidad = 8;
    reglas.max = 10;
    reglas.grupoEdad = "8 a 9 años";
    reglas.minEdad = 8;
    reglas.maxEdad = 9;
  }

  if (nivel === 12) {
    reglas.cantidad = 10;
    reglas.max = 10;
    reglas.grupoEdad = "8 a 9 años";
    reglas.minEdad = 8;
    reglas.maxEdad = 9;
  }

  if (nivel === 13) {
    reglas.cantidad = 10;
    reglas.max = 20;
    reglas.grupoEdad = "8 a 9 años";
    reglas.minEdad = 8;
    reglas.maxEdad = 9;
  }

  if (nivel === 14) {
    reglas.cantidad = 12;
    reglas.max = 20;
    reglas.tiempo = 360;
    reglas.grupoEdad = "8 a 9 años";
    reglas.minEdad = 8;
    reglas.maxEdad = 9;
  }

  // ───────────────
  // 9–10 años (división exacta)
  // ───────────────
  if (nivel === 15) {
    reglas.ops = ["+", "-", "*", "/"];
    reglas.cantidad = 8;
    reglas.max = 10;
    reglas.grupoEdad = "9 a 10 años";
    reglas.minEdad = 9;
    reglas.maxEdad = 10;
  }

  if (nivel === 16) {
    reglas.cantidad = 10;
    reglas.max = 20;
    reglas.grupoEdad = "9 a 10 años";
    reglas.minEdad = 9;
    reglas.maxEdad = 10;
  }

  if (nivel === 17) {
    reglas.cantidad = 12;
    reglas.max = 30;
    reglas.grupoEdad = "9 a 10 años";
    reglas.minEdad = 9;
    reglas.maxEdad = 10;
  }

  if (nivel === 18) {
    reglas.cantidad = 14;
    reglas.max = 30;
    reglas.tiempo = 300;
    reglas.grupoEdad = "9 a 10 años";
    reglas.minEdad = 9;
    reglas.maxEdad = 10;
  }

  // ───────────────
  // RETO FINAL
  // ───────────────
  if (nivel === 19) {
    reglas.negativos = true;
    reglas.cantidad = 12;
    reglas.max = 20;
    reglas.grupoEdad = "Reto Final";
    reglas.minEdad = 10;
    reglas.maxEdad = 12;
  }

  if (nivel === 20) {
    reglas.negativos = true;
    reglas.cantidad = 15;
    reglas.max = 30;
    reglas.tiempo = 300;
    reglas.grupoEdad = "Reto Final";
    reglas.minEdad = 10;
    reglas.maxEdad = 12;
  }

  return reglas;
}

function iniciarModoDesafio() {
  modoActual = "desafio";
  nivelDesafio = 1;
  lanzarNivelDesafio();
}

function lanzarNivelDesafio() {
  document.getElementById("pizarra").innerHTML = "";
  document.getElementById("cronometro").classList.remove("oculto");

  const reglas = reglasNivel(nivelDesafio);
  comprobacionBloqueada = false;

  tiempoRestante = reglas.tiempo; // USAR EL TIEMPO DEL NIVEL
  iniciarCronometro();

  for (let i = 0; i < reglas.cantidad; i++) {
    let op = reglas.ops[Math.floor(Math.random() * reglas.ops.length)];
    let a, b;

    if (op === "/") {
      b = random(reglas.max, false) || 1;
      a = random(reglas.max, false);
      a = Math.floor(a / b) * b;
    } else {
      a = random(reglas.max, reglas.negativos);
      b = random(reglas.max, reglas.negativos);
      if (op === "-" && !reglas.negativos && b > a) [a, b] = [b, a];
    }

    crearOperacion(a, b, op);
  }
}

function iniciarCronometro() {
  clearInterval(intervaloCrono);

  intervaloCrono = setInterval(() => {
    tiempoRestante--;

    const min = String(Math.floor(tiempoRestante / 60)).padStart(2, "0");
    const sec = String(tiempoRestante % 60).padStart(2, "0");

    document.getElementById("tiempo").textContent = `${min}:${sec}`;

    if (tiempoRestante <= 0) {
      clearInterval(intervaloCrono);
      derrotaTiempo();
    }
  }, 1000);
}

function salirModoDesafio() {
  // parar cronómetro
  clearInterval(intervaloCrono);
  intervaloCrono = null;
  comprobacionBloqueada = false;

  // reset estado
  modoActual = "normal";
  nivelDesafio = 1;
  tiempoRestante = 480;
  numeroComprobaciones = 0;

  // limpiar pizarra
  document.getElementById("pizarra").innerHTML = "";

  // ocultar cronómetro
  document.getElementById("cronometro").classList.add("oculto");

  // cerrar modales
  cerrarModalAviso();
  document.getElementById("modal-final").classList.add("oculto");

  // volver a elegir modo
  document.getElementById("modal-modo").style.display = "flex";
}

const NIVELES_ULTIMOS_GRUPO = [5, 10, 14, 18, 20];

function mostrarModalNivelSuperado() {
  // nuevo nivel
  reproducirSonido(sonidoNuevoNivel);

  // Obtener información del nivel COMPLETADO (nivelDesafio - 1 es el que acaba de completar)
  const nivelCompletado = nivelDesafio - 1;
  const reglasCompletado = reglasNivel(nivelCompletado);

  // Verificar si el nivel completado es el ÚLTIMO de su grupo de edad
  if (NIVELES_ULTIMOS_GRUPO.includes(nivelCompletado)) {
    // Obtener información del SIGUIENTE nivel (el que vamos a jugar)
    const reglasSiguiente = reglasNivel(nivelDesafio);

    // Mostrar modal especial de nivel de edad
    mostrarModalNivelEdad(
      reglasSiguiente.grupoEdad,
      reglasCompletado.grupoEdad,
    );
    return;
  }

  // Si no es un cambio de edad, mostrar el modal normal
  mostrarModalAviso(
    `🎉 ${t("operaciones.levelCompleted") || "Nivel"} ${nivelCompletado} ${
      t("operaciones.superado") || "superado"
    }`,
  );
  setTimeout(() => {
    cerrarModalAviso();
    lanzarNivelDesafio();
  }, 2000);
}

function mostrarModalNivelEdad(nuevoGrupoEdad, grupoAnterior) {
  reproducirSonido(sonidoSuperacionEdad);

  // Traducciones según el idioma
  const felicidades = t("operaciones.congratulations") || "¡Felicidades!";
  const hasSuperado =
    t("operaciones.hasCompleted") || "Has superado el nivel para";
  const quieresContinuar =
    t("operaciones.continueChallenge") ||
    "¿Quieres continuar con el siguiente nivel?";
  const yAhoraComienzas = t("operaciones.andNowStarts") || "y ahora comienzas";

  document.getElementById("titulo-nivel-edad").textContent = felicidades;

  // Mostrar ambos grupos si hay un grupo anterior
  if (grupoAnterior && grupoAnterior !== nuevoGrupoEdad) {
    document.getElementById("mensaje-nivel-edad").textContent =
      `${hasSuperado} ${grupoAnterior} ${yAhoraComienzas} ${nuevoGrupoEdad}!`;
  } else {
    document.getElementById("mensaje-nivel-edad").textContent =
      `${hasSuperado} ${nuevoGrupoEdad}!`;
  }

  document.getElementById("detalle-nivel-edad").textContent = quieresContinuar;

  // Mostrar el modal
  document.getElementById("modal-nivel-edad").classList.remove("oculto");
}

function cerrarModalNivelEdad() {
  document.getElementById("modal-nivel-edad").classList.add("oculto");
}

function continuarDesafio() {
  cerrarModalNivelEdad();
  lanzarNivelDesafio();
}

function salirDeDesafio() {
  cerrarModalNivelEdad();
  salirModoDesafio();
}

function derrotaTiempo() {
  // fin por tiempo
  reproducirSonido(sonidoFinTiempo);

  mostrarModalAviso("operaciones.timeUp");

  setTimeout(() => {
    salirModoDesafio();
  }, 2500);
}

function mostrarVictoriaFinal() {
  clearInterval(intervaloCrono);

  reproducirSonido(sonidoGranVictoria);

  document.getElementById("modal-gran-victoria").classList.remove("oculto");
}

function cerrarGranVictoria() {
  document.getElementById("modal-gran-victoria").classList.add("oculto");
  salirModoDesafio();
}

function cambiarNivel() {
  const nivel = document.getElementById("nivel").value;
  const opciones = document.getElementById("opciones-nivel2");
  const inputNivel1 = document.getElementById("input-maximo");

  if (nivel === "2") {
    opciones.classList.remove("oculto");
    inputNivel1.style.display = "none";
    if (inputNivel1) {
      const translation =
        window.translations && window.translations["operaciones.notApplicable"];
      inputNivel1.placeholder = translation || "No aplicable en nivel 2";
    }
  } else {
    opciones.classList.add("oculto");
    inputNivel1.style.display = "block";
    if (inputNivel1) {
      const translation =
        window.translations &&
        window.translations["operaciones.maxOperatorPlaceholder"];
      inputNivel1.placeholder = translation || "Número Operador (solo nivel 1)";
      inputNivel1.disabled = false;
    }
  }
}

function iniciar() {
  const nivel = document.getElementById("nivel").value;
  const cantidadInput = document.getElementById("input-operaciones").value;
  const maxInput = document.getElementById("input-maximo").value;

  // Validar número de operaciones
  const cantidad = parseInt(cantidadInput, 10);

  if (
    !cantidadInput ||
    isNaN(cantidad) ||
    cantidad < MIN_OPERACIONES ||
    cantidad > MAX_OPERACIONES
  ) {
    mostrarModalAviso("operaciones.invalidNumOperations");
    return;
  }

  const tiempoInput = document.getElementById("input-tiempo").value;
  tiempoLimiteModoNormal = parseInt(tiempoInput, 10);

  if (isNaN(tiempoLimiteModoNormal) || tiempoLimiteModoNormal <= 0) {
    tiempoLimiteModoNormal = null;
  }

  if (nivel === "1") {
    // Validar máximo operando
    const max = parseInt(maxInput, 10);

    if (!maxInput || isNaN(max) || max < MIN_OPERANDO || max > MAX_OPERANDO) {
      mostrarModalAviso("operaciones.invalidMaxOperator");
      return;
    }

    document.getElementById("pizarra").innerHTML = "";
    document.getElementById("modal-operaciones").style.display = "none";
    generarNivel1(cantidad, max);
    requestAnimationFrame(() => {
      document.querySelector(".body-operaciones").scrollTop = 0;
    });
  } else {
    // Nivel 2: validar que haya al menos un tipo de operación seleccionada
    const operacionesSeleccionadas = [
      "op-suma",
      "op-resta",
      "op-multi",
      "op-div",
    ].some((id) => document.getElementById(id).checked);

    if (!operacionesSeleccionadas) {
      mostrarModalAviso("operaciones.selectAtLeastOne");
      return;
    }

    document.getElementById("pizarra").innerHTML = "";
    document.getElementById("modal-operaciones").style.display = "none";
    generarNivel2(cantidad);
    requestAnimationFrame(() => {
      document.querySelector(".body-operaciones").scrollTop = 0;
    });
  }

  inicioTiempo = Date.now();

  if (tiempoLimiteModoNormal) {
    modoActual = "normal";
    tiempoRestante = tiempoLimiteModoNormal;

    const cronometroElemento = document.getElementById("cronometro");
    cronometroElemento.classList.remove("oculto");

    actualizarCronometro(tiempoRestante);

    intervaloCrono = setInterval(() => {
      tiempoRestante--;

      actualizarCronometro(tiempoRestante);

      if (tiempoRestante <= 0) {
        clearInterval(intervaloCrono);
        derrotaTiempoNormal();
      }
    }, 1000);
  }
}

function actualizarCronometro(segundos) {
  const min = String(Math.floor(segundos / 60)).padStart(2, "0");
  const sec = String(segundos % 60).padStart(2, "0");
  document.getElementById("tiempo").textContent = `${min}:${sec}`;
}

function derrotaTiempoNormal() {
  // Bloquear cronómetro y comprobar que no se pueda seguir
  clearInterval(intervaloCrono);
  intervaloCrono = null;
  comprobacionBloqueada = true;
  document.getElementById("cronometro").classList.add("oculto");

  // Marcar todas las operaciones pendientes como incorrectas
  const inputs = document.querySelectorAll(".resultado-input");
  inputs.forEach((input) => {
    const opDiv = input.closest(".operacion");
    if (
      !input.value ||
      (opDiv.dataset.estado !== "bien" && opDiv.dataset.estado !== "mal")
    ) {
      input.value = input.value || "";
      input.classList.remove("correcto");
      input.classList.add("incorrecto");
      input.disabled = true;
      opDiv.dataset.estado = "mal";

      if (opDiv.dataset.primer === "") {
        opDiv.dataset.primer = "mal";
      }
    } else {
      input.disabled = true;
    }
  });

  // Reproducir sonido fin de tiempo
  reproducirSonido(sonidoFinTiempo);

  // Mostrar modal de fin de tiempo
  mostrarModalAviso("operaciones.timeUp");

  // Tras cerrar modal de aviso (o tras 2.5s), generar resumen final
  setTimeout(() => {
    cerrarModalAviso();
    generarResumenFinal();
  }, 2500);
}

function generarNivel1(cantidad, max) {
  for (let i = 0; i < cantidad; i++) {
    let a = random(max, false);
    let b = random(max, false);
    let op = Math.random() < 0.5 ? "+" : "-";

    if (op === "-" && b > a) {
      [a, b] = [b, a]; // evitar negativos
    }

    crearOperacion(a, b, op);
  }
}

function generarNivel2(cantidad) {
  const max =
    parseInt(document.getElementById("input-maximo-nivel2").value) || 10;

  const permitirNegativo = document.getElementById("resta-negativa").checked;

  const operaciones = [];
  if (document.getElementById("op-suma").checked) operaciones.push("+");
  if (document.getElementById("op-resta").checked) operaciones.push("-");
  if (document.getElementById("op-multi").checked) operaciones.push("*");
  if (document.getElementById("op-div").checked) operaciones.push("/");

  if (operaciones.length === 0) {
    mostrarModalAviso("operaciones.selectAtLeastOne");

    return;
  }

  for (let i = 0; i < cantidad; i++) {
    let op = operaciones[Math.floor(Math.random() * operaciones.length)];
    let a, b;

    switch (op) {
      case "+":
        a = random(max, permitirNegativo);
        b = random(max, permitirNegativo);
        break;

      case "-":
        a = random(max, permitirNegativo);
        b = random(max, permitirNegativo);

        if (!permitirNegativo && b > a) {
          [a, b] = [b, a]; // evita negativos
        }
        break;

      case "*":
        a = random(max, permitirNegativo);
        b = random(max, permitirNegativo);
        break;

      case "/":
        b = random(max, false) || 1;
        a = random(max, false);

        a = Math.floor(a / b) * b;
        break;
    }

    crearOperacion(a, b, op);
  }
}

function random(max, permitirNegativo) {
  if (permitirNegativo) {
    return Math.floor(Math.random() * (max * 2 + 1)) - max;
  }
  return Math.floor(Math.random() * (max + 1));
}

function crearOperacion(a, b, op) {
  const pizarra = document.getElementById("pizarra");

  const div = document.createElement("div");
  div.className = "operacion";

  let resultado;
  switch (op) {
    case "+":
      resultado = a + b;
      break;
    case "-":
      resultado = a - b;
      break;
    case "*":
      resultado = a * b;
      break;
    case "/":
      resultado = a / b;
      break;
  }

  div.dataset.resultado = resultado;
  div.dataset.operacion = op;
  div.dataset.estado = "pendiente"; // pendiente | bien | mal
  div.dataset.texto = `${a} ${op} ${b}`;
  div.dataset.primer = ""; // aún no evaluada
  div.dataset.intentos = "0"; // intentos fallidos

  div.innerHTML = `
  <div class="linea arriba">${a}</div>
  <div class="linea operador">${op} ${b}</div>
  <div class="linea raya"></div>
  <input type="number" class="resultado-input" />
`;

  const input = div.querySelector(".resultado-input");

  input.addEventListener("focus", () => {
    if (input.classList.contains("incorrecto")) {
      input.value = "";
      input.classList.remove("incorrecto");
    }
  });

  pizarra.appendChild(div);
}

// Configurar comportamiento del nivel 2 (deshabilitar operador máximo)
if (nivelSelect && inputMaximo) {
  nivelSelect.addEventListener("change", () => {
    if (nivelSelect.value === "2") {
      inputMaximo.disabled = true;
      inputMaximo.value = "";
      const notApplicableText =
        window.translations && window.translations["operaciones.notApplicable"];
      inputMaximo.placeholder = notApplicableText || "No aplicable en nivel 2";
    } else {
      inputMaximo.disabled = false;
      const maxOpText =
        window.translations &&
        window.translations["operaciones.maxOperatorPlaceholder"];
      inputMaximo.placeholder = maxOpText || "Número Operador (solo nivel 1)";
    }
  });

  // Ejecutar cambio inicial después de un pequeño delay para que las traducciones se carguen
  setTimeout(() => {
    if (nivelSelect) {
      nivelSelect.dispatchEvent(new Event("change"));
    }
  }, 500);
}

const btnComprobar = document.getElementById("btn-comprobar");

btnComprobar.addEventListener("click", (e) => {
  e.preventDefault();

  if (comprobacionBloqueada) return;

  reproducirSonido(sonidoComprobar);

  setTimeout(() => {
    comprobarRespuestas();
  }, 80); // 60–100 ms es ideal
});

function comprobarRespuestas() {
  numeroComprobaciones++;

  const operaciones = document.querySelectorAll(".operacion");

  operaciones.forEach((opDiv) => {
    // si ya está bien, no se vuelve a evaluar
    if (opDiv.dataset.estado === "bien") return;

    const input = opDiv.querySelector(".resultado-input");
    const valorTexto = input.value.trim();

    if (valorTexto === "") return;

    const correcto = Number(opDiv.dataset.resultado);
    const usuario = Number(valorTexto);

    input.classList.remove("correcto", "incorrecto");

    // ACERTADO
    if (usuario === correcto) {
      input.classList.add("correcto");
      input.disabled = true;
      opDiv.dataset.estado = "bien";

      // guardar PRIMER resultado si no existe
      if (opDiv.dataset.primer === "") {
        opDiv.dataset.primer = "bien";
      }
    }

    // FALLADO
    else {
      input.classList.add("incorrecto");

      // shake visual
      input.classList.add("shake");
      input.addEventListener(
        "animationend",
        () => input.classList.remove("shake"),
        { once: true },
      );

      // contar intentos
      let intentos = Number(opDiv.dataset.intentos) + 1;
      opDiv.dataset.intentos = intentos;

      // guardar PRIMER resultado si no existe
      if (opDiv.dataset.primer === "") {
        opDiv.dataset.primer = "mal";
      }

      // mostrar solución tras 3 fallos (solo modo normal)
      if (modoActual === "normal" && intentos >= 3) {
        input.value = correcto;
        input.classList.remove("incorrecto");
        input.classList.add("revelado");
        input.disabled = true;
        opDiv.dataset.estado = "bien";
      }
    }
  });

  // ¿Juego terminado?
  const terminado = [...operaciones].every(
    (op) => op.dataset.estado === "bien",
  );

  if (!terminado) {
    return;
  }

  // bloquear nuevas comprobaciones
  comprobacionBloqueada = true;

  // ───── MODO DESAFÍO ─────
  if (modoActual === "desafio") {
    clearInterval(intervaloCrono);
    nivelDesafio++;
    //if (nivelDesafio > 1) {
    if (nivelDesafio > 20) {
      // Cambiar a > 20 para el juego real
      mostrarVictoriaFinal();
    } else {
      mostrarModalNivelSuperado();
    }
    return;
  }

  // ───── MODO NORMAL ─────
  generarResumenFinal();
}

function generarResumenFinal() {
  const operaciones = document.querySelectorAll(".operacion");

  // victoria modo normal
  reproducirSonido(sonidoFinal);

  const estadisticas = {
    "+": { bien: 0, mal: 0 },
    "-": { bien: 0, mal: 0 },
    "*": { bien: 0, mal: 0 },
    "/": { bien: 0, mal: 0 },
  };

  const listaBien = [];
  const listaMal = [];

  operaciones.forEach((opDiv) => {
    const tipo = opDiv.dataset.operacion;
    const primer = opDiv.dataset.primer;
    const texto = opDiv.dataset.texto;

    if (primer === "bien") {
      estadisticas[tipo].bien++;
      listaBien.push(texto);
    }

    if (primer === "mal") {
      estadisticas[tipo].mal++;
      listaMal.push(texto);
    }
  });

  // ───── DETENER CRONÓMETRO ─────
  clearInterval(intervaloCrono);
  intervaloCrono = null;
  document.getElementById("cronometro").classList.add("oculto");

  // Calcular tiempo total transcurrido
  let tiempoTotalSeg = tiempoLimiteModoNormal
    ? tiempoLimiteModoNormal - tiempoRestante
    : Math.floor((Date.now() - inicioTiempo) / 1000);

  const minutos = Math.floor(tiempoTotalSeg / 60);
  const segundos = tiempoTotalSeg % 60;

  // Añadir al resumen general
  document.getElementById("resumen-general").innerHTML =
    `${
      t("operaciones.checksPerformed") || "Comprobaciones realizadas"
    }: ${numeroComprobaciones}<br>` +
    `${t("operaciones.timeElapsed") || "Tiempo transcurrido"}: ${minutos} ${
      t("common.min") || "min"
    } ${segundos} ${t("common.sec") || "seg"}`;

  mostrarModalFinal(
    estadisticas,
    listaBien,
    listaMal,
    numeroComprobaciones,
    tiempoTotalSeg,
  );
}

// Modal modo de juego
function modoNormal() {
  comprobacionBloqueada = false;

  document.getElementById("modal-modo").style.display = "none";
  document.getElementById("modal-operaciones").style.display = "flex";
}

function modoDesafio() {
  document.getElementById("modal-modo").style.display = "none";
  iniciarModoDesafio();
}

// Mostrar mensaje en el modal de aviso
function mostrarModalAviso(mensajeKey) {
  const modal = document.getElementById("modal-aviso");
  const mensajeP = document.getElementById("mensaje-aviso");

  // Si es una clave de traducción, traducirla
  const mensaje = t(mensajeKey) || mensajeKey;
  mensajeP.textContent = mensaje;
  modal.classList.remove("oculto");
}

// Cerrar modal
function cerrarModalAviso() {
  const modal = document.getElementById("modal-aviso");
  const mensajeP = document.getElementById("mensaje-aviso");
  mensajeP.textContent = "";
  modal.classList.add("oculto");
}

function mostrarModalFinal(
  stats,
  listaBien,
  listaMal,
  comprobaciones,
  tiempoSeg,
) {
  document.getElementById("modal-final").classList.remove("oculto");

  // calcular minutos y segundos
  const minutos = Math.floor(tiempoSeg / 60);
  const segundos = tiempoSeg % 60;

  // mostrar comprobaciones y tiempo en líneas separadas
  document.getElementById("resumen-general").innerHTML =
    `${
      t("operaciones.checksPerformed") || "Comprobaciones realizadas"
    }: ${comprobaciones}<br>` +
    `${t("operaciones.timeElapsed") || "Tiempo transcurrido"}: ${minutos} ${
      t("common.min") || "min"
    } ${segundos} ${t("common.sec") || "seg"}`;

  const nombres = {
    "+": t("operaciones.additions") || "Sumas",
    "-": t("operaciones.subtractions") || "Restas",
    "*": t("operaciones.multiplications") || "Multiplicaciones",
    "/": t("operaciones.divisions") || "Divisiones",
  };

  const contenedorStats = document.getElementById("estadisticas-operaciones");
  contenedorStats.innerHTML = "";

  for (const op in stats) {
    const { bien, mal } = stats[op];
    if (bien === 0 && mal === 0) continue;

    const p = document.createElement("p");
    p.textContent = `${nombres[op]} → ✔️ ${bien} | ❌ ${mal}`;
    contenedorStats.appendChild(p);
  }

  const ulBien = document.getElementById("lista-bien");
  ulBien.innerHTML = "";
  listaBien.forEach((op) => {
    const li = document.createElement("li");
    li.textContent = op;
    ulBien.appendChild(li);
  });

  const ulMal = document.getElementById("lista-mal");
  ulMal.innerHTML = "";
  listaMal.forEach((op) => {
    const li = document.createElement("li");
    li.textContent = op;
    ulMal.appendChild(li);
  });
}

function cerrarModalFinal() {
  document.getElementById("modal-final").classList.add("oculto");
}

// Desactivar efectos hover en touch devices para mejor rendimiento
if ("ontouchstart" in window) {
  document.body.classList.add("touch-device");
}

function salirAlMenu() {
  cerrarConfirmacionSalir();
  resetearTodo();

  // Mostrar modal inicial LIMPIO
  document.getElementById("modal-operaciones").style.display = "flex";
}

function resetearTodo() {
  // ─── Estado del juego ───
  clearInterval(intervaloCrono);
  intervaloCrono = null;

  modoActual = "normal";
  comprobacionBloqueada = false;
  numeroComprobaciones = 0;
  tiempoRestante = 0;
  ultimoGrupoEdadSuperado = "";

  // ─── UI del juego ───
  document.getElementById("pizarra").innerHTML = "";
  document.getElementById("cronometro").classList.add("oculto");

  // ─── Cerrar modales finales ───
  document.getElementById("modal-final").classList.add("oculto");
  document.getElementById("modal-gran-victoria").classList.add("oculto");

  // ─── RESET MODAL CONFIGURACIÓN ───
  const modal = document.getElementById("modal-operaciones");

  // Radios / checkboxes
  modal
    .querySelectorAll("input[type='radio'], input[type='checkbox']")
    .forEach((input) => (input.checked = false));
  // Checkboxes por defecto
  document.getElementById("op-suma").checked = true;
  document.getElementById("op-resta").checked = true;
  document.getElementById("op-multi").checked = true;
  document.getElementById("op-div").checked = true;
  document.getElementById("resta-negativa").checked = true;

  // Selects
  modal
    .querySelectorAll("select")
    .forEach((select) => (select.selectedIndex = 0));

  // Inputs texto / número
  modal
    .querySelectorAll("input[type='number'], input[type='text']")
    .forEach((input) => (input.value = ""));

  // Clases visuales de modo
  modal
    .querySelectorAll(".activo, .seleccionado")
    .forEach((el) => el.classList.remove("activo", "seleccionado"));
}

// BOTONES MODAL INICIAL
const btnModoNormal = document.getElementById("btn-modo-normal");
const btnModoDesafio = document.getElementById("btn-modo-desafio");
const btnInstrucciones = document.getElementById("btn-instrucciones");

if (btnModoNormal) {
  btnModoNormal.addEventListener("click", () => {
    modoNormal(); // abre modal de configuración
  });
}

if (btnModoDesafio) {
  btnModoDesafio.addEventListener("click", () => {
    modoDesafio(); // inicia modo desafío directamente
  });
}

if (btnInstrucciones) {
  btnInstrucciones.addEventListener("click", () => {
    abrirModalInstrucciones(); // abre modal instrucciones
  });
}

// ─────────────────────────────
// CONFIRMACIÓN SALIR DEL JUEGO
// ─────────────────────────────

function abrirConfirmacionSalir() {
  document.getElementById("modal-confirmar-salir").classList.remove("oculto");
}

function cerrarConfirmacionSalir() {
  document.getElementById("modal-confirmar-salir").classList.add("oculto");
}
function confirmarSalida() {
  cerrarConfirmacionSalir();

  if (contextoSalida === "menu") {
    window.location.href = "../../index.html";
    return;
  }

  // Salida desde el juego → reset TOTAL
  resetearTodo();

  // Volver al selector de modo
  document.getElementById("modal-modo").style.display = "flex";
}

// =============================
// BOTONES SALIR
// =============================

// Cerrar instrucciones
const btnCerrarInstrucciones = document.querySelector(
  "#modal-instrucciones button[data-i18n='common.close']",
);
if (btnCerrarInstrucciones) {
  btnCerrarInstrucciones.addEventListener("click", cerrarModalInstrucciones);
}

// Iniciar juego
const btnIniciar = document.querySelector(
  "#modal-operaciones button[data-i18n='common.start']",
);
if (btnIniciar) {
  btnIniciar.addEventListener("click", iniciar);
}

// Reiniciar (modal final y botones)
document
  .querySelectorAll("button[data-i18n='common.restart']")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      resetearTodo();
      document.getElementById("modal-modo").style.display = "flex";
    });
  });

// Cerrar gran victoria
const btnCerrarGranVictoria = document.querySelector(
  "#modal-gran-victoria button[data-i18n='common.accept']",
);
if (btnCerrarGranVictoria) {
  btnCerrarGranVictoria.addEventListener("click", cerrarGranVictoria);
}

// Cerrar modal aviso
const btnCerrarAviso = document.querySelector(
  "#modal-aviso button[data-i18n='common.accept']",
);
if (btnCerrarAviso) {
  btnCerrarAviso.addEventListener("click", cerrarModalAviso);
}

const modalConfirmar = document.getElementById("modal-confirmar-salir");
if (modalConfirmar) {
  const botones = modalConfirmar.querySelectorAll("button");

  const btnSi = botones[0];
  const btnNo = botones[1];

  btnSi.addEventListener("click", confirmarSalida);
  btnNo.addEventListener("click", cerrarConfirmacionSalir);
}

// Salir DESDE el juego
const btnSalirJuego = document.querySelector("#boton-salir-operaciones button");
if (btnSalirJuego) {
  btnSalirJuego.addEventListener("click", () => {
    contextoSalida = "juego";
    abrirConfirmacionSalir();
  });
}

// Salir DESDE el menú inicial
const btnSalirMenu = document.querySelector("#modal-modo .btn-exit");

if (btnSalirMenu) {
  btnSalirMenu.addEventListener("click", (e) => {
    e.preventDefault();
    contextoSalida = "menu";
    abrirConfirmacionSalir();
  });
}

// Salir DESDE el modal final
const btnSalirFinal = document.querySelector("#modal-final .btn-exit-final");

btnSalirFinal.addEventListener("click", (e) => {
  e.preventDefault();
  contextoSalida = "juego";
  abrirConfirmacionSalir();
});

// Botones modal niveles de edad
const btnContinuarDesafio = document.getElementById("btn-continuar-desafio");
const btnSalirDesafio = document.getElementById("btn-salir-desafio");

if (btnContinuarDesafio) {
  btnContinuarDesafio.addEventListener("click", continuarDesafio);
}

if (btnSalirDesafio) {
  btnSalirDesafio.addEventListener("click", salirDeDesafio);
}
