// js de todos los juegos

document.addEventListener("DOMContentLoaded", () => {
  // ------------------ MEMORI ------------------
  function iniciarMemori() {
    // Obtener referencias a elementos del DOM
    const tablero = document.getElementById("tablero");
    const marcador = document.getElementById("marcador");
    const modal = document.getElementById("modal-memori");
    const puntuacionFinal = document.getElementById("puntuacionFinal");
    const salirBtn = document.getElementById("salir");
    const salirJuegoBtn = document.getElementById("salir-juego-memori");
    const salirDamas = document.getElementById("salirDamas");
    const reiniciarBtn = document.getElementById("reiniciar");
    const guardarBtn = document.getElementById("guardar");
    const registro = document.getElementById("registro");
    const registrarBtn = document.getElementById("registrar");
    const nombreJugador = document.getElementById("nombreJugador");

    // Variables de estado del juego
    let puntuacion = 0;
    let primeraCarta = null;
    let bloqueo = false;
    let parejasEncontradas = 0;

    // Seleccionar los primeros 40 elementos para el juego
    const seleccionados = elementos.slice(0, 40);
    // Validar que hay elementos suficientes
    if (seleccionados.length === 0) {
      alert("Error: No hay elementos suficientes para jugar.");
      throw new Error("elementos.js vacío o insuficiente");
    }

    // Crear pares de cartas (duplicar y mezclar)
    let valores = [
      ...seleccionados.map((e) => ({ ...e })), // Primera copia de cada elemento
      ...seleccionados.map((e) => ({ ...e })), // Segunda copia para formar pares
    ];
    valores = mezclar(valores); // Mezclar las cartas

    // Función para mezclar array (algoritmo Fisher-Yates)
    function mezclar(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
      }
      return array;
    }

    // Función para actualizar el marcador en pantalla
    function actualizarMarcador() {
      marcador.textContent = puntuacion;
    }

    // Función para mostrar el modal de fin de juego
    function mostrarModal() {
      puntuacionFinal.textContent = "Puntuación: " + puntuacion;
      modal.classList.add("mostrar");
    }

    // Crear las cartas en el tablero
    valores.forEach((elemento) => {
      const div = document.createElement("div");
      div.classList.add("carta");
      div.dataset.valor = elemento.id; // Almacenar ID para comparar

      // Crear elemento imagen para la carta
      const img = document.createElement("img");
      img.src = elemento.imagen;
      img.style.width = "70%";
      img.style.display = "none"; // Ocultar inicialmente
      div.appendChild(img);

      // Evento click para voltear carta
      div.addEventListener("click", () => {
        // No hacer nada si el juego está bloqueado o la carta ya está volteada
        if (bloqueo || div.classList.contains("volteada")) return;

        // Voltear la carta
        div.classList.add("volteada");
        img.style.display = "block";

        // Lógica de comparación de cartas
        if (!primeraCarta) {
          // Es la primera carta seleccionada
          primeraCarta = div;
        } else {
          // Es la segunda carta - comparar con la primera
          if (primeraCarta.dataset.valor === div.dataset.valor) {
            // ¡PAREJA ENCONTRADA!
            puntuacion += 100;
            parejasEncontradas++;
            actualizarMarcador();

            // Verificar si se completó el juego
            if (parejasEncontradas === seleccionados.length) {
              puntuacion += 500; // Bonus por completar
              actualizarMarcador();
              mostrarModal(); // Mostrar modal de victoria
            }

            // Reiniciar para siguiente turno
            primeraCarta = null;
            bloqueo = false;
          } else {
            // NO son pareja
            bloqueo = true;
            puntuacion = Math.max(0, puntuacion - 5); // Penalización mínima 0
            actualizarMarcador();

            // Volver a ocultar las cartas después de un segundo
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

      // Añadir carta al tablero
      tablero.appendChild(div);
    });

    // Evento boton salir durante el juego (fuera del modal)
    salirJuegoBtn.addEventListener(
      "click",
      () => (location.href = "../index.html")
    );

    // Funciones para manejar el modal de fin de juego

    // Función para controlar estado del botón Guardar
    function actualizarBotonGuardar() {
      if (puntuacion <= 0) {
        guardarBtn.disabled = true;
        guardarBtn.textContent = "0 puntos no se pueden guardar";
      } else {
        guardarBtn.disabled = false;
        guardarBtn.textContent = "Guardar";
      }
    }

    // Sobrescribir función actualizarMarcador para incluir control del botón
    function actualizarMarcador() {
      marcador.textContent = puntuacion;
      actualizarBotonGuardar(); // Actualizar estado del botón Guardar
    }

    // Llamada inicial al cargar la página para configurar estado inicial
    actualizarMarcador();

    // Botón para ir a página de ranking (probablemente fuera del modal)
    document.getElementById("Ranking").addEventListener("click", () => {
      location.href = "ranking.html";
    });

    // Eventos de botones del modal
    salirBtn.addEventListener("click", () => (location.href = "../index.html"));
    reiniciarBtn.addEventListener("click", () => location.reload()); // Recargar página
    guardarBtn.addEventListener(
      "click",
      () => (registro.style.display = "block") // Mostrar formulario de registro
    );

    // Evento para registrar puntuación
    registrarBtn.addEventListener("click", () => {
      const nombre = nombreJugador.value.trim();
      // Validar longitud del nombre
      if (nombre.length < 3 || nombre.length > 10) {
        alert("El nombre debe tener entre 3 y 10 caracteres");
        return;
      }

      // Enviar puntuación al servidor
      fetch("../backend/guardar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, puntuacion }),
      })
        .then((res) =>
          res.ok ? res.text() : Promise.reject("Error " + res.status)
        )
        .then((msg) => {
          alert(msg);
          registro.style.display = "none"; // Ocultar formulario
          nombreJugador.value = ""; // Limpiar campo
          cargarRanking(); // Actualizar ranking mostrado
        })
        .catch((err) => alert("Error al guardar: " + err));
    });

    // Función para mostrar ranking en pantalla
    function mostrarRanking(ranking) {
      const divRanking = document.getElementById("ranking");
      divRanking.innerHTML =
        "<h3>Ranking</h3><ol>" +
        ranking.map((r) => `<li>${r.nombre}: ${r.puntuacion}</li>`).join("") +
        "</ol>";
    }

    // Función para cargar ranking desde archivo
    function cargarRanking() {
      fetch("../backend/data/memori.txt?cache=" + Date.now()) // Cache busting
        .then((res) => res.text())
        .then((text) => {
          const ranking = [];
          // Parsear cada línea del archivo
          text.split("\n").forEach((linea) => {
            const m = linea.match(/^-(.*):(\d+);$/); // Expresión regular para formato
            if (m) ranking.push({ nombre: m[1], puntuacion: parseInt(m[2]) });
          });
          ranking.sort((a, b) => b.puntuacion - a.puntuacion); // Ordenar descendente
          mostrarRanking(ranking.slice(0, 5)); // Mostrar top 5
        })
        .catch(() => {
          // Manejar error mostrando mensaje vacío
          document.getElementById("ranking").innerHTML =
            "<h3>Ranking</h3><p>Sin registros</p>";
        });
    }

    // Cargar ranking al iniciar el juego
    cargarRanking();
  }

  // Iniciar el juego solo si existe el elemento tablero (página correcta)
  if (document.getElementById("tablero")) {
    iniciarMemori();
  }

  // ------------------ RANKING ------------------
  function iniciarRanking() {
    // Obtener referencias a elementos del DOM del ranking
    const listaDiv = document.getElementById("lista");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const paginaSpan = document.getElementById("pagina");
    const atrasBtn = document.getElementById("atras");

    // Validar que todos los elementos necesarios existen
    if (!listaDiv || !prevBtn || !nextBtn || !paginaSpan || !atrasBtn) return;

    // Variables para gestionar el ranking y paginación
    let ranking = []; // Array para almacenar todas las puntuaciones
    let paginaActual = 1; // Página actual que se está mostrando
    const porPagina = 25; // Número de elementos por página

    // Función para prevenir ataques XSS escapando caracteres HTML
    function escapeHtml(str) {
      return str.replace(
        /[&<>"']/g,
        (m) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[m])
      );
    }

    // Función para mostrar una página específica del ranking
    function mostrarPagina() {
      // Calcular el número total de páginas
      const totalPaginas = Math.max(1, Math.ceil(ranking.length / porPagina));
      // Asegurar que la página actual esté dentro de los límites válidos
      paginaActual = Math.min(Math.max(1, paginaActual), totalPaginas);

      // Manejar caso cuando no hay datos
      if (ranking.length === 0) {
        listaDiv.innerHTML = "<p>No hay puntuaciones aún.</p>";
        paginaSpan.textContent = "Página 0 de 0";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      // Calcular índices para los datos de la página actual
      const inicio = (paginaActual - 1) * porPagina;
      const fin = inicio + porPagina;
      const paginaDatos = ranking.slice(inicio, fin); // Obtener datos de la página

      // Generar HTML para la lista de ranking
      let html = `<ol start="${inicio + 1}">`; // Iniciar numeración desde el índice correcto
      paginaDatos.forEach(
        (r) =>
          (html += `<li>
                    <span class="nombre">${escapeHtml(r.nombre)}</span>
                    <span class="relleno"></span>  <!-- Espacio flexible entre nombre y puntos -->
                    <span class="puntos">${r.puntuacion}</span>
                  </li>`)
      );
      html += "</ol>";
      listaDiv.innerHTML = html;

      // Actualizar información de paginación
      paginaSpan.textContent = `Página ${paginaActual} de ${totalPaginas}`;
      // Deshabilitar botones cuando sea necesario
      prevBtn.disabled = paginaActual === 1;
      nextBtn.disabled = paginaActual === totalPaginas;
    }

    // Función asíncrona para cargar el ranking desde el servidor
    async function cargarRanking() {
      const ruta = "../backend/data/memori.txt?cache=" + Date.now(); // Cache busting
      try {
        const res = await fetch(ruta);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let text = await res.text();
        text = text.replace(/^\uFEFF/, ""); // Remover BOM (Byte Order Mark) si existe

        ranking = []; // Reiniciar array de ranking

        // Procesar cada línea del archivo
        text.split(/\r?\n/).forEach((linea) => {
          linea = linea.trim();
          if (!linea) return; // Saltar líneas vacías

          // Expresión regular más flexible para parsear el formato
          const m = linea.match(/^\s*-?\s*(.+?)\s*:\s*(\d+)\s*;?\s*$/);
          if (m)
            ranking.push({
              nombre: m[1].trim(),
              puntuacion: parseInt(m[2], 10),
            });
        });

        // Ordenar ranking de mayor a menor puntuación
        ranking.sort((a, b) => b.puntuacion - a.puntuacion);
        mostrarPagina(); // Mostrar la primera página
      } catch (err) {
        // Manejar errores de carga
        listaDiv.innerHTML = `<p>Error cargando ranking: ${err.message}</p>`;
        paginaSpan.textContent = "";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
      }
    }

    // Eventos para navegación entre páginas
    prevBtn.addEventListener("click", () => {
      if (paginaActual > 1) {
        paginaActual--;
        mostrarPagina(); // Mostrar página anterior
      }
    });

    nextBtn.addEventListener("click", () => {
      if (paginaActual < Math.ceil(ranking.length / porPagina)) {
        paginaActual++;
        mostrarPagina(); // Mostrar página siguiente
      }
    });

    // Evento para volver al juego de memori
    atrasBtn.addEventListener("click", () => (location.href = "./memori.html"));

    // Cargar el ranking al iniciar la página
    cargarRanking();
  }

  // Iniciar el sistema de ranking solo si existe el elemento lista (página correcta)
  if (document.getElementById("lista")) {
    iniciarRanking();
  }
});

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

// Función principal para iniciar el juego de operaciones
function iniciar() {
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
}

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
    location.href = "../index.html";
  });
}

