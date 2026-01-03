// -----JUEGO OPERACIONES-----
// Constantes globales para el juego de operaciones
const MAX_OPERACIONES = 50;
const MAX_OPERANDO = 1000;

// Obtener elementos del DOM para configuración
const nivelSelect = document.getElementById("nivel");
const inputMaximo = document.getElementById("input-maximo");

let numeroComprobaciones = 0;

function cambiarNivel() {
  const nivel = document.getElementById("nivel").value;
  const opciones = document.getElementById("opciones-nivel2");
  const inputNivel1 = document.getElementById("input-maximo");

  if (nivel === "2") {
    opciones.classList.remove("oculto");
    inputNivel1.style.display = "none";
  } else {
    opciones.classList.add("oculto");
    inputNivel1.style.display = "block";
  }
}

function iniciar() {
  const nivel = document.getElementById("nivel").value;
  const cantidadInput = document.getElementById("input-operaciones").value;
  const maxInput = document.getElementById("input-maximo").value;

  // Validar número de operaciones
  const cantidad = parseInt(cantidadInput);
  if (
    !cantidadInput ||
    isNaN(cantidad) ||
    cantidad < 1 ||
    cantidad > MAX_OPERACIONES
  ) {
    mostrarModalAviso("Introduce un número válido de operaciones (1-50).");
    return;
  }

  if (nivel === "1") {
    // Validar máximo operando
    const max = parseInt(maxInput);
    if (!maxInput || isNaN(max) || max < 0 || max > MAX_OPERANDO) {
      mostrarModalAviso(
        "Introduce un número válido para el máximo operando (0-1000)."
      );
      return;
    }
    document.getElementById("pizarra").innerHTML = "";
    document.getElementById("modal-operaciones").style.display = "none";
    generarNivel1(cantidad, max);
  } else {
    // Nivel 2: validar que haya al menos un tipo de operación seleccionada
    const operacionesSeleccionadas = [
      "op-suma",
      "op-resta",
      "op-multi",
      "op-div",
    ].some((id) => document.getElementById(id).checked);

    if (!operacionesSeleccionadas) {
      mostrarModalAviso("Selecciona al menos una operación en nivel 2.");
      return; // <-- aquí no hacemos nada más hasta que el usuario corrija
    }

    document.getElementById("pizarra").innerHTML = "";
    document.getElementById("modal-operaciones").style.display = "none";
    generarNivel2(cantidad);
  }
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
    mostrarModalAviso("Selecciona al menos una operación en nivel 2.");

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

  div.innerHTML = `
    <div class="linea arriba">${a}</div>
    <div class="linea operador">${op} ${b}</div>
    <div class="linea raya"></div>
    <input type="number" class="resultado-input" />
  `;

  pizarra.appendChild(div);
}

// Configurar comportamiento del nivel 2 (deshabilitar operador máximo)
if (nivelSelect && inputMaximo) {
  nivelSelect.addEventListener("change", () => {
    if (nivelSelect.value === "2") {
      inputMaximo.disabled = true;
      inputMaximo.value = "";
      inputMaximo.placeholder = "No aplicable en nivel 2";
    } else {
      inputMaximo.disabled = false;
      inputMaximo.placeholder = "Número Operador (solo nivel 1)";
    }
  });

  // Forzar estado al cargar la página para aplicar configuración inicial
  nivelSelect.dispatchEvent(new Event("change"));
}

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

      // guardar PRIMER resultado si no existe
      if (opDiv.dataset.primer === "") {
        opDiv.dataset.primer = "mal";
      }
    }
  });

  // ¿Juego terminado?
  const terminado = [...operaciones].every(
    (op) => op.dataset.estado === "bien"
  );

  if (terminado) {
    generarResumenFinal();
  }
}

function generarResumenFinal() {
  const operaciones = document.querySelectorAll(".operacion");

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

  mostrarModalFinal(estadisticas, listaBien, listaMal, numeroComprobaciones);
}

// Mostrar mensaje en el modal de aviso
function mostrarModalAviso(mensaje) {
  const modal = document.getElementById("modal-aviso");
  const mensajeP = document.getElementById("mensaje-aviso");
  mensajeP.textContent = mensaje; // asigna el mensaje
  modal.classList.remove("oculto"); // abre el modal
}

// Cerrar modal
function cerrarModalAviso() {
  const modal = document.getElementById("modal-aviso");
  const mensajeP = document.getElementById("mensaje-aviso"); // definirlo aquí también
  mensajeP.textContent = ""; // limpiar mensaje
  modal.classList.add("oculto");
}

function mostrarModalFinal(stats, listaBien, listaMal, comprobaciones) {
  document.getElementById("modal-final").classList.remove("oculto");

  document.getElementById(
    "resumen-general"
  ).textContent = `Comprobaciones realizadas: ${comprobaciones}`;

  const nombres = {
    "+": "Sumas",
    "-": "Restas",
    "*": "Multiplicaciones",
    "/": "Divisiones",
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
