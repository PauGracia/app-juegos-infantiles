document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // INICIALIZACIÓN DE IDIOMA DE INTERFAZ
  // -----------------------------
  // Inicializar idioma del juego (interfaz) desde localStorage
  initLanguage();

  // -----------------------------
  // CONFIGURACIÓN DE IDIOMA DE PALABRAS
  // -----------------------------
  const selectPalabrasIdioma = document.getElementById("palabras-idioma");
  const btnIniciar = document.getElementById("btn-iniciar");
  const btnSalirConfig = document.getElementById("btn-salir-config");
  const salirBtnJuego = document.getElementById("salir-palabras");

  let idiomaPalabrasSeleccionado = parseInt(selectPalabrasIdioma.value);

  selectPalabrasIdioma.addEventListener("change", () => {
    idiomaPalabrasSeleccionado = parseInt(selectPalabrasIdioma.value);
  });

  // Botón de iniciar juego
  btnIniciar.addEventListener("click", () => {
    iniciarJuego();
  });

  // Botón de salir en configuración
  btnSalirConfig.addEventListener("click", () => {
    location.href = "../../index.html";
  });

  // Botón de salir durante el juego
  salirBtnJuego.addEventListener("click", () => {
    location.href = "../../index.html";
  });

  // -----------------------------
  // SONIDOS
  // -----------------------------
  const sonidos = {
    acierto: new Audio("sounds/acierto.mp3"),
    fallo: new Audio("sounds/fallo.mp3"),
    ganar: new Audio("sounds/ganar.mp3"),
  };

  function reproducirSonido(nombre) {
    const sonido = sonidos[nombre];
    if (!sonido) return;

    sonido.currentTime = 0;
    sonido.play().catch(() => {});
  }

  Object.values(sonidos).forEach((s) => {
    s.load();
  });

  const RETRASO_FEEDBACK = 150;

  // -----------------------------
  // VARIABLES DEL JUEGO
  // -----------------------------
  let seleccionados = [];
  let actual = 0;
  let comprobado = false;
  let objetoActual = null;
  let palabraObjetivo = "";
  let resultadoCorrecto = false;
  let falloEstaPalabra = false;
  let aciertos = 0;
  let errores = 0;
  let resumen = [];
  let intentosFallidosPalabra = 0;

  // Normalizar texto
  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // -----------------------------
  // FUNCIONES PRINCIPALES
  // -----------------------------
  function iniciarJuego() {
    resumen = [];
    aciertos = 0;
    errores = 0;
    actual = 0;

    // Usar el selector específico para palabras
    idiomaPalabrasSeleccionado = parseInt(selectPalabrasIdioma.value);

    const cantidad = parseInt(document.getElementById("cantidad").value);

    seleccionados = [...elementos]
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidad);

    document.getElementById("modal").style.display = "none";
    document.getElementById("juego").style.display = "flex";

    document.getElementById("info-total").textContent = seleccionados.length;
    document.getElementById("info-actual").textContent = actual + 1;
    document.getElementById("info-aciertos").textContent = aciertos;
    document.getElementById("info-errores").textContent = errores;

    mostrarImagen();
  }

  function mostrarImagen() {
    comprobado = false;
    resultadoCorrecto = false;
    falloEstaPalabra = false;
    intentosFallidosPalabra = 0;

    objetoActual = seleccionados[actual];

    // Usar el idioma seleccionado para las PALABRAS
    palabraObjetivo = normalizar(
      objetoActual.palabras[idiomaPalabrasSeleccionado].trim()
    );

    document.getElementById("imagen").src = objetoActual.imagen;

    const contenedor = document.querySelector(".imagen-contenedor");
    contenedor.style.borderColor = "black";

    const inputsDiv = document.getElementById("inputs");
    inputsDiv.innerHTML = "";

    for (let i = 0; i < palabraObjetivo.length; i++) {
      const input = document.createElement("input");
      input.maxLength = 1;
      input.dataset.index = i;
      input.style.backgroundColor = "white";

      input.addEventListener("input", () => {
        if (!comprobado) {
          const next = inputsDiv.querySelector(`input[data-index='${i + 1}']`);
          if (next && input.value) next.focus();
        }
      });

      input.addEventListener("click", () => {
        if (comprobado) {
          input.value = "";
          input.style.backgroundColor = "white";
        }
      });

      inputsDiv.appendChild(input);
    }

    const btnSiguiente = document.getElementById("btnSiguiente");

    // Actualizar texto del botón según idioma
    if (actual === seleccionados.length - 1) {
      btnSiguiente.setAttribute("data-i18n", "palabras.buttons.finish");
    } else {
      btnSiguiente.setAttribute("data-i18n", "palabras.buttons.next");
    }

    // Aplicar traducción automáticamente
    applyTranslationsToElement(btnSiguiente);

    btnSiguiente.disabled = true;
  }

  // Función auxiliar para aplicar traducción a un elemento específico
  function applyTranslationsToElement(element) {
    const key = element.getAttribute("data-i18n");
    if (key && window.translations && window.translations[key]) {
      element.textContent = window.translations[key];
    }
  }

  function siguiente() {
    resumen.push({ palabra: palabraObjetivo, correcta: !falloEstaPalabra });

    if (actual < seleccionados.length - 1) {
      actual++;
      document.getElementById("info-actual").textContent = actual + 1;
      mostrarImagen();
    } else {
      mostrarResultadoFinal();
    }
  }

  function comprobar() {
    const inputs = document.querySelectorAll("#inputs input");
    if ([...inputs].some((input) => !input.value)) return;

    let resultado = "";
    inputs.forEach((input) => (resultado += normalizar(input.value)));

    const contenedor = document.querySelector(".imagen-contenedor");

    resultadoCorrecto = resultado === palabraObjetivo;

    if (resultadoCorrecto) {
      if (!comprobado) aciertos++;

      reproducirSonido("acierto");

      setTimeout(() => {
        contenedor.style.borderColor = "green";

        for (let i = 0; i < palabraObjetivo.length; i++) {
          inputs[i].style.backgroundColor = "#9f9";
          inputs[i].disabled = true;
        }

        document.getElementById("btnSiguiente").disabled = false;
        document.getElementById("info-aciertos").textContent = aciertos;
      }, RETRASO_FEEDBACK);
    } else {
      intentosFallidosPalabra++;
      errores++;
      falloEstaPalabra = true;

      reproducirSonido("fallo");

      for (let i = 0; i < palabraObjetivo.length; i++) {
        if (normalizar(inputs[i].value) !== palabraObjetivo[i]) {
          inputs[i].style.backgroundColor = "#f99";
          inputs[i].classList.remove("letra-error");
          void inputs[i].offsetWidth;
          inputs[i].classList.add("letra-error");
        } else {
          inputs[i].style.backgroundColor = "#9f9";
          inputs[i].disabled = true;
        }
      }

      document.getElementById("info-aciertos").textContent = aciertos;
      document.getElementById("info-errores").textContent = errores;

      if (intentosFallidosPalabra >= 3) {
        revelarPalabra(inputs);
      }
    }

    comprobado = true;
  }

  function revelarPalabra(inputs) {
    for (let i = 0; i < palabraObjetivo.length; i++) {
      inputs[i].value = palabraObjetivo[i];
      inputs[i].style.backgroundColor = "#9dd7ff";
      inputs[i].disabled = true;
    }

    falloEstaPalabra = true;
    comprobado = true;
    document.getElementById("btnSiguiente").disabled = false;
  }

  function mostrarResultadoFinal() {
    reproducirSonido("ganar");

    setTimeout(() => {
      document.getElementById("juego").style.display = "none";
      document.getElementById("panel-info").style.display = "none";

      document.getElementById("total-aciertos").textContent = aciertos;
      document.getElementById("total-errores").textContent = errores;

      const lista = document.getElementById("lista-resultados");
      lista.innerHTML = "";

      resumen.forEach((r) => {
        const li = document.createElement("li");
        li.textContent = `${r.correcta ? "✅" : "❌"} ${r.palabra}`;
        lista.appendChild(li);
      });

      document.getElementById("modal-final").style.display = "flex";
    }, RETRASO_FEEDBACK + 100);
  }

  // -----------------------------
  // EXPORTAR FUNCIONES
  // -----------------------------
  window.iniciarJuego = iniciarJuego;
  window.comprobar = comprobar;
  window.siguiente = siguiente;
  window.reiniciarJuego = () => location.reload();
  window.salirJuego = () => (location.href = "../../index.html");
});
