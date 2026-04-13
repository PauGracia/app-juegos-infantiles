// ================================
// PRECARGAR IMAGEN DEL SPLASH
// ================================
const splashImage = new Image();
splashImage.src = "../../assets/img/iconos/palabras.png";

document.addEventListener("DOMContentLoaded", () => {
  // ================================
  // GESTIÓN DEL SPLASH SCREEN
  // ================================
  const splashScreen = document.getElementById("splash-screen-palabras");

  // Función para ocultar el splash
  function hideSplashScreen() {
    if (splashScreen) {
      splashScreen.classList.add("hidden");
      // Eliminar del DOM después de la transición
      setTimeout(() => {
        if (splashScreen && splashScreen.parentNode) {
          splashScreen.parentNode.removeChild(splashScreen);
        }
      }, 600);
    }
  }

  // Ocultar el splash después de un pequeño retraso
  setTimeout(hideSplashScreen, 200);

  // -----------------------------
  // INICIALIZACIÓN DE IDIOMA DE INTERFAZ
  // -----------------------------
  initLanguage();

  // -----------------------------
  // ELEMENTOS DEL DOM
  // -----------------------------
  const selectPalabrasIdioma = document.getElementById("palabras-idioma");
  const btnIniciar = document.getElementById("btn-iniciar");
  const btnSalirConfig = document.getElementById("btn-salir-config");
  const salirBtnJuego = document.getElementById("salir-palabras");
  const btnComprobar = document.getElementById("btnComprobar");
  const btnReiniciar = document.getElementById("btnReiniciar");
  const btnSalirFinal = document.getElementById("btnSalirFinal");
  const btnSiguiente = document.getElementById("btnSiguiente");
  const btnInstrucciones = document.getElementById("btn-instrucciones");
  const modalInstrucciones = document.getElementById("modal-instrucciones");
  const btnCerrarInstrucciones = document.getElementById(
    "btn-cerrar-instrucciones",
  );
  const modalConfirmExit = document.getElementById("modal-confirm-exit");
  const btnConfirmYes = document.getElementById("btn-confirm-yes");
  const btnConfirmNo = document.getElementById("btn-confirm-no");

  let idiomaPalabrasSeleccionado = parseInt(selectPalabrasIdioma.value);

  // Añadir después de la inicialización de elementos DOM
  // -----------------------------
  // MANEJO DEL TECLADO EN ANDROID WEBVIEW
  // -----------------------------
  function setupKeyboardHandling() {
    const panelInfo = document.getElementById("panel-info");
    const contenedorJuego = document.querySelector(".contenedor-imagenPalabra");
    const inputs = document.querySelectorAll(".letras-palabras input");

    // Detectar cuando el input recibe foco (teclado se abre)
    const handleInputFocus = () => {
      panelInfo.classList.add("keyboard-open");
      contenedorJuego.classList.add("keyboard-visible");

      // Scroll suave hacia los inputs
      setTimeout(() => {
        const inputsContainer = document.querySelector(".letras-palabras");
        if (inputsContainer) {
          inputsContainer.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    };

    // Detectar cuando el input pierde foco (teclado se cierra)
    const handleInputBlur = () => {
      panelInfo.classList.remove("keyboard-open");
      contenedorJuego.classList.remove("keyboard-visible");

      // Restaurar scroll al centro
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    };

    // Aplicar event listeners a inputs dinámicos
    const applyInputListeners = () => {
      document.querySelectorAll(".letras-palabras input").forEach((input) => {
        input.removeEventListener("focus", handleInputFocus);
        input.removeEventListener("blur", handleInputBlur);
        input.addEventListener("focus", handleInputFocus);
        input.addEventListener("blur", handleInputBlur);
      });
    };

    // Llamar cada vez que se muestre una nueva imagen
    const originalMostrarImagen = window.mostrarImagen;
    window.mostrarImagen = function () {
      if (originalMostrarImagen) originalMostrarImagen();
      setTimeout(applyInputListeners, 100);
    };

    // También aplicar al iniciar
    applyInputListeners();

    // Prevenir que el viewport se redimensione
    const preventViewportResize = () => {
      if (window.visualViewport) {
        const handleResize = () => {
          if (document.activeElement?.tagName === "INPUT") {
            document.body.style.minHeight = `${window.visualViewport.height}px`;
          } else {
            document.body.style.minHeight = "";
          }
        };
        window.visualViewport.addEventListener("resize", handleResize);
      }
    };

    preventViewportResize();
  }

  // Llamar cuando el DOM esté listo y también después de iniciar juego
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(setupKeyboardHandling, 500);
  });

  // También llamar después de iniciar juego
  const originalIniciarJuego = window.iniciarJuego;
  window.iniciarJuego = function () {
    if (originalIniciarJuego) originalIniciarJuego();
    setTimeout(setupKeyboardHandling, 500);
  };

  // -----------------------------
  // VARIABLES DEL JUEGO
  // -----------------------------
  let seleccionados = [];
  let actual = 0;
  let comprobado = false;
  let objetoActual = null;
  let palabraObjetivo = "";
  let resultadoCorrecto = false;
  let aciertos = 0;
  let comprobacionesTotales = 0;
  let ayudasTotales = 0;
  let comprobacionesEstaPalabra = 0;
  let palabraUsadaConAyuda = false;
  let resumen = [];
  let intentosFallidosPalabra = 0;
  let ayudaActivada = true;
  let palabraFinalizada = false;
  let cantidad = 3;
  let estabaEnModalFinal = false;
  let bolsaPalabras = []; // bolsa para palabras aleatorias
  let palabraOriginal = "";

  // ---------
  // SONIDOS
  // ---------
  const sonidosPalabras = (() => {
    // Lista de todos los sonidos necesarios
    const archivosSonidos = {
      acierto: "sounds/acierto.mp3",
      fallo: "sounds/fallo.mp3",
      ganar: "sounds/ganar.mp3",
      azul: "sounds/azul.mp3",
      sonidoInactividad: "sounds/pitido.mp3",
    };

    // Objeto para almacenar los Audio elements
    const sonidos = {};

    let sonidosCargados = 0;
    const totalSonidos = Object.keys(archivosSonidos).length;

    /**
     * Precarga todos los sonidos
     */
    function precargarSonidos() {
      console.log("🎵 Precargando sonidos...");

      Object.entries(archivosSonidos).forEach(([key, ruta]) => {
        const audio = new Audio();

        audio.addEventListener(
          "canplaythrough",
          () => {
            sonidosCargados++;
            console.log(
              `✅ Sonido cargado: ${key} (${sonidosCargados}/${totalSonidos})`,
            );
          },
          { once: true },
        );

        audio.addEventListener("error", (e) => {
          console.error(`❌ Error cargando sonido: ${key}`, e);
        });

        audio.src = ruta;
        audio.load();
        audio.volume = 1;
        sonidos[key] = audio;
      });
    }

    /**
     * Reproduce un sonido de forma optimizada
     */
    function playSonido(key) {
      const audio = sonidos[key];
      if (!audio) {
        console.warn(`Sonido no encontrado: ${key}`);
        return;
      }

      try {
        // Resetear al principio
        audio.currentTime = 0;

        // Intentar reproducir
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Si es error de autoplay, intentar de nuevo después de interacción
            if (error.name === "NotAllowedError") {
              console.log(
                `⚠️ Autoplay bloqueado para ${key}, esperando interacción...`,
              );
              // No hacer nada, el audio se desbloqueará con la siguiente interacción
            } else {
              console.warn(`Error reproduciendo ${key}:`, error);
            }
          });
        }
      } catch (error) {
        console.warn(`Error en reproducción de ${key}:`, error);
      }
    }

    // Iniciar precarga inmediatamente
    precargarSonidos();

    // API pública
    return {
      acierto: () => playSonido("acierto"),
      fallo: () => playSonido("fallo"),
      ganar: () => playSonido("ganar"),
      azul: () => playSonido("azul"),
      inactividad: () => playSonido("sonidoInactividad"),
    };
  })();
  // Constante para el retraso de feedback visual
  const RETRASO_FEEDBACK = 150;
  //-----------------------
  // variables para inactividad
  //---------------------------
  let intervaloInactividad = null;
  let tiempoInactividad = 0;
  let avisoInactividadMostrado = false;
  let modalAvisoInactividad = null;

  // -----------------------------
  // FUNCIONES AUXILIARES
  // -----------------------------

  // Función para reiniciar contador de inactividad
  function reiniciarContadorInactividad() {
    tiempoInactividad = 0;
    avisoInactividadMostrado = false;

    // Cerrar modal de aviso si existe
    if (modalAvisoInactividad && modalAvisoInactividad.parentNode) {
      modalAvisoInactividad.remove();
      modalAvisoInactividad = null;
    }
  }

  // Función para finalizar por inactividad
  function finalizarPorInactividad() {
    // Limpiar intervalo
    if (intervaloInactividad) {
      clearInterval(intervaloInactividad);
      intervaloInactividad = null;
    }

    // Cerrar modal de aviso si existe
    if (modalAvisoInactividad && modalAvisoInactividad.parentNode) {
      modalAvisoInactividad.remove();
      modalAvisoInactividad = null;
    }

    // Volver al menú inicial
    location.reload();
  }

  // Función para mostrar aviso de inactividad
  function mostrarAvisoInactividad() {
    if (avisoInactividadMostrado) return;
    avisoInactividadMostrado = true;

    // Reproducir sonido - el sonido de inactividad no está definido en sonidosPalabras
    // Usar un sonido alternativo o crear uno
    if (sonidosPalabras && sonidosPalabras.inactividad) {
      sonidosPalabras.inactividad();
    }

    // Crear modal de aviso
    modalAvisoInactividad = document.createElement("div");
    modalAvisoInactividad.id = "modal-aviso-inactividad";
    modalAvisoInactividad.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20000;
    backdrop-filter: blur(8px);
  `;

    // Obtener traducciones usando window.translations
    const warningText = window.translations?.["memori.warning"] || "Aviso";
    const inactivityWarningText =
      window.translations?.["memori.inactivityWarning"] ||
      "Llevas 10 minutos sin jugar. Si en los próximos 3 minutos no juegas, el juego se acabará.";
    const understandText =
      window.translations?.["common.understand"] || "Entendido";

    modalAvisoInactividad.innerHTML = `
    <div class="modal-inactividad-content" style="
      background: linear-gradient(145deg, #ffffff, #f8fafc);
      padding: 35px 40px;
      border-radius: 24px;
      text-align: center;
      max-width: 400px;
      width: 85%;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      border: 3px solid #ff9800;
      animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <h2 style="
        color: #2d3748;
        font-size: 1.8rem;
        margin-bottom: 20px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      ">${warningText}</h2>
      <p style="
        font-size: 1.2rem;
        color: #4a5568;
        margin-bottom: 25px;
        line-height: 1.5;
      ">${inactivityWarningText}</p>
      <button id="btn-entendido-inactividad" style="
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 14px 32px;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 6px 12px rgba(102, 126, 234, 0.25);
      ">${understandText}</button>
    </div>
  `;

    document.body.appendChild(modalAvisoInactividad);

    document
      .getElementById("btn-entendido-inactividad")
      .addEventListener("click", () => {
        if (modalAvisoInactividad && modalAvisoInactividad.parentNode) {
          modalAvisoInactividad.remove();
          modalAvisoInactividad = null;
        }
        reiniciarContadorInactividad();
      });
  }

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function mostrarMensajeTemporal(texto, tiempo = 1500) {
    const contenedor = document.getElementById("mensaje-temporal");
    if (!contenedor) return;

    contenedor.textContent = texto;
    contenedor.style.display = "block";
    void contenedor.offsetWidth;
    contenedor.style.opacity = "1";

    setTimeout(() => {
      contenedor.style.opacity = "0";
      setTimeout(() => {
        contenedor.style.display = "none";
      }, 300);
    }, tiempo);
  }

  function applyTranslationsToElement(element) {
    const key = element.getAttribute("data-i18n");
    if (key && window.translations && window.translations[key]) {
      element.textContent = window.translations[key];
    }
  }

  // -----------------------------
  // FUNCIÓN DE CONFIRMACIÓN
  // -----------------------------
  function abrirConfirmExit(callbackYes, origen = "juego") {
    estabaEnModalFinal =
      document.getElementById("modal-final").style.display === "flex";

    if (estabaEnModalFinal) {
      document.getElementById("modal-final").style.display = "none";
    }

    modalConfirmExit.style.display = "flex";
    modalConfirmExit.style.zIndex = "2000";

    function limpiar() {
      btnConfirmYes.removeEventListener("click", yesHandler);
      btnConfirmNo.removeEventListener("click", noHandler);
      modalConfirmExit.style.display = "none";
      modalConfirmExit.style.zIndex = "";
    }

    const yesHandler = () => {
      limpiar();
      callbackYes();
    };

    const noHandler = () => {
      limpiar();

      if (estabaEnModalFinal) {
        document.getElementById("modal-final").style.display = "flex";
      }

      if (origen === "juego") {
        document.getElementById("juego").style.display = "flex";
        document.getElementById("panel-info").style.display = "block";

        if (!palabraFinalizada) {
          document.getElementById("btnComprobar").disabled = false;
        }
      }
    };

    btnConfirmYes.addEventListener("click", yesHandler);
    btnConfirmNo.addEventListener("click", noHandler);
  }

  // -----------------------------
  // FUNCIONES DEL JUEGO
  // -----------------------------

  function obtenerElementosAleatorios(cantidad, pool) {
    if (bolsaPalabras.length < cantidad) {
      bolsaPalabras = shuffle([...pool]);
    }

    return bolsaPalabras.splice(0, cantidad);
  }

  function mostrarImagen() {
    comprobado = false;
    resultadoCorrecto = false;
    intentosFallidosPalabra = 0;
    palabraFinalizada = false;
    comprobacionesEstaPalabra = 0;
    palabraUsadaConAyuda = false;

    objetoActual = seleccionados[actual];
    palabraOriginal = objetoActual.palabras[idiomaPalabrasSeleccionado].trim();
    palabraObjetivo = normalizar(palabraOriginal);
    console.log("Original:", palabraOriginal);
    const imagenElement = document.getElementById("imagen");
    imagenElement.src = objetoActual.imagen;

    // Forzar recálculo para SVG
    imagenElement.onload = function () {
      // el SVG se renderice correctamente
      this.style.width = "100%";
      this.style.height = "100%";
      this.style.objectFit = "contain";
    };

    imagenElement.classList.add("imagen-palabras");
    const contenedor = document.querySelector(".imagen-contenedor");
    contenedor.style.borderColor = "black";

    const inputsDiv = document.getElementById("inputs");
    inputsDiv.innerHTML = "";
    inputsDiv.classList.remove("palabra-larga");

    if (palabraObjetivo.length > 12) {
      inputsDiv.classList.add("palabra-larga");
    }

    for (let i = 0; i < palabraOriginal.length; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.dataset.index = i;
      input.style.backgroundColor = "white";

      // Atributos específicos para evitar autocompletado
      input.setAttribute("autocomplete", "off");
      input.setAttribute("autocorrect", "off");
      input.setAttribute("autocapitalize", "none");
      input.setAttribute("spellcheck", "false");
      input.setAttribute("inputmode", "text");
      input.setAttribute("data-had-value", "false");

      //  Usar name muy genérico que no coincida con patrones de SMS
      input.name = `l_${Date.now()}_${i}`;

      // Prevenir menú contextual
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        return false;
      });

      // Prevenir copiar/cortar/pegar
      input.addEventListener("copy", (e) => e.preventDefault());
      input.addEventListener("cut", (e) => e.preventDefault());
      input.addEventListener("paste", (e) => e.preventDefault());

      // Prevenir cualquier evento de autocompletado
      input.addEventListener("animationstart", (e) => {
        if (e.animationName.includes("autofill")) {
          e.preventDefault();
        }
      });

      // Forzar a Android a no mostrar sugerencias de SMS
      input.setAttribute("data-1p-ignore", "true");
      input.setAttribute("data-lpignore", "true");
      input.setAttribute("data-form-type", "other");

      // Manejo del input (escribir)
      input.addEventListener("input", (e) => {
        reiniciarContadorInactividad();

        const next = inputsDiv.querySelector(`input[data-index='${i + 1}']`);
        if (next && e.target.value && !comprobado) {
          const hadValue = e.target.getAttribute("data-had-value") === "true";

          if (!hadValue) {
            // Era un input vacío, es escritura nueva, avanzar
            next.focus();
          }
        }

        // Marcar si este input ahora tiene valor
        if (e.target.value) {
          e.target.setAttribute("data-had-value", "true");
        } else {
          e.target.setAttribute("data-had-value", "false");
        }

        // Limpiar clases de error al editar
        if (input.classList.contains("letra-error")) {
          input.classList.remove("letra-error");
          input.style.backgroundColor = "white";
        }
      });

      // Manejo del click
      input.addEventListener("click", (e) => {
        reiniciarContadorInactividad();

        if (!input.disabled) {
          const teniaError = input.classList.contains("letra-error");
          const teniaCorrecta = input.classList.contains("letra-correcta");

          e.target.value = "";

          if (teniaCorrecta) {
            input.classList.remove("letra-correcta");
            input.style.backgroundColor = "white";
          }

          if (!teniaError && !teniaCorrecta) {
            input.style.backgroundColor = "white";
          }
        }
      });

      // Manejo del focus (sin selección azul)
      input.addEventListener("focus", (e) => {
        setTimeout(() => {
          if (e.target.value) {
            e.target.setSelectionRange(
              e.target.value.length,
              e.target.value.length,
            );
          }
        }, 0);
      });

      // Manejo de teclas especiales
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !e.target.value) {
          e.preventDefault();
          const prev = inputsDiv.querySelector(`input[data-index='${i - 1}']`);
          if (prev) {
            prev.focus();
            prev.value = "";
            prev.style.backgroundColor = "white";
            prev.classList.remove(
              "letra-correcta",
              "letra-error",
              "letra-ayuda",
            );
            prev.setAttribute("data-had-value", "false");
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = inputsDiv.querySelector(`input[data-index='${i - 1}']`);
          if (prev) prev.focus();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          const next = inputsDiv.querySelector(`input[data-index='${i + 1}']`);
          if (next) next.focus();
        }
      });

      inputsDiv.appendChild(input);
    }

    if (actual === seleccionados.length - 1) {
      btnSiguiente.setAttribute("data-i18n", "palabras.buttons.finish");
    } else {
      btnSiguiente.setAttribute("data-i18n", "palabras.buttons.next");
    }

    applyTranslationsToElement(btnSiguiente);
    btnSiguiente.disabled = true;
    document.getElementById("btnComprobar").disabled = false;
  }

  function comprobar() {
    reiniciarContadorInactividad();

    if (palabraFinalizada) return;

    comprobacionesTotales++;
    comprobacionesEstaPalabra++;

    document.getElementById("info-comprobaciones").textContent =
      comprobacionesTotales;

    const inputs = document.querySelectorAll("#inputs input");

    // Construir el resultado solo con los inputs que tienen valor
    let resultado = "";
    inputs.forEach((input) => {
      resultado += normalizar(input.value || "");
    });

    const contenedor = document.querySelector(".imagen-contenedor");

    // Verificar si todos los inputs que deberían tener valor están completos
    const todosLlenos = Array.from(inputs).every(
      (input) => input.value.length > 0,
    );

    // Solo considerar correcto si todos los inputs están llenos Y coinciden exactamente
    resultadoCorrecto = todosLlenos && resultado === palabraObjetivo;

    if (resultadoCorrecto) {
      aciertos++;
      palabraFinalizada = true;
      sonidosPalabras.acierto();

      setTimeout(() => {
        contenedor.style.borderColor = "green";
        inputs.forEach((input, i) => {
          input.value = palabraOriginal[i];
          input.classList.remove("letra-error");
          input.classList.add("letra-correcta");
          input.style.backgroundColor = "#9f9";
          input.disabled = true;
          input.setAttribute("data-had-value", "true");
        });

        btnSiguiente.disabled = false;
        document.getElementById("btnComprobar").disabled = true;
        document.getElementById("info-aciertos").textContent = aciertos;
      }, RETRASO_FEEDBACK);

      return;
    } else {
      // Solo reproducir sonido de fallo si hay al menos un input con valor incorrecto
      const hayAlgunInputLleno = Array.from(inputs).some(
        (input) => input.value.length > 0,
      );
      const vaARevelar = ayudaActivada && comprobacionesEstaPalabra >= 3;

      // Si NO se va a revelar y hay al menos un input con contenido, reproducir fallo
      if (!vaARevelar && hayAlgunInputLleno) {
        sonidosPalabras.fallo();
      }

      // Evaluar cada input individualmente
      for (let i = 0; i < palabraObjetivo.length; i++) {
        const valorInput = normalizar(inputs[i].value || "");
        const inputTieneValor = inputs[i].value.length > 0;

        // Si el input está vacío, no hacer nada (ni correcto ni error)
        if (!inputTieneValor) {
          // Mantener el input como está, sin clases de error
          if (inputs[i].classList.contains("letra-error")) {
            inputs[i].classList.remove("letra-error");
          }
          if (inputs[i].classList.contains("letra-correcta")) {
            inputs[i].classList.remove("letra-correcta");
          }
          inputs[i].style.backgroundColor = "white";
          inputs[i].disabled = false;
          continue;
        }

        // Solo procesar inputs que tienen valor
        if (valorInput === palabraObjetivo[i]) {
          // Letra correcta - se bloquea
          inputs[i].classList.remove("letra-error");
          inputs[i].classList.add("letra-correcta");
          inputs[i].style.backgroundColor = "#9f9";
          inputs[i].disabled = true;
          inputs[i].setAttribute("data-had-value", "true");
        } else {
          // Letra incorrecta se puede editar (NO se bloquea)
          inputs[i].classList.remove("letra-correcta");
          inputs[i].classList.remove("letra-error");
          void inputs[i].offsetWidth;
          inputs[i].classList.add("letra-error");
          inputs[i].style.backgroundColor = "#fed7d7";
          inputs[i].disabled = false;
          // Mantener el estado del atributo
          if (inputs[i].value) {
            inputs[i].setAttribute("data-had-value", "true");
          } else {
            inputs[i].setAttribute("data-had-value", "false");
          }
        }
      }

      // Verificar si después de evaluar, todos los inputs están correctos y completos
      const todosCorrectos = Array.from(inputs).every((input, idx) => {
        const tieneValor = input.value.length > 0;
        const esCorrecto = normalizar(input.value) === palabraObjetivo[idx];
        return tieneValor && esCorrecto;
      });

      const todosLlenosAhora = Array.from(inputs).every(
        (input) => input.value.length > 0,
      );

      // Si todos los inputs están llenos y correctos, completar automáticamente
      if (todosCorrectos && todosLlenosAhora) {
        aciertos++;
        palabraFinalizada = true;
        sonidosPalabras.acierto();

        setTimeout(() => {
          contenedor.style.borderColor = "green";
          inputs.forEach((input, i) => {
            input.value = palabraOriginal[i];
            input.classList.remove("letra-error");
            input.classList.add("letra-correcta");
            input.style.backgroundColor = "#9f9";
            input.disabled = true;
          });

          btnSiguiente.disabled = false;
          document.getElementById("btnComprobar").disabled = true;
          document.getElementById("info-aciertos").textContent = aciertos;
        }, RETRASO_FEEDBACK);

        return;
      }

      if (vaARevelar) {
        revelarPalabra(inputs);
      }
    }

    comprobado = true;
  }

  function revelarPalabra(inputs) {
    reiniciarContadorInactividad();

    sonidosPalabras.azul();

    const contenedor = document.querySelector(".imagen-contenedor");
    contenedor.style.borderColor = "#4299e1";

    for (let i = 0; i < palabraObjetivo.length; i++) {
      inputs[i].value = palabraOriginal[i];
      inputs[i].className = "";
      inputs[i].style.cssText = "";
      inputs[i].classList.add("letra-ayuda");
      inputs[i].disabled = true;
    }

    palabraFinalizada = true;
    palabraUsadaConAyuda = true;
    ayudasTotales++;

    btnSiguiente.disabled = false;
    document.getElementById("btnComprobar").disabled = true;
    document.getElementById("info-ayudas").textContent = ayudasTotales;
  }

  function siguiente() {
    reiniciarContadorInactividad();

    resumen.push({
      palabra: palabraOriginal,
      conAyuda: palabraUsadaConAyuda,
      comprobaciones: comprobacionesEstaPalabra,
    });

    document.getElementById("btnComprobar").disabled = false;

    if (actual < seleccionados.length - 1) {
      actual++;
      document.getElementById("info-actual").textContent = actual + 1;
      mostrarImagen();
    } else {
      mostrarResultadoFinal();
    }
  }

  function mostrarResultadoFinal() {
    // Limpiar intervalo de inactividad al terminar el juego
    if (intervaloInactividad) {
      clearInterval(intervaloInactividad);
      intervaloInactividad = null;
    }

    // Cerrar modal de inactividad si existe
    if (modalAvisoInactividad && modalAvisoInactividad.parentNode) {
      modalAvisoInactividad.remove();
      modalAvisoInactividad = null;
    }

    sonidosPalabras.ganar();

    modalConfirmExit.style.display = "none";

    setTimeout(() => {
      document.getElementById("juego").style.display = "none";
      document.getElementById("panel-info").style.display = "none";

      document.getElementById("total-aciertos").textContent = aciertos;
      document.getElementById("total-comprobaciones").textContent =
        comprobacionesTotales;

      document.getElementById("final-ayudas").style.display = ayudasTotales
        ? "block"
        : "none";
      document.getElementById("total-ayudas").textContent = ayudasTotales;

      const lista = document.getElementById("lista-resultados");
      lista.innerHTML = "";

      resumen.forEach((r) => {
        const li = document.createElement("li");
        li.textContent = `${r.conAyuda ? "💡" : "✅"} ${r.palabra} (${r.comprobaciones})`;
        lista.appendChild(li);
      });

      document.getElementById("modal-final").style.display = "flex";
    }, RETRASO_FEEDBACK + 100);
  }

  function iniciarJuego() {
    // Limpiar intervalo anterior si existe
    if (intervaloInactividad) {
      clearInterval(intervaloInactividad);
      intervaloInactividad = null;
    }

    // Reiniciar variables de inactividad
    tiempoInactividad = 0;
    avisoInactividadMostrado = false;

    // Iniciar intervalo de inactividad (cada segundo)
    // Para producción: 600 segundos = 10 minutos, 780 segundos = 13 minutos
    intervaloInactividad = setInterval(() => {
      tiempoInactividad++;

      // AVISO a los 10 minutos (600 segundos)
      if (tiempoInactividad === 600 && !avisoInactividadMostrado) {
        mostrarAvisoInactividad();
      }

      // FINALIZAR a los 13 minutos (780 segundos)
      if (tiempoInactividad === 780) {
        clearInterval(intervaloInactividad);
        intervaloInactividad = null;
        finalizarPorInactividad();
      }
    }, 1000);

    const checkboxAyuda = document.getElementById("activar-ayuda");
    ayudaActivada = checkboxAyuda ? checkboxAyuda.checked : true;

    const cantidadInput = document.getElementById("cantidad");
    cantidad = parseInt(cantidadInput.value, 10);

    if (isNaN(cantidad) || cantidad < 1 || cantidad > 50) {
      const msg =
        window.translations?.palabras?.errors?.invalidAmount ??
        "El número de palabras debe estar entre 1 y 50";

      mostrarMensajeTemporal(msg, 1500);
      cantidadInput.value = Math.min(Math.max(cantidad || 1, 1), 50);
      return;
    }

    resumen = [];
    aciertos = 0;
    comprobacionesTotales = 0;
    ayudasTotales = 0;
    actual = 0;

    idiomaPalabrasSeleccionado = parseInt(selectPalabrasIdioma.value);

    const elementosFiltrados = elementos.filter((el) => {
      const palabra = normalizar(el.palabras[idiomaPalabrasSeleccionado]);
      return palabra.length <= 15;
    });

    if (cantidad > elementosFiltrados.length) {
      mostrarMensajeTemporal(
        `Solo hay ${elementosFiltrados.length} palabras disponibles para este idioma.`,
        1500,
      );
      cantidad = elementosFiltrados.length;
      cantidadInput.value = cantidad;
    }
    seleccionados = obtenerElementosAleatorios(cantidad, elementosFiltrados);

    document.getElementById("fila-ayudas").style.display = ayudaActivada
      ? "flex"
      : "none";

    document.getElementById("modal").style.display = "none";
    document.getElementById("juego").style.display = "flex";

    document.getElementById("info-total").textContent = seleccionados.length;
    document.getElementById("info-actual").textContent = actual + 1;
    document.getElementById("info-aciertos").textContent = aciertos;
    document.getElementById("info-comprobaciones").textContent =
      comprobacionesTotales;

    if (ayudaActivada) {
      document.getElementById("info-ayudas").textContent = ayudasTotales;
    }

    mostrarImagen();

    try {
      const audioTest = new Audio();
      audioTest.volume = 0;
      audioTest.play().catch(() => {});
    } catch (e) {}

    const dummy = document.getElementById("dummy-input");
    dummy.focus();
    setTimeout(() => {
      dummy.blur();
    }, 50);

    setTimeout(() => {
      dummy.blur();
    }, 50);
  }

  // -----------------------------
  // SINCRONIZAR IDIOMA
  // -----------------------------
  const idiomaInterfaz = (localStorage.getItem("uiLang") || "es").split("-")[0];

  const mapaIdiomaPalabras = {
  es: 0,
  ca: 1,
  en: 2,
  fr: 3,
  it: 4,
  pt: 5,
  gl: 6,
  eu: 7,
};

  if (mapaIdiomaPalabras[idiomaInterfaz] !== undefined) {
    selectPalabrasIdioma.value = mapaIdiomaPalabras[idiomaInterfaz];
    idiomaPalabrasSeleccionado = mapaIdiomaPalabras[idiomaInterfaz];
  }

  selectPalabrasIdioma.addEventListener("change", () => {
    idiomaPalabrasSeleccionado = parseInt(selectPalabrasIdioma.value);
  });

  // -----------------------------
  // EVENT LISTENERS
  // -----------------------------
  btnIniciar.addEventListener("click", iniciarJuego);

  btnSalirConfig.addEventListener("click", () => {
    abrirConfirmExit(() => {
      location.href = "../../index.html";
    });
  });

  salirBtnJuego.addEventListener("click", () => {
    // Limpiar intervalo de inactividad
    if (intervaloInactividad) {
      clearInterval(intervaloInactividad);
      intervaloInactividad = null;
    }

    // Cerrar modal de inactividad si existe
    if (modalAvisoInactividad && modalAvisoInactividad.parentNode) {
      modalAvisoInactividad.remove();
      modalAvisoInactividad = null;
    }

    abrirConfirmExit(() => {
      document.getElementById("juego").style.display = "none";
      document.getElementById("panel-info").style.display = "block";
      document.getElementById("modal").style.display = "flex";

      seleccionados = [];
      resumen = [];
      aciertos = 0;
      actual = 0;

      const idiomaInterfaz = (localStorage.getItem("uiLang") || "es").split(
        "-",
      )[0];
      if (mapaIdiomaPalabras[idiomaInterfaz] !== undefined) {
        selectPalabrasIdioma.value = mapaIdiomaPalabras[idiomaInterfaz];
        idiomaPalabrasSeleccionado = mapaIdiomaPalabras[idiomaInterfaz];
      }

      document.getElementById("cantidad").value = 3;
    }, "juego");
  });

  btnComprobar.addEventListener("click", comprobar);
  btnSiguiente.addEventListener("click", siguiente);
  btnReiniciar.addEventListener("click", () => location.reload());

  btnSalirFinal.addEventListener("click", () => {
    abrirConfirmExit(() => {
      location.href = "../../index.html";
    }, "final");
  });

  btnInstrucciones.addEventListener("click", () => {
    modalInstrucciones.style.display = "flex";
  });

  btnCerrarInstrucciones.addEventListener("click", () => {
    modalInstrucciones.style.display = "none";
  });

  // -----------------------------
  // EXPORTAR FUNCIONES
  // -----------------------------
  window.iniciarJuego = iniciarJuego;
  window.comprobar = comprobar;
  window.siguiente = siguiente;
  window.reiniciarJuego = () => location.reload();
  window.salirJuego = () => (location.href = "../../index.html");
});
