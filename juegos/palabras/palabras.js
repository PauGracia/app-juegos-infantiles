document.addEventListener("DOMContentLoaded", () => {
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

  // -----------------------------
  // SONIDOS - VERSIÓN SIMPLE Y COMPROBADA
  // -----------------------------
  const sonidosPalabras = (() => {
    // Lista de todos los sonidos necesarios
    const archivosSonidos = {
      acierto: "sounds/acierto.mp3",
      fallo: "sounds/fallo.mp3",
      ganar: "sounds/ganar.mp3",
      azul: "sounds/azul.mp3",
    };

    // Objeto para almacenar los Audio elements precargados
    const sonidos = {};

    // Estado de carga
    let sonidosCargados = 0;
    const totalSonidos = Object.keys(archivosSonidos).length;
    let precargaCompleta = false;

    /**
     * Precarga todos los sonidos al iniciar
     */
    function precargarSonidos() {
      console.log("🎵 Precargando sonidos...");

      Object.entries(archivosSonidos).forEach(([key, ruta]) => {
        const audio = new Audio();

        // Eventos para monitorear la carga
        audio.addEventListener(
          "canplaythrough",
          () => {
            sonidosCargados++;
            console.log(
              `✅ Sonido cargado: ${key} (${sonidosCargados}/${totalSonidos})`,
            );

            if (sonidosCargados === totalSonidos) {
              precargaCompleta = true;
              console.log("🎵 Todos los sonidos precargados correctamente");
            }
          },
          { once: true },
        );

        audio.addEventListener("error", (e) => {
          console.error(`❌ Error cargando sonido: ${key}`, e);
        });

        // Configurar y precargar
        audio.src = ruta;
        audio.load(); // Inicia la precarga
        audio.volume = 1; // Volumen al máximo para todos
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
            // Ignorar errores de autoplay (se solucionan con la interacción del usuario)
            if (error.name !== "NotAllowedError") {
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

    // Desbloquear audio en la primera interacción del usuario
    const desbloquearAudio = () => {
      try {
        // Intentar crear un contexto de audio silencioso
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          if (ctx.state === "suspended") {
            ctx
              .resume()
              .then(() => {
                console.log("🔊 AudioContext desbloqueado");
              })
              .catch(() => {});
          }
        }
      } catch (e) {
        // Fallback: reproducir un sonido a volumen 0
        if (sonidos.acierto) {
          const audioSilencioso = sonidos.acierto.cloneNode();
          audioSilencioso.volume = 0;
          audioSilencioso.play().catch(() => {});
        }
      }

      // Remover listeners
      document.removeEventListener("click", desbloquearAudio);
      document.removeEventListener("touchstart", desbloquearAudio);
    };

    // Añadir listeners para la primera interacción
    document.addEventListener("click", desbloquearAudio, { once: true });
    document.addEventListener("touchstart", desbloquearAudio, { once: true });

    // API pública
    return {
      acierto: () => playSonido("acierto"),
      fallo: () => playSonido("fallo"),
      ganar: () => playSonido("ganar"),
      azul: () => playSonido("azul"),
      // Método de utilidad para verificar estado
      estaPrecargado: () => precargaCompleta,
    };
  })();

  // Constante para el retraso de feedback visual
  const RETRASO_FEEDBACK = 150;

  // -----------------------------
  // FUNCIONES AUXILIARES
  // -----------------------------

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
    palabraObjetivo = normalizar(
      objetoActual.palabras[idiomaPalabrasSeleccionado].trim(),
    );

    document.getElementById("imagen").src = objetoActual.imagen;

    const contenedor = document.querySelector(".imagen-contenedor");
    contenedor.style.borderColor = "black";

    const inputsDiv = document.getElementById("inputs");
    inputsDiv.innerHTML = "";
    inputsDiv.classList.remove("palabra-larga");

    if (palabraObjetivo.length > 12) {
      inputsDiv.classList.add("palabra-larga");
    }

    for (let i = 0; i < palabraObjetivo.length; i++) {
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
        const next = inputsDiv.querySelector(`input[data-index='${i + 1}']`);
        if (next && e.target.value) {
          next.focus();
        }

        if (input.classList.contains("letra-error")) {
          input.classList.remove("letra-error");
          input.style.backgroundColor = "white";
        }
      });

      // Manejo del click
      input.addEventListener("click", (e) => {
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
    if (palabraFinalizada) return;

    comprobacionesTotales++;
    comprobacionesEstaPalabra++;

    document.getElementById("info-comprobaciones").textContent =
      comprobacionesTotales;

    const inputs = document.querySelectorAll("#inputs input");

    let resultado = "";
    inputs.forEach((input) => (resultado += normalizar(input.value)));

    const contenedor = document.querySelector(".imagen-contenedor");
    resultadoCorrecto = resultado === palabraObjetivo;

    if (resultadoCorrecto) {
      aciertos++;
      palabraFinalizada = true;
      sonidosPalabras.acierto();

      setTimeout(() => {
        contenedor.style.borderColor = "green";
        inputs.forEach((input) => {
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
    } else {
      // Verificar si se va a revelar la palabra
      const vaARevelar = ayudaActivada && comprobacionesEstaPalabra >= 3;

      // Si NO se va a revelar, reproducir sonido de fallo
      if (!vaARevelar) {
        sonidosPalabras.fallo();
      }

      for (let i = 0; i < palabraObjetivo.length; i++) {
        const valorInput = inputs[i] ? normalizar(inputs[i].value || "") : "";

        if (valorInput === palabraObjetivo[i]) {
          // Letra correcta
          inputs[i].classList.remove("letra-error");
          inputs[i].classList.add("letra-correcta");
          inputs[i].style.backgroundColor = "#9f9";
          inputs[i].disabled = true;
        } else {
          // Letra incorrecta o vacía - NO deshabilitar para permitir corrección
          inputs[i].classList.remove("letra-correcta");
          inputs[i].classList.remove("letra-error");
          void inputs[i].offsetWidth;
          inputs[i].classList.add("letra-error");
          inputs[i].style.backgroundColor = "#fed7d7";
          inputs[i].disabled = false; // Asegurar que no esté deshabilitado
        }
      }

      if (vaARevelar) {
        revelarPalabra(inputs);
      }
    }

    comprobado = true;
  }

  function revelarPalabra(inputs) {
    sonidosPalabras.azul();

    for (let i = 0; i < palabraObjetivo.length; i++) {
      inputs[i].value = palabraObjetivo[i];
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
    resumen.push({
      palabra: palabraObjetivo,
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
    const dummy = document.getElementById("dummy-input");

    dummy.focus();

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
