// -----JUEGO OPERACIONES-----
// Constantes globales para el juego de operaciones
const MAX_OPERACIONES = 50;
const MAX_OPERANDO = 1000;

// Obtener elementos del DOM para configuración
const nivelSelect = document.getElementById("nivel");
const inputMaximo = document.getElementById("input-maximo");

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

// Array para almacenar las operaciones generadas
let operaciones = [];

// Función principal para iniciar el juego de operaciones (EXPORTADA GLOBALMENTE)
window.iniciar = function () {
  // Obtener valores de configuración del usuario
  const nivel = parseInt(document.getElementById("nivel").value);
  const numOperaciones = parseInt(
    document.getElementById("input-operaciones").value
  );
  const maxValor =
    parseInt(document.getElementById("input-maximo").value) || MAX_OPERANDO;

  // Validaciones de entrada
  if (
    isNaN(numOperaciones) ||
    numOperaciones < 1 ||
    numOperaciones > MAX_OPERACIONES
  ) {
    alert("Por favor, introduce un número válido de operaciones.");
    return;
  }

  if (
    nivel === 1 &&
    (isNaN(maxValor) || maxValor < 0 || maxValor > MAX_OPERANDO)
  ) {
    alert("Por favor, introduce un número válido para el máximo operando.");
    return;
  }

  // Ocultar modal de configuración y generar operaciones
  document.getElementById("modal-operaciones").style.display = "none";
  generarOperaciones(numOperaciones, nivel, maxValor);
};

// Función para generar las operaciones matemáticas
function generarOperaciones(cantidad, nivel, max) {
  const pizarra = document.getElementById("pizarra");
  pizarra.innerHTML = ""; // Limpiar pizarra anterior
  operaciones = []; // Reiniciar array de operaciones

  // Generar cada operación
  for (let i = 0; i < cantidad; i++) {
    let a, b, operador, resultadoReal;

    // Lógica diferente según el nivel seleccionado
    if (nivel === 1) {
      // Nivel 1: sumas y restas sin resultados negativos
      a = Math.floor(Math.random() * (max + 1));
      b = Math.floor(Math.random() * (max + 1));
      operador = Math.random() < 0.5 ? "+" : "-";

      // Evitar resultados negativos en restas
      if (operador === "-" && b > a) {
        [a, b] = [b, a]; // Intercambiar valores
      }
      resultadoReal = operador === "+" ? a + b : a - b;
    } else {
      // Nivel 2: todas las operaciones básicas (+,-,*,/)
      const operadores = ["+", "-", "*", "/"];
      operador = operadores[Math.floor(Math.random() * operadores.length)];
      a = Math.floor(Math.random() * (MAX_OPERANDO + 1));
      b = Math.floor(Math.random() * (MAX_OPERANDO + 1));

      // Lógica específica para cada operador
      if (operador === "/") {
        while (b === 0) {
          b = Math.floor(Math.random() * (MAX_OPERANDO + 1)); // evitar división entre 0
        }
        resultadoReal = a / b;
        resultadoReal = parseFloat(resultadoReal.toFixed(2)); // limitar decimales
      } else if (operador === "+") {
        resultadoReal = a + b;
      } else if (operador === "-") {
        resultadoReal = a - b;
      } else if (operador === "*") {
        resultadoReal = a * b;
      }
    }

    // Guardar operación en el array
    operaciones.push({ a, b, operador, resultadoReal });

    // Crear elemento HTML para la operación
    let div = document.createElement("div");
    div.className = "operacion";

    let input = document.createElement("input");
    input.type = "number";
    input.className = "resultado-input";

    // Evento para limpiar estilos al enfocar
    input.addEventListener("focus", () => {
      if (
        input.classList.contains("incorrecto") ||
        input.classList.contains("correcto")
      ) {
        input.value = "";
        input.classList.remove("incorrecto", "correcto");
      }
    });

    // Estructura visual de la operación
    div.innerHTML = `${a}<br>${operador} ${b}<br><hr>`;
    div.appendChild(input);
    pizarra.appendChild(div);
  }
}

// Botón para salir del juego de operaciones
const botonSalirOperaciones = document.getElementById(
  "boton-salir-operaciones"
);
if (botonSalirOperaciones) {
  botonSalirOperaciones.addEventListener("click", () => {
    location.href = "../../index.html";
  });
}

// Función para comprobar las respuestas del usuario
window.comprobarRespuestas = function () {
  const inputs = document.querySelectorAll(".resultado-input");
  inputs.forEach((input, index) => {
    let valorUsuario = parseFloat(input.value);
    let correcto = valorUsuario === operaciones[index].resultadoReal;

    // Aplicar estilos según si es correcto o incorrecto
    input.classList.remove("correcto", "incorrecto");
    input.classList.add(correcto ? "correcto" : "incorrecto");
    if (correcto) input.disabled = true; // Bloquear inputs correctos
  });
};
