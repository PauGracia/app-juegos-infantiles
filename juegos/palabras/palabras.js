document.addEventListener("DOMContentLoaded", () => {
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

  const RETRASO_FEEDBACK = 150; // ms – ajustado para Android

  // -----------------------------
  // SELECT IDIOMA
  // -----------------------------
  const selectIdioma = document.getElementById("idioma");
  let idiomaSeleccionado = parseInt(selectIdioma.value);

  selectIdioma.addEventListener("change", () => {
    idiomaSeleccionado = parseInt(selectIdioma.value);
  });

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

  // Normalizar texto (quitar tildes, pasar a minúsculas)
  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Salir del juego
  document.getElementById("salir-palabras").addEventListener("click", () => {
    location.href = "../../index.html";
  });

  // -----------------------------
  // FUNCIONES PRINCIPALES
  // -----------------------------
  function iniciarJuego() {
    resumen = [];
    aciertos = 0;
    errores = 0;
    actual = 0;
    idiomaSeleccionado = parseInt(selectIdioma.value);
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
    palabraObjetivo = normalizar(
      objetoActual.palabras[idiomaSeleccionado].trim()
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

    // Si es la última palabra, cambiar texto a "Finalizar"
    if (actual === seleccionados.length - 1) {
      btnSiguiente.textContent = "Finalizar";
    } else {
      btnSiguiente.textContent = "Siguiente";
    }

    btnSiguiente.disabled = true;
  }

  function siguiente() {
    resumen.push({ palabra: palabraObjetivo, correcta: !falloEstaPalabra });

    if (actual < seleccionados.length - 1) {
      actual++;
      document.getElementById("info-actual").textContent = actual + 1;
      mostrarImagen();
    } else {
      // Última palabra: abrir modal final
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

      // Retrasar el efecto visual para sincronizar con el sonido
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
      // Error
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

      // NO habilitar el botón Siguiente aquí
      document.getElementById("info-aciertos").textContent = aciertos;
      document.getElementById("info-errores").textContent = errores;

      // Revelar palabra si hay 3 intentos fallidos (esto sí habilita el botón)
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

    // Solo ahora habilitar el botón Siguiente
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