// Función para comprobar las respuestas del usuario
function comprobarRespuestas() {
  const inputs = document.querySelectorAll(".resultado-input");
  inputs.forEach((input, index) => {
    let valorUsuario = parseFloat(input.value);
    let correcto = valorUsuario === operaciones[index].resultadoReal;

    // Aplicar estilos según si es correcto o incorrecto
    input.classList.remove("correcto", "incorrecto");
    input.classList.add(correcto ? "correcto" : "incorrecto");
    if (correcto) input.disabled = true; // Bloquear inputs correctos
  });
}

// JUEGO PALABRAS

// Variables globales para el juego de palabras
let idiomaSeleccionado = 0;
let seleccionados = []; // Array de elementos seleccionados
let actual = 0; // Índice del elemento actual

// Estado "congelado" para la ronda actual (evita cambios durante la ronda)
let comprobado = false; // Si ya se ha comprobado la palabra actual
let objetoActual = null; // Objeto actual mostrado
let palabraObjetivo = ""; // Palabra objetivo de la ronda actual

// Función para iniciar el juego de palabras
function iniciarJuego() {
  // Obtener configuración del usuario
  idiomaSeleccionado = parseInt(document.getElementById("idioma").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);

  // Seleccionar elementos aleatorios
  seleccionados = [...elementos]
    .sort(() => Math.random() - 0.5) // Mezclar array
    .slice(0, cantidad); // Tomar los primeros N elementos

  // Mostrar juego y ocultar configuración
  document.getElementById("modal").style.display = "none";
  document.getElementById("juego").style.display = "flex";

  mostrarImagen(); // Mostrar primera imagen
}

