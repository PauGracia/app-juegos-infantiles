document.addEventListener("DOMContentLoaded", () => {
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

    document.getElementById("btnSiguiente").disabled = true;
  }

  function comprobar() {
    const inputs = document.querySelectorAll("#inputs input");
    if ([...inputs].some((input) => !input.value)) return;

    let resultado = "";
    inputs.forEach((input) => (resultado += normalizar(input.value)));

    const contenedor = document.querySelector(".imagen-contenedor");

    for (let i = 0; i < palabraObjetivo.length; i++) {
      inputs[i].style.backgroundColor =
        normalizar(inputs[i].value) === palabraObjetivo[i] ? "#9f9" : "#f99";
    }

    resultadoCorrecto = resultado === palabraObjetivo;
    contenedor.style.borderColor = resultadoCorrecto ? "green" : "red";
    document.getElementById("btnSiguiente").disabled = !resultadoCorrecto;

    if (!comprobado) {
      if (resultadoCorrecto) aciertos++;
      else {
        errores++;
        falloEstaPalabra = true;
      }
      document.getElementById("info-aciertos").textContent = aciertos;
      document.getElementById("info-errores").textContent = errores;
    }

    comprobado = true;
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

  function mostrarResultadoFinal() {
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
