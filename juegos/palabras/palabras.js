document.addEventListener("DOMContentLoaded", () => {
  let idiomaSeleccionado = 0;
  let seleccionados = [];
  let actual = 0;

  let comprobado = false;
  let objetoActual = null;
  let palabraObjetivo = "";
  let resultadoCorrecto = false;

  let aciertos = 0;
  let errores = 0;
  let resumen = [];

  document.getElementById("salir-palabras").addEventListener("click", () => {
    location.href = "../../index.html";
  });

  function iniciarJuego() {
    idiomaSeleccionado = parseInt(document.getElementById("idioma").value);
    const cantidad = parseInt(document.getElementById("cantidad").value);

    seleccionados = [...elementos]
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidad);

    document.getElementById("modal").style.display = "none";
    document.getElementById("juego").style.display = "flex";

    mostrarImagen();
  }

  function mostrarImagen() {
    comprobado = false;
    resultadoCorrecto = false;

    objetoActual = seleccionados[actual];
    palabraObjetivo = objetoActual.palabras[idiomaSeleccionado].trim();

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

      inputsDiv.appendChild(input);
    }

    document.getElementById("btnSiguiente").disabled = true;
  }

  function comprobar() {
    const inputs = document.querySelectorAll("#inputs input");
    let resultado = "";

    inputs.forEach((input) => (resultado += input.value.toLowerCase()));

    const contenedor = document.querySelector(".imagen-contenedor");

    for (let i = 0; i < palabraObjetivo.length; i++) {
      inputs[i].style.backgroundColor =
        inputs[i].value.toLowerCase() === palabraObjetivo[i].toLowerCase()
          ? "#9f9"
          : "#f99";
    }

    resultadoCorrecto = resultado === palabraObjetivo.toLowerCase();

    contenedor.style.borderColor = resultadoCorrecto ? "green" : "red";
    document.getElementById("btnSiguiente").disabled = !resultadoCorrecto;

    comprobado = true;
  }

  function siguiente() {
    resumen.push({
      palabra: palabraObjetivo,
      correcta: resultadoCorrecto,
    });

    resultadoCorrecto ? aciertos++ : errores++;

    if (actual < seleccionados.length - 1) {
      actual++;
      mostrarImagen();
    } else {
      mostrarResultadoFinal();
    }
  }

  function mostrarResultadoFinal() {
    document.getElementById("juego").style.display = "none";

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

  window.iniciarJuego = iniciarJuego;
  window.comprobar = comprobar;
  window.siguiente = siguiente;
  window.reiniciarJuego = () => location.reload();
  window.salirJuego = () => (location.href = "../../index.html");
});
