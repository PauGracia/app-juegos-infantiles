/* =========================
   JUEGO AHORCADO 
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  (function () {
    // ================================
    // INICIALIZAR IDIOMA DEL SELECT (VERSIÓN SIMPLIFICADA)
    // ================================
    function inicializarSelectIdioma() {
      const savedLang = localStorage.getItem("uiLang") || "es";
      const idiomaJuegoSelect = document.getElementById("idioma-juego");

      if (idiomaJuegoSelect) {
        // Establecer el valor por defecto
        idiomaJuegoSelect.value = savedLang;

        // Si ya tenemos traducciones, actualizar las etiquetas
        if (window.translations) {
          actualizarEtiquetasSelect(idiomaJuegoSelect);
        }
        // Si no, intentar de nuevo después de un tiempo
        else {
          setTimeout(() => {
            if (window.translations) {
              actualizarEtiquetasSelect(idiomaJuegoSelect);
            } else {
              // Último intento
              setTimeout(() => {
                if (window.translations) {
                  actualizarEtiquetasSelect(idiomaJuegoSelect);
                }
              }, 500);
            }
          }, 300);
        }
      }
    }

    function actualizarEtiquetasSelect(selectElement) {
      if (!selectElement || !window.translations) return;

      const options = selectElement.querySelectorAll("option");
      options.forEach((option) => {
        const langCode = option.value;
        const translationKey = `language.${langCode}`;
        if (window.translations[translationKey]) {
          option.textContent = window.translations[translationKey];
        }
      });
    }

    // Llamar a la inicialización después de un breve delay
    setTimeout(inicializarSelectIdioma, 100);

    // Elementos del DOM
    const palabraEl = document.getElementById("palabra");
    const letrasEl = document.getElementById("letras");
    const marcadorEl = document.getElementById("marcador-ahorcado");

    // Nuevos elementos del DOM para los botones movidos del HTML
    const btnReiniciar = document.getElementById("btnReiniciar");
    const btnSalirFinal = document.getElementById("btnSalirFinal");
    const btnVerRankingFinal = document.getElementById("btnVerRankingFinal");
    const btnExportarRanking = document.getElementById("btnExportarRanking");

    // ================================
    // FUNCIÓN PARA MOSTRAR MODAL DE CONFIRMACIÓN
    // ================================
    let confirmCallback = null;

    function mostrarModalConfirmacion(mensaje, callback) {
      confirmCallback = callback;
      const modal = document.getElementById("modal-confirm-exit");
      const titulo = modal.querySelector("h2");

      // Usar traducción si está disponible
      if (window.translations && window.translations["common.confirmExit"]) {
        titulo.textContent = window.translations["common.confirmExit"];
      } else {
        titulo.textContent = mensaje || "¿Seguro que quieres salir?";
      }

      modal.style.display = "flex";

      // Configurar botones del modal de confirmación
      const btnYes = document.getElementById("btn-confirm-yes");
      const btnNo = document.getElementById("btn-confirm-no");

      // Remover listeners previos
      btnYes.replaceWith(btnYes.cloneNode(true));
      btnNo.replaceWith(btnNo.cloneNode(true));

      // Agregar nuevos listeners
      const newBtnYes = document.getElementById("btn-confirm-yes");
      const newBtnNo = document.getElementById("btn-confirm-no");

      newBtnYes.addEventListener("click", () => {
        modal.style.display = "none";
        if (confirmCallback) {
          confirmCallback(true);
          confirmCallback = null;
        }
      });

      newBtnNo.addEventListener("click", () => {
        modal.style.display = "none";
        if (confirmCallback) {
          confirmCallback(false);
          confirmCallback = null;
        }
      });
    }

    // ================================
    // FUNCIÓN PARA AJUSTAR LAYOUT EN MÓVILES
    // ================================
    function ajustarLayoutMovil() {
      if (!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return; // Solo en móviles
      }

      const alturaVentana = window.innerHeight;
      const alturaDisponible = alturaVentana - 200; // Reservar espacio para título y botones

      // Ajustar contenedor principal
      const contenedor = document.querySelector(".contenedor-juego");
      if (contenedor) {
        contenedor.style.maxHeight = `${alturaDisponible}px`;
        contenedor.style.overflowY = "auto";
      }

      // Ajustar teclado según altura disponible
      const letrasContainer = document.getElementById("letras");
      if (letrasContainer && alturaVentana < 700) {
        // Pantallas muy cortas
        letrasContainer.style.gap = "2px";
        letrasContainer.style.padding = "3px";

        const botones = letrasContainer.querySelectorAll(
          "button:not(.btn-ayuda)",
        );
        botones.forEach((btn) => {});
      }

      // Forzar reflow para evitar problemas de renderizado
      requestAnimationFrame(() => {
        if (contenedor) contenedor.style.display = "none";
        setTimeout(() => {
          if (contenedor) contenedor.style.display = "flex";
        }, 50);
      });
    }

    // Ejecutar al cargar y al redimensionar
    window.addEventListener("load", ajustarLayoutMovil);
    window.addEventListener("resize", ajustarLayoutMovil);
    setTimeout(ajustarLayoutMovil, 500);

    // ================================
    // DETECCIÓN DE DISPOSITIVO
    // ================================
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // ================================
    // SONIDOS DEL JUEGO
    // ================================
    const sonidos = {
      bien: new Audio("sounds/letra-bien.mp3"),
      mal: new Audio("sounds/letra-mal.mp3"),
      nuevaPalabra: new Audio("sounds/nueva-palabra.mp3"),
      fin: new Audio("sounds/fin.mp3"),
    };

    Object.values(sonidos).forEach((audio) => {
      audio.preload = "auto";
      audio.volume = 0.6;
    });

    // ================================
    // MANEJADOR DE EVENTOS MEJORADO
    // ================================
    class ButtonHandler {
      constructor() {
        this.activeButton = null;
        this.lastTouchTime = 0;
        this.touchMoveThreshold = 10;
        this.startX = 0;
        this.startY = 0;
      }

      setupButton(btn, letra, handler) {
        if (isTouchDevice) {
          // Para móviles: usar solo touch events
          btn.addEventListener(
            "touchstart",
            (e) => this.handleTouchStart(e, btn, letra, handler),
            { passive: false },
          );
          btn.addEventListener(
            "touchend",
            (e) => this.handleTouchEnd(e, btn, letra, handler),
            { passive: false },
          );
          btn.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
            passive: false,
          });
          btn.addEventListener("touchcancel", () => this.cancelTouch(btn));

          // Remover click listener para evitar conflictos
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        } else {
          // Para desktop: usar solo click
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            handler(btn, letra);
          });
        }

        // Añadir estilo visual para feedback táctil
        if (isTouchDevice) {
          btn.style.touchAction = "manipulation";
          btn.style.msTouchAction = "manipulation";
        }
      }

      handleTouchStart(e, btn, letra, handler) {
        e.preventDefault();
        e.stopPropagation();

        // Evitar múltiples toques rápidos
        const now = Date.now();
        if (now - this.lastTouchTime < 300) return;

        this.activeButton = btn;
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;

        // Feedback visual
        btn.style.opacity = "0.8";
        btn.style.transform = "scale(0.95)";
      }

      handleTouchMove(e) {
        if (!this.activeButton) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.startX);
        const deltaY = Math.abs(touch.clientY - this.startY);

        // Cancelar si el usuario se mueve demasiado
        if (
          deltaX > this.touchMoveThreshold ||
          deltaY > this.touchMoveThreshold
        ) {
          this.cancelTouch(this.activeButton);
        }
      }

      handleTouchEnd(e, btn, letra, handler) {
        e.preventDefault();
        e.stopPropagation();

        if (this.activeButton !== btn) return;
        if (btn.disabled) return;

        // Restaurar estilo
        btn.style.opacity = "";
        btn.style.transform = "";

        // Registrar tiempo
        this.lastTouchTime = Date.now();

        // Ejecutar handler
        setTimeout(() => {
          handler(btn, letra);
        }, 50);

        this.activeButton = null;
      }

      cancelTouch(btn) {
        if (btn) {
          btn.style.opacity = "";
          btn.style.transform = "";
        }
        this.activeButton = null;
      }
    }

    const buttonHandler = new ButtonHandler();

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
    let ah_ayudas = 2;
    let ah_palabrasAcertadas = 0;
    let ah_palabraSecreta;
    let ah_progreso;
    let ah_errores = 0;
    let ah_usuario = "";
    let ah_puntos = 0;
    let ah_idiomaJuego = "es";
    let ah_bloqueado = false;
    const AH_MAX_LETRAS = 15;
    let ah_palabrasUsadas = new Set(); // solo dura la partida

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
    // FUNCIONES PRINCIPALES
    // ================================
    function reproducirSonido(audio) {
      if (!audio) return;
      try {
        audio.currentTime = 0;
        audio.play().catch((e) => console.log("Audio error:", e));
      } catch (e) {
        console.log("Audio play failed:", e);
      }
    }

    function normalizarLetra(letra) {
      letra = letra.toUpperCase();

      if (letra === "Ñ") return "Ñ";

      const mapaVocales = {
        Á: "A",
        À: "A",
        Ä: "A",
        Â: "A",
        É: "E",
        È: "E",
        Ë: "E",
        Ê: "E",
        Í: "I",
        Ì: "I",
        Ï: "I",
        Î: "I",
        Ó: "O",
        Ò: "O",
        Ö: "O",
        Ô: "O",
        Ú: "U",
        Ù: "U",
        Ü: "U",
        Û: "U",
      };

      return mapaVocales[letra] || letra;
    }

    function deshabilitarTeclado() {
      const botones = letrasEl.querySelectorAll("button");
      botones.forEach((btn) => (btn.disabled = true));
    }

    function habilitarTeclado() {
      const botones = letrasEl.querySelectorAll("button");
      botones.forEach((btn) => (btn.disabled = false));
    }

    function ah_manejarLetra(btn, letra) {
      if (ah_bloqueado) return;
      if (btn.disabled) return;

      btn.disabled = true;
      const letraNormalizada = normalizarLetra(letra);

      if (normalizarLetra(ah_palabraSecreta).includes(letraNormalizada)) {
        reproducirSonido(sonidos.bien);
        btn.style.background = "green";

        for (let i = 0; i < ah_palabraSecreta.length; i++) {
          if (normalizarLetra(ah_palabraSecreta[i]) === letraNormalizada) {
            ah_progreso[i] = ah_palabraSecreta[i];
          }
        }

        ah_mostrarPalabra();

        if (!ah_progreso.includes("_")) {
          ah_bloqueado = true;
          deshabilitarTeclado();

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
            ah_bloqueado = false;
            ah_nuevaPalabra();
          }, 2800);
        }
      } else {
        reproducirSonido(sonidos.mal);
        btn.style.background = "red";
        ah_errores++;
        ah_actualizarAhorcado();
      }
    }

    function animarMarcador() {
      if (marcadorEl) {
        marcadorEl.style.animation = "none";
        setTimeout(() => {
          marcadorEl.style.animation = "pulse 0.5s ease";
        }, 10);
      }
    }

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
        z-index: 10000;
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

      requestAnimationFrame(() => {
        mensajeEl.style.opacity = "1";
        mensajeEl.style.transform = "translate(-50%, 0)";
      });

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

    window.iniciarAhorcado = function () {
      ah_bloqueado = false;

      ah_ayudas = 2;
      ah_palabrasAcertadas = 0;
      desbloquearAudioMovil();
      ah_palabrasUsadas.clear();

      const selectIdiomaJuego = document.getElementById("idioma-juego");
      ah_idiomaJuego = selectIdiomaJuego ? selectIdiomaJuego.value : "es";

      const inputUsuario = document.getElementById("usuario");
      if (!inputUsuario) {
        window.mostrarModalInfo(
          getTranslation("common.info.No.U"),
          "Error: No se encontró el campo usuario.",
        );
        return;
      }

      ah_usuario = inputUsuario.value.trim();
      if (ah_usuario.length < 3 || ah_usuario.length > 12) {
        window.mostrarModalInfo(
          getTranslation("common.info.3.12"),
          "El nombre debe tener entre 3 y 12 caracteres.",
        );
        return;
      }

      if (!ah_usuario) {
        window.mostrarModalInfo(
          getTranslation("common.info.ingresa"),
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
      ah_bloqueado = false;
      const btnGuardarRecord = document.getElementById("btnGuardarRecord");
      if (btnGuardarRecord) {
        btnGuardarRecord.disabled = false;
        btnGuardarRecord.textContent = getTranslation(
          "ahorcado.saveRecord",
          "Guardar récord local",
        );
      }

      const lista = palabras[ah_idiomaJuego] || palabras.es;

      // Filtrar palabras válidas (≤15 letras y no usadas)
      const palabrasDisponibles = lista.filter(
        (p) =>
          p.length <= AH_MAX_LETRAS &&
          !ah_palabrasUsadas.has(normalizarLetra(p.toUpperCase())),
      );

      // Si no quedan palabras final del juego
      if (palabrasDisponibles.length === 0) {
        mostrarMensajeTemporal(
          getTranslation(
            "ahorcado.allWordsCompleted",
            "🏆 ¡Has completado TODAS las palabras!",
          ),
          2500,
        );

        setTimeout(() => {
          ah_mostrarFinal("completado");
        }, 2600);

        return;
      }

      // Elegir palabra aleatoria válida
      const palabra =
        palabrasDisponibles[
          Math.floor(Math.random() * palabrasDisponibles.length)
        ].toUpperCase();

      // Marcar como usada
      ah_palabrasUsadas.add(palabra);

      ah_palabraSecreta = palabra;

      ah_progreso = Array(ah_palabraSecreta.length).fill("_");
      ah_errores = 0;

      ah_resetearSVG();
      letrasEl.innerHTML = "";
      ah_mostrarPalabra();
      ah_crearBotones();
    }

    function ah_mostrarPalabra() {
      palabraEl.innerHTML = "";

      palabraEl.classList.remove("larga", "extra-larga");

      if (window.innerWidth <= 480) {
        if (ah_palabraSecreta.length >= 12) {
          palabraEl.classList.add("extra-larga");
        } else if (ah_palabraSecreta.length >= 11) {
          palabraEl.classList.add("larga");
        }
      }

      for (let i = 0; i < ah_palabraSecreta.length; i++) {
        const span = document.createElement("span");
        span.textContent = ah_progreso[i] === "_" ? "_" : ah_progreso[i];
        span.className = ah_progreso[i] === "_" ? "ah-guion" : "ah-letra";
        palabraEl.appendChild(span);
      }
    }

    function ah_crearBotones() {
      const abecedario = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
      letrasEl.innerHTML = "";

      // === BOTONES DE LETRAS ===
      abecedario.forEach((letra) => {
        const btn = document.createElement("button");
        btn.textContent = letra;
        btn.type = "button";
        btn.className = "letra-btn";

        buttonHandler.setupButton(btn, letra, ah_manejarLetra);

        letrasEl.appendChild(btn);
      });

      // === BOTÓN AYUDA ===
      const btnAyuda = document.createElement("button");
      btnAyuda.className = "btn-ayuda";
      btnAyuda.textContent = `💡 ${ah_ayudas}`;
      btnAyuda.type = "button";

      if (ah_ayudas <= 0) btnAyuda.disabled = true;

      // Configurar eventos para el botón ayuda
      if (isTouchDevice) {
        btnAyuda.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            if (!btnAyuda.disabled) {
              btnAyuda.style.opacity = "0.8";
            }
          },
          { passive: false },
        );

        btnAyuda.addEventListener(
          "touchend",
          (e) => {
            e.preventDefault();
            btnAyuda.style.opacity = "";
            if (!btnAyuda.disabled) {
              usarAyuda(btnAyuda);
            }
          },
          { passive: false },
        );
      } else {
        btnAyuda.addEventListener("click", () => usarAyuda(btnAyuda));
      }

      letrasEl.appendChild(btnAyuda);
    }

    function usarAyuda(btn) {
      if (ah_ayudas <= 0) return;
      if (ah_bloqueado) return;

      const indicesOcultos = [];
      for (let i = 0; i < ah_progreso.length; i++) {
        if (ah_progreso[i] === "_") indicesOcultos.push(i);
      }

      if (indicesOcultos.length === 0) return;

      const index =
        indicesOcultos[Math.floor(Math.random() * indicesOcultos.length)];
      const letra = ah_palabraSecreta[index];
      const letraNormalizada = normalizarLetra(letra);

      for (let i = 0; i < ah_palabraSecreta.length; i++) {
        if (ah_palabraSecreta[i] === letra) {
          ah_progreso[i] = letra;
        }
      }
      // Marcar botón como acertado
      const botones = letrasEl.querySelectorAll(".letra-btn");

      botones.forEach((btnLetra) => {
        if (normalizarLetra(btnLetra.textContent) === letraNormalizada) {
          btnLetra.disabled = true;
          btnLetra.style.background = "green";
        }
      });

      ah_mostrarPalabra();
      reproducirSonido(sonidos.bien);

      ah_ayudas--;
      btn.textContent = `💡 ${ah_ayudas}`;
      if (ah_ayudas <= 0) btn.disabled = true;

      if (!ah_progreso.includes("_")) {
        ah_puntos++;
        ah_palabrasAcertadas++;

        if (ah_palabrasAcertadas % 10 === 0) {
          ah_ayudas++;
          mostrarMensajeTemporal(
            getTranslation(
              "ahorcado.extraHelpMessage",
              "💡 ¡Has ganado una ayuda extra!",
            ),
            2000,
          );
        }

        ah_actualizarMarcador();
        setTimeout(ah_nuevaPalabra, 1200);
      }
    }

    function ah_actualizarAhorcado() {
      if (ah_errores > 0 && ah_errores <= ah_partesSVG.length) {
        const parteId = ah_partesSVG[ah_errores - 1];
        const elemento = document.getElementById(parteId);
        if (elemento) elemento.style.display = "block";
      }

      if (ah_errores >= ah_maxErrores) {
        ah_bloqueado = true;
        deshabilitarTeclado();
        ah_revelarPalabra();
        setTimeout(() => ah_mostrarFinal(), 3200);
      }
    }

    function ah_revelarPalabra() {
      palabraEl.innerHTML = "";

      for (let i = 0; i < ah_palabraSecreta.length; i++) {
        const span = document.createElement("span");
        span.textContent = ah_palabraSecreta[i];
        span.className = ah_progreso[i] === "_" ? "ah-letra-no" : "ah-letra-si";
        palabraEl.appendChild(span);
      }

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

    function ah_mostrarFinal(motivo = "derrota") {
      const modalFinal = document.getElementById("modal-final");
      if (modalFinal) modalFinal.style.display = "flex";

      const resultado = document.getElementById("resultado");
      if (resultado) {
        let mensajeFinal = "";

        if (motivo === "completado") {
          mensajeFinal = `🔥 ${ah_usuario}, eres una pasada… ¡te las sabes todas!`;
        } else {
          const scoreText = getTranslation("ahorcado.score", "Puntuación");
          const pointsText = getTranslation("ahorcado.points", "puntos");
          mensajeFinal = `${ah_usuario}, ${scoreText}: ${ah_puntos} ${pointsText}`;
        }

        resultado.textContent = mensajeFinal;
      }

      reproducirSonido(sonidos.fin);
    }

    function getTranslation(key, fallback = "") {
      return window.translations?.[key] || fallback || key;
    }

    // ================================
    // CONFIGURACIÓN DE EVENTOS
    // ================================

    // Configurar eventos para los botones que se movieron del HTML
    function configurarEventosBotones() {
      // Botón Reiniciar en modal final
      if (btnReiniciar) {
        btnReiniciar.addEventListener("click", () => {
          const modalFinal = document.getElementById("modal-final");
          if (modalFinal) modalFinal.style.display = "none";
          const modalInicio = document.getElementById("modal-inicio");
          if (modalInicio) modalInicio.style.display = "flex";
        });
      }

      // Botón Salir en modal final
      if (btnSalirFinal) {
        btnSalirFinal.addEventListener("click", () => {
          mostrarModalConfirmacion(
            "¿Seguro que quieres salir del juego?",
            (confirmado) => {
              if (confirmado) {
                window.location.href = "../../index.html";
              }
            },
          );
        });
      }

      // Botón Ver Ranking en modal final
      if (btnVerRankingFinal) {
        btnVerRankingFinal.addEventListener("click", () => {
          window.location.href = "../ranking/rankingLocal.html";
        });
      }

      // Botón Exportar Ranking
      if (btnExportarRanking) {
        btnExportarRanking.addEventListener("click", () => {
          const ranking =
            JSON.parse(localStorage.getItem("rankingAhorcado")) || [];
          const dataStr = JSON.stringify(ranking, null, 2);
          const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);

          const exportFileDefaultName = `ranking_ahorcado_${new Date().toISOString().split("T")[0]}.json`;

          const linkElement = document.createElement("a");
          linkElement.setAttribute("href", dataUri);
          linkElement.setAttribute("download", exportFileDefaultName);
          linkElement.click();
        });
      }
    }

    const btnEmpezar = document.getElementById("btnEmpezar");
    if (btnEmpezar) {
      if (isTouchDevice) {
        btnEmpezar.addEventListener(
          "touchend",
          (e) => {
            e.preventDefault();
            iniciarAhorcado();
          },
          { passive: false },
        );
      } else {
        btnEmpezar.addEventListener("click", iniciarAhorcado);
      }
    }

    const btnInstrucciones = document.getElementById("btnInstrucciones");
    if (btnInstrucciones) {
      btnInstrucciones.addEventListener("click", () => {
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

        window.mostrarModalInfo(
          getTranslation("common.instructions", "Instrucciones"),
          instrucciones,
        );
      });
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
        mostrarModalConfirmacion(
          "¿Seguro que quieres salir del juego?",
          (confirmado) => {
            if (confirmado) {
              window.location.href = "../../index.html";
            }
          },
        );
      });
    }

    const btnSalir = document.getElementById("btnSalir");
    if (btnSalir) {
      btnSalir.addEventListener("click", () => {
        mostrarModalConfirmacion(
          "¿Seguro que quieres reiniciar el juego?",
          (confirmado) => {
            if (confirmado) {
              ah_resetearJuegoCompleto();
            }
          },
        );
      });
    }

    const btnGuardarRecord = document.getElementById("btnGuardarRecord");
    if (btnGuardarRecord) {
      btnGuardarRecord.addEventListener("click", () => {
        const registro = {
          usuario: ah_usuario,
          puntos: ah_puntos,
          juego: "Ahorcado",
          fecha: new Date().toISOString(),
          idioma: ah_idiomaJuego,
        };

        const ranking =
          JSON.parse(localStorage.getItem("rankingAhorcado")) || [];

        ranking.push(registro);
        ranking.sort((a, b) => b.puntos - a.puntos);

        localStorage.setItem("rankingAhorcado", JSON.stringify(ranking));

        btnGuardarRecord.disabled = true;
        btnGuardarRecord.textContent = getTranslation(
          "ahorcado.recordSaved",
          "Récord guardado",
        );

        mostrarMensajeTemporal(
          getTranslation(
            "ahorcado.recordSaved",
            "Récord guardado correctamente",
          ),
          1500,
        );
      });
    }

    function ah_resetearJuegoCompleto() {
      // Reset variables
      ah_bloqueado = false;

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
      const modalConfirm = document.getElementById("modal-confirm-exit");
      if (modalFinal) modalFinal.style.display = "none";
      if (modalInfo) modalInfo.style.display = "none";
      if (modalConfirm) modalConfirm.style.display = "none";

      // Mostrar modal inicio
      const modalInicio = document.getElementById("modal-inicio");
      if (modalInicio) modalInicio.style.display = "flex";

      // Limpiar input usuario
      const inputUsuario = document.getElementById("usuario");
      if (inputUsuario) inputUsuario.value = "";

      // Re-inicializar el select del idioma
      inicializarSelectIdioma();
    }

    // ================================
    // INICIALIZAR TODO
    // ================================

    // Configurar eventos de los botones que se movieron del HTML
    configurarEventosBotones();

    // ================================
    // FIX PARA MÓVILES
    // ================================

    // Prevenir scroll cuando se tocan botones
    document.addEventListener(
      "touchmove",
      function (e) {
        if (e.target.closest(".letras button, .letras .btn-ayuda")) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    // Prevenir zoom con doble toque
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      function (e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      },
      { passive: false },
    );

    // Prevenir menú contextual en botones
    document.addEventListener("contextmenu", function (e) {
      if (e.target.closest(".letras button, .letras .btn-ayuda")) {
        e.preventDefault();
      }
    });
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

  // Configurar evento del botón Aceptar
  const btnModalInfoAceptar = document.getElementById("btnModalInfoAceptar");
  if (btnModalInfoAceptar) {
    btnModalInfoAceptar.addEventListener("click", window.cerrarModalInfo);
  }
});