// Función para mostrar una imagen y preparar la ronda
function mostrarImagen() {
  comprobado = false; // Resetear estado de comprobación

  // "Congelar" el objeto y palabra objetivo para esta ronda
  objetoActual = seleccionados[actual];
  palabraObjetivo = String(objetoActual.palabras[idiomaSeleccionado] || "");

  // Limpiar y normalizar la palabra objetivo
  palabraObjetivo = palabraObjetivo.trim();

  // Mostrar imagen
  document.getElementById("imagen").src = objetoActual.imagen;

  const contenedor = document.querySelector(".imagen-contenedor");
  contenedor.style.borderColor = "black"; // Color inicial

  const inputsDiv = document.getElementById("inputs");
  inputsDiv.innerHTML = ""; // Limpiar inputs anteriores

  // Botón para salir del juego de palabras
  document.getElementById("salir-palabras").addEventListener("click", () => {
    location.href = "../index.html";
  });

  // Crear inputs para cada letra de la palabra objetivo
  for (let i = 0; i < palabraObjetivo.length; i++) {
    const input = document.createElement("input");
    input.maxLength = 1; // Solo una letra por input
    input.dataset.index = String(i); // Guardar índice para referencia

    // Estilo inicial
    input.style.backgroundColor = "white";

    // Evento al escribir en un input
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.index, 10);

      if (!comprobado) {
        // Auto-avance a siguiente input antes de comprobar
        const siguiente = inputsDiv.querySelector(
          `input[data-index='${idx + 1}']`
        );
        if (siguiente && e.target.value !== "") {
          siguiente.focus();
        }
      } else {
        // Después de comprobar: resetear color al cambiar
        e.target.style.backgroundColor = "white";
      }
    });

    // Evento al hacer clic (focus) en un input
    input.addEventListener("focus", (e) => {
      if (comprobado && e.target.value !== "") {
        // Permitir corrección después de comprobar
        e.target.value = "";
        e.target.style.backgroundColor = "white";
      }
    });

    inputsDiv.appendChild(input);
  }

  // Deshabilitar botón siguiente hasta que se acierte
  document.getElementById("btnSiguiente").disabled = true;
}

