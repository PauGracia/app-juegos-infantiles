// escucha languageChanged

function actualizarEtiquetasSelectIdioma() {
  const select = document.getElementById("idioma-juego");
  if (!select || !window.translations) return;

  select.querySelectorAll("option").forEach((opt) => {
    const key = `language.${opt.value}`;
    opt.textContent = window.translations[key] || opt.value;
  });
}

function actualizarTextosJuego() {
  if (typeof window.ah_refrescarUI === "function") {
    window.ah_refrescarUI();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // ================================
  // GESTIÓN DEL SPLASH SCREEN
  // ================================
  const splashScreen = document.getElementById("splash-screen-ahorcado");

  // PRECARGAR LA IMAGEN DEL SPLASH
  const splashImage = new Image();
  splashImage.src = "../../assets/img/iconos/ahorcado.png";

  splashImage.onload = function () {};

  // Función para ocultar el splash cuando todo esté listo
  function hideSplashScreen() {
    if (splashScreen) {
      splashScreen.classList.add("hidden");
      setTimeout(() => {
        if (splashScreen && splashScreen.parentNode) {
          splashScreen.parentNode.removeChild(splashScreen);
        }
      }, 600);
    }
  }

  // ================================
  // FUNCIÓN DE TRADUCCIÓN GLOBAL
  // ================================
  window.getTranslation = function (key, fallback = "") {
    return window.translations?.[key] || fallback || key;
  };

  // ================================
  // CÓDIGO PRINCIPAL DEL JUEGO
  // ================================
  (function () {
    // Variables de estado
    let ah_idiomaJuego = "es";
    let ah_ayudas = 2;
    let ah_palabrasAcertadas = 0;
    let ah_palabraSecreta;
    let ah_progreso;
    let ah_errores = 0;
    let ah_usuario = "";
    let ah_puntos = 0;
    let ah_bloqueado = false;
    const AH_MAX_LETRAS = 15;
    let ah_palabrasUsadas = new Set();
    let ah_partidaPalabrasAcertadas = 0;
    let ah_categoriaActual = "";

    // ================================
    // LISTENER DE CAMBIO DE IDIOMA
    // ================================
    document.addEventListener("languageChanged", (e) => {
      actualizarEtiquetasSelectIdioma();
      if (!localStorage.getItem("gameLang")) {
        const select = document.getElementById("idioma-juego");
        if (select) {
          select.value = e.detail.lang;
          ah_idiomaJuego = e.detail.lang;
        }
      }
      actualizarTextosJuego();
    });

    // ================================
    // INICIALIZAR IDIOMA DEL SELECT
    // ================================
    let selectListenerAdded = false;

    function inicializarSelectIdioma() {
      const select = document.getElementById("idioma-juego");
      if (!select) return;

      let idiomaInicial =
        localStorage.getItem("uiLang") || document.documentElement.lang || "es";
      const opcionesValidas = ["es", "ca", "en", "it", "pt", "fr"];
      if (!opcionesValidas.includes(idiomaInicial)) {
        idiomaInicial = "es";
      }

      select.value = idiomaInicial;
      ah_idiomaJuego = idiomaInicial;

      if (!selectListenerAdded) {
        select.addEventListener("change", (e) => {
          ah_idiomaJuego = e.target.value;
          localStorage.setItem("gameLang", ah_idiomaJuego);
          if (btnPista) {
            btnPista.disabled = ah_bloqueado || !ah_categoriaActual;
          }
        });
        selectListenerAdded = true;
      }
    }

    inicializarSelectIdioma();

    // Elementos del DOM
    const palabraEl = document.getElementById("palabra");
    const letrasEl = document.getElementById("letras");
    const marcadorEl = document.getElementById("marcador-ahorcado");
    const btnReiniciar = document.getElementById("btnReiniciar");
    const btnSalirFinal = document.getElementById("btnSalirFinal");
    const btnVerRankingFinal = document.getElementById("btnVerRankingFinal");
    const btnExportarRanking = document.getElementById("btnExportarRanking");
    const btnPista = document.getElementById("btnPista");

    // Función para manejar la pista
    function usarPista() {
      if (ah_bloqueado || !ah_categoriaActual) return;
      reproducirSonido(sonidos.click);
      const categoriaTraducida = getTranslation(
        `categoria.${ah_categoriaActual}`,
        ah_categoriaActual,
      );
      mostrarMensajeTemporal(`${categoriaTraducida}`, 3000);
    }

    // ================================
    // FUNCIÓN PARA MOSTRAR MODAL DE CONFIRMACIÓN
    // ================================
    let confirmCallback = null;

    function mostrarModalConfirmacion(mensaje, callback) {
      confirmCallback = callback;
      const modal = document.getElementById("modal-confirm-exit");
      const titulo = modal.querySelector("h2");

      if (window.translations && window.translations["common.confirmExit"]) {
        titulo.textContent = window.translations["common.confirmExit"];
      } else {
        titulo.textContent = mensaje || "¿Seguro que quieres salir?";
      }

      modal.style.display = "flex";

      const btnYes = document.getElementById("btn-confirm-yes");
      const btnNo = document.getElementById("btn-confirm-no");

      btnYes.replaceWith(btnYes.cloneNode(true));
      btnNo.replaceWith(btnNo.cloneNode(true));

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
        return;
      }

      const alturaVentana = window.innerHeight;
      const alturaDisponible = alturaVentana - 200;

      const contenedor = document.querySelector(".contenedor-juego");
      if (contenedor) {
        contenedor.style.maxHeight = `${alturaDisponible}px`;
        contenedor.style.overflowY = "auto";
      }

      const letrasContainer = document.getElementById("letras");
      if (letrasContainer && alturaVentana < 700) {
        letrasContainer.style.gap = "2px";
        letrasContainer.style.padding = "3px";
      }

      requestAnimationFrame(() => {
        if (contenedor) contenedor.style.display = "none";
        setTimeout(() => {
          if (contenedor) contenedor.style.display = "flex";
        }, 50);
      });
    }

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
      click: new Audio("sounds/click.mp3"),
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
        this.touchMoveThreshold = 0;
        this.startX = 0;
        this.startY = 0;
      }

      setupButton(btn, letra, handler) {
        if (isTouchDevice) {
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
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        } else {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            handler(btn, letra);
          });
        }

        if (isTouchDevice) {
          btn.style.touchAction = "manipulation";
          btn.style.msTouchAction = "manipulation";
        }
      }

      handleTouchStart(e, btn, letra, handler) {
        e.preventDefault();
        e.stopPropagation();

        const now = Date.now();
        if (now - this.lastTouchTime < 300) return;

        this.activeButton = btn;
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;

        btn.style.opacity = "0.8";
        btn.style.transform = "scale(0.95)";
      }

      handleTouchMove(e) {
        if (!this.activeButton) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.startX);
        const deltaY = Math.abs(touch.clientY - this.startY);

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

        btn.style.opacity = "";
        btn.style.transform = "";

        this.lastTouchTime = Date.now();

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

    function formatearInstruccionesParaModal(mensaje) {
      const lineas = mensaje.split("\n");
      let htmlFormateado = "";
      let enLista = false;

      lineas.forEach((linea, index) => {
        const lineaTrim = linea.trim();

        if (lineaTrim === "") {
          if (enLista) {
            htmlFormateado += "</div>";
            enLista = false;
          }
          htmlFormateado += '<div style="height: 15px;"></div>';
        } else if (lineaTrim.startsWith("•")) {
          if (!enLista) {
            htmlFormateado += '<div style="margin: 10px 0 15px 15px;">';
            enLista = true;
          }
          htmlFormateado += `<div style="margin-bottom: 10px; line-height: 1.5;">${lineaTrim}</div>`;
        } else if (lineaTrim.endsWith(":")) {
          if (enLista) {
            htmlFormateado += "</div>";
            enLista = false;
          }
          htmlFormateado += `<div style="font-weight: 800; color: #2d3748; font-size: 1.1em; margin: 20px 0 12px 0; padding-bottom: 5px; border-bottom: 2px solid #e2e8f0;">${lineaTrim}</div>`;
        } else {
          if (enLista) {
            htmlFormateado += "</div>";
            enLista = false;
          }
          htmlFormateado += `<div style="margin-bottom: 12px; line-height: 1.6;">${lineaTrim}</div>`;
        }
      });

      if (enLista) {
        htmlFormateado += "</div>";
      }

      return htmlFormateado;
    }

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
      if (!letra) return "";

      const letraMayus = letra.toUpperCase();

      // La Ñ y la Ç se mantienen como están (no se normalizan)
      if (letraMayus === "Ñ" || letraMayus === "Ç") {
        return letraMayus;
      }

      // Para el resto de letras (incluyendo vocales acentuadas), normalizar
      return letraMayus.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
      const palabraNormalizada = normalizarLetra(ah_palabraSecreta);

      if (palabraNormalizada.includes(letraNormalizada)) {
        reproducirSonido(sonidos.bien);
        btn.style.background = "green";

        for (let i = 0; i < ah_palabraSecreta.length; i++) {
          if (normalizarLetra(ah_palabraSecreta[i]) === letraNormalizada) {
            ah_progreso[i] = ah_palabraSecreta[i];
          }
        }

        ah_mostrarPalabra();

        if (!ah_progreso.includes("_")) {
          ah_partidaPalabrasAcertadas++;
          const ganaAyuda = ah_partidaPalabrasAcertadas % 10 === 0;
          if (ganaAyuda) {
            ah_ayudas++;
          }
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

          if (ganaAyuda) {
            setTimeout(() => {
              mostrarMensajeTemporal(
                getTranslation(
                  "ahorcado.extraHelpMessage",
                  "💡 ¡Has ganado una ayuda extra!",
                ),
                2000,
              );
            }, 3000);
          }

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
      ah_idiomaJuego =
        localStorage.getItem("gameLang") ||
        document.getElementById("idioma-juego")?.value ||
        "es";
      ah_bloqueado = false;
      ah_ayudas = 2;
      ah_palabrasAcertadas = 0;
      ah_partidaPalabrasAcertadas = 0;
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
      window.ah_refrescarUI = function () {
        ah_actualizarMarcador();
      };

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
        if (ah_partidaPalabrasAcertadas >= 3) {
          btnGuardarRecord.disabled = false;
          btnGuardarRecord.textContent = getTranslation(
            "ahorcado.saveRecord",
            "Guardar récord",
          );
          btnGuardarRecord.style.opacity = "1";
        } else {
          btnGuardarRecord.disabled = true;
          btnGuardarRecord.textContent = getTranslation(
            "ahorcado.saveRecord",
            "Guardar récord",
          );
          btnGuardarRecord.style.opacity = "0.7";
        }
      }

      const lista = palabras[ah_idiomaJuego] || palabras.es;
      const palabrasDisponibles = lista.filter(
        (p) =>
          p.palabra.length <= AH_MAX_LETRAS &&
          !ah_palabrasUsadas.has(normalizarLetra(p.palabra)),
      );

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

      const palabraObj =
        palabrasDisponibles[
          Math.floor(Math.random() * palabrasDisponibles.length)
        ];
      const palabraOriginal = palabraObj.palabra.toUpperCase();
      ah_categoriaActual = palabraObj.categoria;
      const palabraNormalizada = normalizarLetra(palabraOriginal);

      ah_palabrasUsadas.add(palabraNormalizada);
      ah_palabraSecreta = palabraOriginal;

      ah_progreso = ah_palabraSecreta.split("").map((char) => {
        return char === "-" ? "-" : "_";
      });

      ah_errores = 0;

      ah_resetearSVG();
      letrasEl.innerHTML = "";
      ah_mostrarPalabra();
      ah_crearBotones();

      actualizarPistaCategoria();
      if (btnPista) {
        btnPista.disabled = false;
      }
    }

    function actualizarPistaCategoria() {
      const pistaElement = document.getElementById("pista-categoria");
      if (!pistaElement) return;

      if (ah_categoriaActual) {
        const categoriaTraducida = getTranslation(
          `categoria.${ah_categoriaActual}`,
          ah_categoriaActual,
        );
        pistaElement.innerHTML = `${getTranslation("ahorcado.clue", "Pista:")} <span class="categoria-valor">${categoriaTraducida}</span>`;
        pistaElement.style.display = "block";
      } else {
        pistaElement.style.display = "none";
      }
      if (btnPista) {
        btnPista.disabled = ah_bloqueado || !ah_categoriaActual;
      }
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
        const char = ah_palabraSecreta[i];
        const progresoChar = ah_progreso[i];

        span.textContent = progresoChar;

        if (char === "-") {
          span.className = "ah-guion-pre";
        } else if (progresoChar === "_") {
          span.className = "ah-guion";
        } else {
          span.className = "ah-letra";
          span.textContent = progresoChar;
        }

        palabraEl.appendChild(span);
      }
    }

    function ah_crearBotones() {
      letrasEl.innerHTML = "";

      let abecedario = [];

      switch (ah_idiomaJuego) {
        case "es":
          abecedario = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
          break;
        case "ca":
          abecedario = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
          const indexC = abecedario.indexOf("C");
          abecedario.splice(indexC + 1, 0, "Ç");
          break;
        case "pt":
          abecedario = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
          const indexCPT = abecedario.indexOf("C");
          abecedario.splice(indexCPT + 1, 0, "Ç");
          break;
        case "en":
        case "it":
        case "fr":
          abecedario = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
          break;
        default:
          abecedario = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
      }

      abecedario.forEach((letra) => {
        const btn = document.createElement("button");
        btn.textContent = letra;
        btn.type = "button";
        btn.className = "letra-btn";

        buttonHandler.setupButton(btn, letra, ah_manejarLetra);

        letrasEl.appendChild(btn);
      });

      const btnAyuda = document.createElement("button");
      btnAyuda.className = "btn-ayuda";
      btnAyuda.textContent = `💡 ${ah_ayudas}`;
      btnAyuda.type = "button";

      if (ah_ayudas <= 0) btnAyuda.disabled = true;

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
        if (normalizarLetra(ah_palabraSecreta[i]) === letraNormalizada) {
          ah_progreso[i] = ah_palabraSecreta[i];
        }
      }

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

      const btnGuardarRecord = document.getElementById("btnGuardarRecord");
      if (btnGuardarRecord) {
        if (ah_partidaPalabrasAcertadas >= 3) {
          btnGuardarRecord.disabled = false;
          btnGuardarRecord.textContent = getTranslation(
            "ahorcado.saveRecord",
            "Guardar récord",
          );
          btnGuardarRecord.style.opacity = "1";
        } else {
          btnGuardarRecord.disabled = true;
          btnGuardarRecord.textContent = getTranslation(
            "ahorcado.minWordsRequired",
            "Mínimo 3 palabras para guardar",
          );
          btnGuardarRecord.style.opacity = "0.7";
        }
      }

      reproducirSonido(sonidos.fin);
    }

    // ================================
    // CONFIGURACIÓN DE EVENTOS
    // ================================
    function configurarEventosBotones() {
      if (btnReiniciar) {
        btnReiniciar.addEventListener("click", () => {
          const modalFinal = document.getElementById("modal-final");
          if (modalFinal) modalFinal.style.display = "none";
          const modalInicio = document.getElementById("modal-inicio");
          if (modalInicio) modalInicio.style.display = "flex";
        });
      }

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

      if (btnVerRankingFinal) {
        btnVerRankingFinal.addEventListener("click", () => {
          window.location.href = "../ranking/rankingLocal.html";
        });
      }

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
• ${getTranslation("ahorcado.instructions.minWords", "Debes acertar al menos 3 palabras para poder guardar tu récord.")}

${getTranslation("ahorcado.instructions.ranking", "RANKING:")}
• ${getTranslation("ahorcado.instructions.saveButton", "Puedes guardar tu puntuación desde el menú final.")}
• ${getTranslation("ahorcado.instructions.viewRanking", "Puedes ver el ranking desde el menú inicial o final.")}
• ${getTranslation("ahorcado.instructions.exportRanking", "También puedes exportar el ranking en formato JSON.")}

${getTranslation("ahorcado.instructions.language", "IDIOMA:")}
• ${getTranslation("ahorcado.instructions.interfaceLanguage", "Puedes jugar a este juego en diferentes idiomas para practicar.")}


${getTranslation("ahorcado.instructions.goodLuck", "¡Buena suerte!")}
        `;

        const instruccionesFormateadas =
          formatearInstruccionesParaModal(instrucciones);
        window.mostrarModalInfo(
          getTranslation("common.instructions", "Instrucciones"),
          instruccionesFormateadas,
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
      ah_bloqueado = false;
      ah_palabraSecreta = "";
      ah_progreso = [];
      ah_errores = 0;
      ah_puntos = 0;
      ah_usuario = "";
      ah_partidaPalabrasAcertadas = 0;

      if (palabraEl) palabraEl.innerHTML = "";
      if (letrasEl) letrasEl.innerHTML = "";
      ah_actualizarMarcador();
      ah_resetearSVG();

      const modalFinal = document.getElementById("modal-final");
      const modalInfo = document.getElementById("modal-info");
      const modalConfirm = document.getElementById("modal-confirm-exit");
      if (modalFinal) modalFinal.style.display = "none";
      if (modalInfo) modalInfo.style.display = "none";
      if (modalConfirm) modalConfirm.style.display = "none";

      const modalInicio = document.getElementById("modal-inicio");
      if (modalInicio) modalInicio.style.display = "flex";

      const inputUsuario = document.getElementById("usuario");
      if (inputUsuario) inputUsuario.value = "";

      inicializarSelectIdioma();
      document.addEventListener("languageChanged", () => {
        const btnPista = document.getElementById("btnPista");
        if (btnPista) {
          btnPista.disabled = false;
        }
      });

      if (btnPista) {
        btnPista.disabled = true;
      }
    }

    // ================================
    // INICIALIZAR TODO
    // ================================
    configurarEventosBotones();

    document.addEventListener(
      "touchmove",
      function (e) {
        if (e.target.closest(".letras button, .letras .btn-ayuda")) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

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

    document.addEventListener("contextmenu", function (e) {
      if (e.target.closest(".letras button, .letras .btn-ayuda")) {
        e.preventDefault();
      }
    });

    if (btnPista) {
      if (isTouchDevice) {
        btnPista.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            if (!btnPista.disabled) {
              btnPista.style.transform = "scale(0.95)";
            }
          },
          { passive: false },
        );

        btnPista.addEventListener(
          "touchend",
          (e) => {
            e.preventDefault();
            btnPista.style.transform = "";
            if (!btnPista.disabled) {
              usarPista();
            }
          },
          { passive: false },
        );

        btnPista.addEventListener(
          "touchmove",
          (e) => {
            e.preventDefault();
            btnPista.style.transform = "";
          },
          { passive: false },
        );

        btnPista.addEventListener(
          "touchcancel",
          (e) => {
            e.preventDefault();
            btnPista.style.transform = "";
          },
          { passive: false },
        );
      } else {
        btnPista.addEventListener("click", usarPista);
      }
    }
  })();

  // ================================
  // OCULTAR EL SPLASH SCREEN DESPUÉS DE UN PEQUEÑO RETRASO
  // ================================
  setTimeout(() => {
    // Primero ocultamos el splash
    hideSplashScreen();

    // Luego mostramos el modal (después de un pequeño retraso)

    const modalInicio = document.getElementById("modal-inicio");
    if (modalInicio) {
      modalInicio.style.display = "flex";
      // Forzar reflow para evitar la animación de crecimiento
      void modalInicio.offsetHeight;
    }
  }, 200);
  // ================================
  // FUNCIONES MODAL GLOBALES
  // ================================
  window.mostrarModalInfo = function (titulo, mensaje = "") {
    const modalTitulo = document.getElementById("modal-info-titulo");
    const modalTexto = document.getElementById("modal-info-texto");
    const modal = document.getElementById("modal-info");

    if (modalTitulo) modalTitulo.textContent = titulo;
    if (modalTexto) {
      const mensajeConSaltos = mensaje.replace(/\n/g, "<br>");
      modalTexto.innerHTML = mensajeConSaltos;

      if (
        titulo === getTranslation("common.instructions", "Instrucciones") ||
        titulo === "Instrucciones"
      ) {
        modalTexto.style.cssText = `
          color: #4a5568;
          font-size: 1.05em;
          line-height: 1.7;
          text-align: left;
          padding: 10px 5px;
        `;

        const lineas = mensajeConSaltos.split("<br>");
        let contenidoFormateado = "";

        lineas.forEach((linea) => {
          if (linea.trim().startsWith("•")) {
            contenidoFormateado += `<div style="margin-bottom: 8px; padding-left: 10px;">${linea}</div>`;
          } else if (linea.includes(":")) {
            contenidoFormateado += `<div style="font-weight: 700; color: #2d3748; margin: 15px 0 8px 0;">${linea}</div>`;
          } else if (linea.trim() === "") {
            contenidoFormateado += '<div style="height: 10px;"></div>';
          } else {
            contenidoFormateado += `<div style="margin-bottom: 8px;">${linea}</div>`;
          }
        });

        modalTexto.innerHTML = contenidoFormateado;
      }
    }
    if (modal) modal.style.display = "flex";

    setTimeout(() => {
      const modalContenido = document.querySelector(".modal-ranking-contenido");
      if (modalContenido) {
        const scrollContainer = modalContenido.querySelector(
          ".modal-scroll-container",
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }

        const viewportHeight = window.innerHeight;
        const modalHeight = modalContenido.offsetHeight;

        if (modalHeight > viewportHeight * 0.9) {
          modalContenido.style.maxHeight = `${viewportHeight * 0.85}px`;
        }
      }
    }, 50);
  };

  window.cerrarModalInfo = function () {
    const modal = document.getElementById("modal-info");
    if (modal) modal.style.display = "none";
  };

  const btnModalInfoAceptar = document.getElementById("btnModalInfoAceptar");
  if (btnModalInfoAceptar) {
    btnModalInfoAceptar.addEventListener("click", window.cerrarModalInfo);
  }
});
