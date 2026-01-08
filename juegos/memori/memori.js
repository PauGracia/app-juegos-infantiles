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
      () => (location.href = "../../index.html")
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
    document.getElementById("ranking-btn").addEventListener("click", () => {
      location.href = "../rankingMemori/rankingMemori.html";
    });

    // Eventos de botones del modal
    salirBtn.addEventListener(
      "click",
      () => (location.href = "../../index.html")
    );
    reiniciarBtn.addEventListener("click", () => location.reload()); // Recargar página
    guardarBtn.addEventListener(
      "click",
      () => (registro.style.display = "block") // Mostrar formulario de registro
    );

    // Evento para registrar puntuación
    registrarBtn.addEventListener("click", () => {
      const nombre = nombreJugador.value.trim();

      if (nombre.length < 3 || nombre.length > 10) {
        alert("El nombre debe tener entre 3 y 10 caracteres");
        return;
      }

      guardarRankingLocal(nombre, puntuacion);
      registro.style.display = "none";
      nombreJugador.value = "";
      cargarRankingLocal();
    });

    // Función para mostrar ranking en pantalla
    function mostrarRanking(ranking) {
      const divRanking = document.getElementById("ranking");
      divRanking.innerHTML =
        "<h3>Ranking</h3><ol>" +
        ranking.map((r) => `<li>${r.nombre}: ${r.puntuacion}</li>`).join("") +
        "</ol>";
    }

    function guardarRankingLocal(nombre, puntuacion) {
      const clave = "ranking_memori";
      const ranking = JSON.parse(localStorage.getItem(clave)) || [];

      ranking.push({ nombre, puntuacion });

      ranking.sort((a, b) => b.puntuacion - a.puntuacion);

      localStorage.setItem(clave, JSON.stringify(ranking.slice(0, 5)));
    }

    // Función para cargar ranking desde archivo
    function cargarRankingLocal() {
      const ranking = JSON.parse(localStorage.getItem("ranking_memori")) || [];
      mostrarRanking(ranking);
    }

    // Cargar ranking al iniciar el juego
    cargarRankingLocal();
  }

  // Iniciar el juego solo si existe el elemento tablero (página correcta)
  if (document.getElementById("tablero")) {
    iniciarMemori();
  }
});