// Función para comprobar la palabra ingresada
function comprobar() {
  const inputs = document.querySelectorAll("#inputs input");

  // Validación defensiva: verificar que coincidan las longitudes
  if (inputs.length !== palabraObjetivo.length) {
    mostrarImagen(); // Reconstruir si hay inconsistencia
    return;
  }

  // Construir palabra ingresada por el usuario
  let resultado = "";
  inputs.forEach((input) => (resultado += input.value.toLowerCase()));

  const contenedor = document.querySelector(".imagen-contenedor");
  const botonSiguiente = document.getElementById("btnSiguiente");

  // Comprobar letra por letra y colorear resultados
  for (let i = 0; i < palabraObjetivo.length; i++) {
    const esperado = palabraObjetivo[i]?.toLowerCase() ?? "";
    const actualLetra = (inputs[i].value || "").toLowerCase();

    // Verde si es correcta, rojo si es incorrecta
    if (actualLetra === esperado) {
      inputs[i].style.backgroundColor = "#9f9"; // verde suave
    } else {
      inputs[i].style.backgroundColor = "#f99"; // rojo suave
    }
  }

  // Comprobar palabra completa
  if (resultado === palabraObjetivo.toLowerCase()) {
    contenedor.style.borderColor = "green"; // Éxito
    botonSiguiente.disabled = false; // Habilitar siguiente
  } else {
    contenedor.style.borderColor = "red"; // Error
    botonSiguiente.disabled = true;
  }

  comprobado = true; // Marcar como comprobado
}

