/* =========================
   JUEGO AHORCADO
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  (function () {
    // Elementos del DOM
    const palabraEl = document.getElementById("palabra");
    const letrasEl = document.getElementById("letras");
    const marcadorEl = document.getElementById("marcador-ahorcado");

    // Variables de estado
    let ah_palabraSecreta;
    let ah_progreso;
    let ah_errores = 0;
    let ah_usuario = "";
    let ah_puntos = 0;
    let ah_idiomaJuego = "es"; // Idioma para las palabras del juego

    const ah_partesSVG = [
      "poste",
      "vertical",
      "horizontal",
      "cuerda",
      "cabeza",
      "cuerpo",
      "brazo1",
      "brazo2",
      "pierna1",
      "pierna2",
    ];
    const ah_maxErrores = ah_partesSVG.length;

    // ================================
    // FUNCIONES DEL JUEGO
    // ================================

    // Función para mostrar instrucciones
    function mostrarInstrucciones() {
      const currentTranslations = window.translations || {};
      const gameLanguage =
        currentTranslations["language." + ah_idiomaJuego] || ah_idiomaJuego;

      const instrucciones = `
${getTranslation("ahorcado.howToPlay", "Cómo jugar al Ahorcado")}

${getTranslation("ahorcado.instructions.objective", "OBJETIVO:")}
${getTranslation("ahorcado.instructions.objectiveText", "Adivinar la palabra secreta antes de que se complete el dibujo del ahorcado.")}

${getTranslation("ahorcado.instructions.gameplay", "CÓMO JUGAR:")}
• ${getTranslation("ahorcado.instructions.letters", "Haz clic en las letras para adivinar la palabra.")}
• ${getTranslation("ahorcado.instructions.correct", "Si la letra es correcta, aparecerá en la palabra.")}
• ${getTranslation("ahorcado.instructions.wrong", "Si la letra es incorrecta, se añadirá una parte al dibujo del ahorcado.")}
• ${getTranslation("ahorcado.instructions.maxErrors", "Si completas el dibujo (10 errores), pierdes la palabra.")}

${getTranslation("ahorcado.instructions.scoring", "PUNTUACIÓN:")}
• ${getTranslation("ahorcado.instructions.pointsPerWord", "Cada palabra acertada suma 1 punto al marcador.")}
• ${getTranslation("ahorcado.instructions.scoreKeeps", "La puntuación se acumula durante toda la partida.")}
• ${getTranslation("ahorcado.instructions.saveRecord", "Al finalizar puedes guardar tu récord en el ranking local.")}

${getTranslation("ahorcado.instructions.ranking", "RANKING:")}
• ${getTranslation("ahorcado.instructions.saveButton", "Puedes guardar tu puntuación desde el menú final.")}
• ${getTranslation("ahorcado.instructions.viewRanking", "Puedes ver el ranking desde el menú inicial o final.")}
• ${getTranslation("ahorcado.instructions.exportRanking", "También puedes exportar el ranking en formato JSON.")}

${getTranslation("ahorcado.instructions.language", "IDIOMA:")}
• ${getTranslation("ahorcado.instructions.interfaceLanguage", "La interfaz está en el idioma seleccionado en el menú principal.")}
• ${getTranslation("ahorcado.instructions.gameLanguage", "Las palabras del juego están en el idioma seleccionado aquí:")} ${gameLanguage}
• ${getTranslation("ahorcado.instructions.independent", "Puedes tener la interfaz en un idioma y las palabras en otro.")}

${getTranslation("ahorcado.instructions.goodLuck", "¡Buena suerte!")}
      `;

      // Usar la función global mostrarModalInfo
      window.mostrarModalInfo(
        getTranslation("common.instructions", "Instrucciones"),
        instrucciones,
      );
    }

    function normalizarLetra(letra) {
      return letra
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    }

    // Iniciar juego
    window.iniciarAhorcado = function () {
      const selectIdiomaJuego = document.getElementById("idioma-juego");
      ah_idiomaJuego = selectIdiomaJuego ? selectIdiomaJuego.value : "es";

      const inputUsuario = document.getElementById("usuario");
      if (!inputUsuario) {
        window.mostrarModalInfo(
          getTranslation("common.info"),
          "Error: No se encontró el campo usuario.",
        );
        return;
      }

      ah_usuario = inputUsuario.value.trim();
      if (ah_usuario.length < 3 || ah_usuario.length > 12) {
        window.mostrarModalInfo(
          getTranslation("common.info"),
          "El nombre debe tener entre 3 y 12 caracteres.",
        );
        return;
      }

      if (!ah_usuario) {
        window.mostrarModalInfo(
          getTranslation("common.info"),
          "Por favor ingresa un nombre de usuario",
        );
        return;
      }

      const modalInicio = document.getElementById("modal-inicio");
      if (modalInicio) modalInicio.style.display = "none";

      ah_puntos = 0;
      ah_actualizarMarcador();
      ah_resetearSVG();
      ah_nuevaPalabra();
    };

    function ah_resetearSVG() {
      ah_partesSVG.forEach((parteId) => {
        const elemento = document.getElementById(parteId);
        if (elemento) elemento.style.display = "none";
      });
    }

    function ah_nuevaPalabra() {
      // Usar el idioma seleccionado para las palabras del juego
      const lista = palabras[ah_idiomaJuego] || palabras.es;
      ah_palabraSecreta =
        lista[Math.floor(Math.random() * lista.length)].toUpperCase();
      ah_progreso = Array(ah_palabraSecreta.length).fill("_");
      ah_errores = 0;

      ah_resetearSVG();
      letrasEl.innerHTML = "";
      ah_mostrarPalabra();
      ah_crearBotones();
    }

    function ah_mostrarPalabra() {
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
      const letraNormalizada = normalizarLetra(letra);

      if (normalizarLetra(ah_palabraSecreta).includes(letraNormalizada)) {
        btn.style.background = "green";
        for (let i = 0; i < ah_palabraSecreta.length; i++) {
          if (normalizarLetra(ah_palabraSecreta[i]) === letraNormalizada) {
            ah_progreso[i] = ah_palabraSecreta[i];
          }
        }

        ah_mostrarPalabra();
        if (!ah_progreso.includes("_")) {
          ah_puntos++;
          ah_actualizarMarcador();
          // Mostrar mensaje de palabra acertada
          const winMessage = getTranslation(
            "ahorcado.winMessage",
            "¡Palabra acertada!",
          );
          const nextWord = getTranslation(
            "ahorcado.nextWord",
            "¡Siguiente palabra!",
          );
          mostrarMensajeTemporal(`${winMessage} ${nextWord}`, 1500);
          setTimeout(() => ah_nuevaPalabra(), 700);
        }
      } else {
        btn.style.background = "red";
        ah_errores++;
        ah_actualizarAhorcado();
      }
    }

    function ah_actualizarAhorcado() {
      if (ah_errores > 0 && ah_errores <= ah_partesSVG.length) {
        const parteId = ah_partesSVG[ah_errores - 1];
        const elemento = document.getElementById(parteId);
        if (elemento) elemento.style.display = "block";
      }

      if (ah_errores >= ah_maxErrores) {
        ah_revelarPalabra();
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

      // Mostrar mensaje de palabra perdida
      const loseMessage = getTranslation(
        "ahorcado.loseMessage",
        "La palabra era:",
      );
      mostrarMensajeTemporal(`${loseMessage} ${ah_palabraSecreta}`, 1500);
    }

    function ah_actualizarMarcador() {
      if (!marcadorEl) return;
      marcadorEl.textContent = ah_puntos;
    }

    function ah_mostrarFinal() {
      const modalFinal = document.getElementById("modal-final");
      if (modalFinal) modalFinal.style.display = "flex";

      const resultado = document.getElementById("resultado");
      if (resultado) {
        // Usar traducción para el mensaje final
        const scoreText = getTranslation("ahorcado.score", "Puntuación");
        const pointsText = getTranslation("ahorcado.points", "puntos");
        resultado.textContent = `${ah_usuario}, ${scoreText}: ${ah_puntos} ${pointsText}`;
      }
    }

    // Función para mostrar mensajes temporales
    function mostrarMensajeTemporal(mensaje, duracion = 2000) {
      const mensajeEl = document.createElement("div");
      mensajeEl.textContent = mensaje;
      mensajeEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        font-size: 1.2em;
        text-align: center;
        min-width: 300px;
        max-width: 80%;
      `;

      document.body.appendChild(mensajeEl);

      setTimeout(() => {
        if (mensajeEl.parentNode) {
          document.body.removeChild(mensajeEl);
        }
      }, duracion);
    }

    window.ah_reiniciarCompleto = function () {
      const modalFinal = document.getElementById("modal-final");
      if (modalFinal) modalFinal.style.display = "none";
      const modalInicio = document.getElementById("modal-inicio");
      if (modalInicio) modalInicio.style.display = "flex";
    };

    window.reiniciarCompleto = function () {
      window.ah_reiniciarCompleto();
    };

    // Función auxiliar para obtener traducciones
    function getTranslation(key, fallback = "") {
      return window.translations?.[key] || fallback || key;
    }

    // Configurar eventos de botones
    const btnEmpezar = document.getElementById("btnEmpezar");
    if (btnEmpezar) btnEmpezar.addEventListener("click", iniciarAhorcado);

    const btnInstrucciones = document.getElementById("btnInstrucciones");
    if (btnInstrucciones) {
      btnInstrucciones.addEventListener("click", mostrarInstrucciones);
    }

    const btnVerRanking = document.getElementById("btnVerRanking");
    if (btnVerRanking) {
      btnVerRanking.addEventListener("click", () => {
        window.location.href = "../ranking/rankingLocal.html";
      });
    }

    const btnSalirModal = document.getElementById("btnSalir-modal");
    if (btnSalirModal) {
      btnSalirModal.addEventListener("click", () => {
        window.location.href = "../../index.html";
      });
    }

    const btnSalir = document.getElementById("btnSalir");
    if (btnSalir) {
      btnSalir.addEventListener("click", () => {
        window.location.href = "../../index.html";
      });
    }

    applyTranslations();
  })();

  // Funciones modal globales - DEFINIR SOLO UNA VEZ FUERA DEL IIFE
  window.mostrarModalInfo = function (titulo, mensaje = "") {
    const modalTitulo = document.getElementById("modal-info-titulo");
    const modalTexto = document.getElementById("modal-info-texto");
    const modal = document.getElementById("modal-info");

    if (modalTitulo) modalTitulo.textContent = titulo;
    if (modalTexto) {
      // Reemplazar saltos de línea por <br> para HTML
      const mensajeConSaltos = mensaje.replace(/\n/g, "<br>");
      modalTexto.innerHTML = mensajeConSaltos;
    }
    if (modal) modal.style.display = "flex";
  };

  window.cerrarModalInfo = function () {
    const modal = document.getElementById("modal-info");
    if (modal) modal.style.display = "none";
  };

  // Configurar evento del botón Aceptar DESPUÉS de definir la función
  const btnModalInfoAceptar = document.getElementById("btnModalInfoAceptar");
  if (btnModalInfoAceptar) {
    btnModalInfoAceptar.addEventListener("click", window.cerrarModalInfo);
  }
});
