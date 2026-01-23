/* =========================
   JUEGO AHORCADO
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  (function () {
    // Elementos del DOM
    const palabraEl = document.getElementById("palabra");
    const letrasEl = document.getElementById("letras");
    const marcadorEl = document.getElementById("marcador-ahorcado");

    // ================================
    // SONIDOS DEL JUEGO
    // ================================

    const sonidos = {
      bien: new Audio("sounds/letra-bien.mp3"),
      mal: new Audio("sounds/letra-mal.mp3"),
      nuevaPalabra: new Audio("sounds/nueva-palabra.mp3"),
      fin: new Audio("sounds/fin.mp3"),
    };

    // Configuración recomendada
    Object.values(sonidos).forEach((audio) => {
      audio.preload = "auto";
      audio.volume = 0.6;
    });

    // Función segura para reproducir sonido
    function reproducirSonido(audio) {
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Evita errores de autoplay en móviles
      });
    }

    // ================================
    // DESBLOQUEO AUDIO EN MÓVIL
    // ================================

    let audioDesbloqueado = false;

    function desbloquearAudioMovil() {
      if (audioDesbloqueado) return;

      Object.values(sonidos).forEach((audio) => {
        audio
          .play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch(() => {});
      });

      audioDesbloqueado = true;
    }

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
• ${getTranslation("ahorcado.instructions.interfaceLanguage", "Puedes jugar a este juego en diferentes idiomas para practicar.")}


${getTranslation("ahorcado.instructions.goodLuck", "¡Buena suerte!")}
      `;

      // Usar la función global mostrarModalInfo
      window.mostrarModalInfo(
        getTranslation("common.instructions", "Instrucciones"),
        instrucciones,
      );
    }

    // ================================
    // EFECTOS VISUALES MEJORADOS
    // ================================

    // Efecto de animación en el marcador
    function animarMarcador() {
      if (marcadorEl) {
        marcadorEl.style.animation = "none";
        setTimeout(() => {
          marcadorEl.style.animation = "pulse 0.5s ease";
        }, 10);
      }
    }

    // Efecto de revelación de letra
    function efectoLetraRevelada(letraElemento) {
      letraElemento.style.animation = "none";
      setTimeout(() => {
        letraElemento.style.animation = "fadeIn 0.3s ease";
      }, 10);
    }

    function ah_manejarLetra(btn, letra) {
      if (btn.disabled) return;

      btn.style.transform = "scale(0.95)";

      btn.disabled = true;
      const letraNormalizada = normalizarLetra(letra);

      if (normalizarLetra(ah_palabraSecreta).includes(letraNormalizada)) {
        reproducirSonido(sonidos.bien);

        btn.style.background = "green";
        for (let i = 0; i < ah_palabraSecreta.length; i++) {
          if (normalizarLetra(ah_palabraSecreta[i]) === letraNormalizada) {
            ah_progreso[i] = ah_palabraSecreta[i];
            if (palabraEl.children[i]) {
              efectoLetraRevelada(palabraEl.children[i]);
            }
          }
        }

        ah_mostrarPalabra();
        if (!ah_progreso.includes("_")) {
          ah_puntos++;
          animarMarcador();
          ah_actualizarMarcador();
          const winMessage = getTranslation(
            "ahorcado.winMessage",
            "¡Palabra acertada!",
          );
          const nextWord = getTranslation(
            "ahorcado.nextWord",
            "¡Siguiente palabra!",
          );
          setTimeout(() => {
            reproducirSonido(sonidos.nuevaPalabra);
            mostrarMensajeTemporal(`${winMessage} ${nextWord}`, 2200);
          }, 500);

          setTimeout(() => {
            ah_nuevaPalabra();
          }, 2800);
        }
      } else {
        reproducirSonido(sonidos.mal);
        btn.style.background = "red";
        ah_errores++;
        ah_actualizarAhorcado();
      }

      setTimeout(() => {
        btn.style.transform = "";
      }, 150);
    }

    // Mejorar función mostrarMensajeTemporal
    function mostrarMensajeTemporal(mensaje, duracion = 2200) {
      const mensajeEl = document.createElement("div");
      mensajeEl.textContent = mensaje;

      mensajeEl.style.cssText = `
    position: fixed;
    top: 18%;
    left: 50%;
    transform: translate(-50%, -10px);
    background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(50,50,50,0.95));
    color: white;
    padding: 18px 32px;
    border-radius: 14px;
    z-index: 9999;
    font-size: 1.25em;
    text-align: center;
    min-width: 280px;
    max-width: 85%;
    box-shadow: 0 12px 30px rgba(0,0,0,0.45);
    backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity 0.4s ease, transform 0.4s ease;
    pointer-events: none;
    font-weight: 600;
  `;

      document.body.appendChild(mensajeEl);

      // Fade IN
      requestAnimationFrame(() => {
        mensajeEl.style.opacity = "1";
        mensajeEl.style.transform = "translate(-50%, 0)";
      });

      // Fade OUT
      setTimeout(() => {
        mensajeEl.style.opacity = "0";
        mensajeEl.style.transform = "translate(-50%, -10px)";
        setTimeout(() => {
          if (mensajeEl.parentNode) {
            mensajeEl.remove();
          }
        }, 400);
      }, duracion);
    }

    function normalizarLetra(letra) {
      return letra
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    }

    // Iniciar juego
    window.iniciarAhorcado = function () {
      // DESBLOQUEAR AUDIO EN MÓVIL
      desbloquearAudioMovil();
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
      // Reactivar botón Guardar récord
      if (btnGuardarRecord) {
        btnGuardarRecord.disabled = false;
        btnGuardarRecord.textContent = getTranslation(
          "ahorcado.saveRecord",
          "Guardar récord local",
        );
      }
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

      // Vaciar contenedor
      letrasEl.innerHTML = "";

      // Detectar si es dispositivo táctil
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      abecedario.forEach((letra) => {
        const btn = document.createElement("button");
        btn.textContent = letra;
        btn.type = "button";

        // Para dispositivos táctiles (móviles)
        if (isTouchDevice) {
          // Evento touchstart (al presionar)
          btn.addEventListener(
            "touchstart",
            function (e) {
              e.preventDefault();
              this.style.opacity = "0.8";
              this.style.transform = "scale(0.95)";
            },
            { passive: false },
          );

          // Evento touchend (al soltar)
          btn.addEventListener(
            "touchend",
            function (e) {
              e.preventDefault();
              this.style.opacity = "1";
              this.style.transform = "scale(1)";

              // Llamar a la función que maneja la letra
              ah_manejarLetra(this, letra);
            },
            { passive: false },
          );

          // Evento touchcancel (si se cancela el touch)
          btn.addEventListener("touchcancel", function () {
            this.style.opacity = "1";
            this.style.transform = "scale(1)";
          });
        }

        // Para ordenadores (mantener el click normal)
        btn.addEventListener("click", (e) => {
          // En móviles, prevenir doble llamada
          if (isTouchDevice) {
            e.preventDefault();
            return;
          }
          ah_manejarLetra(btn, letra);
        });

        // Añadir al contenedor
        letrasEl.appendChild(btn);
      });
    }

    function guardarPuntuacionLocal() {
      const registro = {
        usuario: ah_usuario,
        puntos: ah_puntos,
        juego: "Ahorcado",
        fecha: new Date().toISOString(),
        idioma: ah_idiomaJuego,
      };

      const ranking = JSON.parse(localStorage.getItem("rankingAhorcado")) || [];

      ranking.push(registro);
      ranking.sort((a, b) => b.puntos - a.puntos);

      localStorage.setItem("rankingAhorcado", JSON.stringify(ranking));
      // Desactivar botón
      if (btnGuardarRecord) {
        btnGuardarRecord.disabled = true;
        btnGuardarRecord.textContent = getTranslation(
          "ahorcado.recordSaved",
          "Récord guardado",
        );
      }
      mostrarMensajeTemporal(
        getTranslation("ahorcado.recordSaved", "Récord guardado correctamente"),
        1500,
      );
    }

    function ah_actualizarAhorcado() {
      if (ah_errores > 0 && ah_errores <= ah_partesSVG.length) {
        const parteId = ah_partesSVG[ah_errores - 1];
        const elemento = document.getElementById(parteId);
        if (elemento) elemento.style.display = "block";
      }

      if (ah_errores >= ah_maxErrores) {
        ah_revelarPalabra();
        setTimeout(() => ah_mostrarFinal(), 3200);
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
      setTimeout(() => {
        reproducirSonido(sonidos.fin);
        mostrarMensajeTemporal(`${loseMessage} ${ah_palabraSecreta}`, 2500);
      }, 500);
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

    function ah_resetearJuegoCompleto() {
      // Reset variables
      ah_palabraSecreta = "";
      ah_progreso = [];
      ah_errores = 0;
      ah_puntos = 0;
      ah_usuario = "";

      // Limpiar UI
      if (palabraEl) palabraEl.innerHTML = "";
      if (letrasEl) letrasEl.innerHTML = "";
      ah_actualizarMarcador();
      ah_resetearSVG();

      // Ocultar modales
      const modalFinal = document.getElementById("modal-final");
      const modalInfo = document.getElementById("modal-info");
      if (modalFinal) modalFinal.style.display = "none";
      if (modalInfo) modalInfo.style.display = "none";

      // Mostrar modal inicio
      const modalInicio = document.getElementById("modal-inicio");
      if (modalInicio) modalInicio.style.display = "flex";

      // Limpiar input usuario
      const inputUsuario = document.getElementById("usuario");
      if (inputUsuario) inputUsuario.value = "";
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
        ah_resetearJuegoCompleto();
      });
    }

    const btnGuardarRecord = document.getElementById("btnGuardarRecord");
    if (btnGuardarRecord) {
      btnGuardarRecord.addEventListener("click", guardarPuntuacionLocal);
    }

    applyTranslations();
  })();

  // Funciones modal globales
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
  document.addEventListener(
    "touchmove",
    function (e) {
      if (e.target.closest(".letras button")) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  // Prevenir zoom en iOS cuando se tocan los botones
  document.addEventListener("gesturestart", function (e) {
    if (e.target.closest(".letras button")) {
      e.preventDefault();
    }
  });
  // DEBUG: Ver eventos de touch
  console.log("UserAgent:", navigator.userAgent);
  console.log("Touch events:", "ontouchstart" in window);

  // Verificar clicks
  document.addEventListener(
    "click",
    function (e) {
      console.log("CLICK:", e.target.tagName, e.target.textContent);
    },
    true,
  );

  // Verificar touches
  document.addEventListener(
    "touchstart",
    function (e) {
      console.log("TOUCH:", e.target.tagName, e.target.textContent);
    },
    true,
  );
});