// Función para pasar a la siguiente imagen/palabra
function siguiente() {
  if (actual < seleccionados.length - 1) {
    actual++; // Avanzar índice
    mostrarImagen(); // Mostrar siguiente elemento
  } else {
    alert("¡Has terminado!");
    location.reload(); // Reiniciar juego al terminar
  }
}

/* =========================
   JUEGO AHORCADO (namespaced)
   ========================= */
(function () {
  // Solo continuar si estamos en la página del ahorcado (comprobación por un elemento único)
  const palabraEl = document.getElementById("palabra");
  const letrasEl = document.getElementById("letras");
  const imagenAhorcado = document.getElementById("imagenAhorcado");
  // Ajusta este id en el HTML si quieres: por defecto uso "marcador" si existe,
  // si prefieres "marcador-ahorcado" añade ese id al HTML.
  const marcadorEl =
    document.getElementById("marcador-ahorcado") ||
    document.getElementById("marcador") ||
    null;

  // Si no existen los elementos principales, no ejecutamos nada para evitar errores
  if (!palabraEl || !letrasEl || !imagenAhorcado) {
    // No es la página del ahorcado: salir sin romper el resto del JS
    return;
  }

  // Estado privado del módulo
  let ah_palabraSecreta;
  let ah_progreso;
  let ah_errores = 0;
  const ah_maxErrores = 6;
  let ah_usuario = "";
  let ah_puntos = 0;

  // Iniciar juego (usa este nombre para no colisionar)
  window.iniciarAhorcado = function () {
    const inputUsuario = document.getElementById("usuario");
    if (!inputUsuario) {
      alert("No se encontró el campo usuario.");
      return;
    }
    ah_usuario = inputUsuario.value.trim();
    if (!ah_usuario) {
      alert("Por favor ingresa un nombre de usuario");
      return;
    }
    const modalInicio = document.getElementById("modal-inicio");
    if (modalInicio) modalInicio.style.display = "none";
    ah_puntos = 0;
    ah_actualizarMarcador();
    ah_nuevaPalabra();
  };

  function ah_nuevaPalabra() {
    // 'palabras' debe venir de tu archivo palabras.js (array de strings)
    ah_palabraSecreta =
      palabras[Math.floor(Math.random() * palabras.length)].toUpperCase();
    ah_progreso = Array(ah_palabraSecreta.length).fill("_");
    ah_errores = 0;
    imagenAhorcado.src = `../assets/img/imagenes/ahorcado${ah_errores}.jpg`;
    letrasEl.innerHTML = "";
    ah_mostrarPalabra();
    ah_crearBotones();
  }

  function ah_mostrarPalabra() {
    // join con espacios, usar innerHTML para permitir spans después de perder
    palabraEl.innerHTML = ah_progreso.join(" ");
  }

  function ah_crearBotones() {
    const abecedario = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
    abecedario.forEach((letra) => {
      const btn = document.createElement("button");
      btn.textContent = letra;
      btn.type = "button";
      btn.addEventListener("click", () => ah_manejarLetra(btn, letra));
      letrasEl.appendChild(btn);
    });
  }

  function ah_manejarLetra(btn, letra) {
    btn.disabled = true;
    if (ah_palabraSecreta.includes(letra)) {
      btn.style.background = "green";
      for (let i = 0; i < ah_palabraSecreta.length; i++) {
        if (ah_palabraSecreta[i] === letra) ah_progreso[i] = letra;
      }
      ah_mostrarPalabra();
      if (!ah_progreso.includes("_")) {
        ah_puntos++;
        ah_actualizarMarcador();
        setTimeout(() => ah_nuevaPalabra(), 700);
      }
    } else {
      btn.style.background = "red";
      ah_errores++;
      ah_actualizarAhorcado();
    }
  }

  function ah_actualizarAhorcado() {
    imagenAhorcado.src = `../assets/img/imagenes/ahorcado${ah_errores}.jpg`;
    if (ah_errores >= ah_maxErrores) {
      // Revelar palabra con las no adivinadas en rojo
      ah_revelarPalabra();
      // Mostrar modal final tras un pequeño retardo
      setTimeout(() => ah_mostrarFinal(), 1200);
    }
  }

  function ah_revelarPalabra() {
    let palabraMostrada = "";
    for (let i = 0; i < ah_palabraSecreta.length; i++) {
      if (ah_progreso[i] === "_") {
        palabraMostrada += `<span class="ah-letra-no">${ah_palabraSecreta[i]}</span> `;
      } else {
        palabraMostrada += `<span class="ah-letra-si">${ah_progreso[i]}</span> `;
      }
    }
    palabraEl.innerHTML = palabraMostrada.trim();
  }

  function ah_actualizarMarcador() {
    if (!marcadorEl) return; // si no hay marcador, evitamos errores
    marcadorEl.textContent = ah_puntos;
  }

  function ah_mostrarFinal() {
    const modalFinal = document.getElementById("modal-final");
    if (modalFinal) modalFinal.style.display = "flex";
    const resultado = document.getElementById("resultado");
    if (resultado)
      resultado.textContent = ah_usuario + ", tu puntuación fue: " + ah_puntos;
    const uFinal = document.getElementById("usuarioFinal");
    const pFinal = document.getElementById("puntosFinal");
    if (uFinal) uFinal.value = ah_usuario;
    if (pFinal) pFinal.value = ah_puntos;
  }

  window.ah_reiniciarCompleto = function () {
    const modalFinal = document.getElementById("modal-final");
    if (modalFinal) modalFinal.style.display = "none";
    const modalInicio = document.getElementById("modal-inicio");
    if (modalInicio) modalInicio.style.display = "flex";
  };
})();

/*********************************
 *    Juego damas*************
 *
 *************************************/

// Evento boton salir durante el juego damas
salirDamas.addEventListener("click", () => (location.href = "../index.html"));
