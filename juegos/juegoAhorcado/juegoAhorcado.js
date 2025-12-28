/* =========================
   JUEGO AHORCADO (namespaced)
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const palabraEl = document.getElementById("palabra");
    const letrasEl = document.getElementById("letras");
    const marcadorEl =
      document.getElementById("marcador-ahorcado") ||
      document.getElementById("marcador") ||
      null;

    if (!palabraEl || !letrasEl) {
      return;
    }

    // Array con los IDs de las partes del ahorcado SVG (10 partes)
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

    // Estado privado del módulo
    let ah_palabraSecreta;
    let ah_progreso;
    let ah_errores = 0;
    const ah_maxErrores = ah_partesSVG.length; // Ahora es 10 errores máximos
    let ah_usuario = "";
    let ah_puntos = 0;

    // ================================
    // NUEVAS FUNCIONES PARA LOCALSTORAGE
    // ================================

    // 1. Función para guardar en localStorage
    function ah_guardarRankingLocal() {
      if (!ah_usuario || ah_puntos <= 0) return false;

      try {
        // Obtener ranking actual de localStorage
        let ranking = JSON.parse(
          localStorage.getItem("rankingAhorcado") || "[]"
        );

        // Añadir nuevo registro
        const nuevoRegistro = {
          usuario: ah_usuario,
          puntos: ah_puntos,
          fecha: new Date().toLocaleString("es-ES"),
        };

        ranking.push(nuevoRegistro);

        // Ordenar por puntos (descendente)
        ranking.sort((a, b) => b.puntos - a.puntos);

        // Mantener solo top 20
        ranking = ranking.slice(0, 20);

        // Guardar en localStorage
        localStorage.setItem("rankingAhorcado", JSON.stringify(ranking));

        console.log("Puntuación guardada localmente:", nuevoRegistro);
        return true;
      } catch (error) {
        console.error("Error al guardar ranking:", error);
        return false;
      }
    }

    // 2. Función para mostrar ranking (exportada globalmente)
    /*window.mostrarRankingLocal = function () {
      try {
        const ranking = JSON.parse(
          localStorage.getItem("rankingAhorcado") || "[]"
        );

        if (ranking.length === 0) {
          mostrarModalInfo(
            "🏆 RANKING AHORCADO 🏆\n\nNo hay puntuaciones registradas aún.\n¡Sé el primero!"
          );
          return;
        }

        let mensaje = "🏆 RANKING AHORCADO 🏆\n\n";
        mensaje += "Posición | Usuario | Puntos | Fecha\n";
        mensaje += "-----------------------------------\n";

        ranking.forEach((item, index) => {
          mensaje += `${(index + 1)
            .toString()
            .padStart(2)}. ${item.usuario.padEnd(15)} ${item.puntos
            .toString()
            .padStart(4)} pts   ${item.fecha}\n`;
        });

        // Mostrar en alerta o puedes crear un modal bonito
        mostrarModalInfo(mensaje);
      } catch (error) {
        console.error("Error al mostrar ranking:", error);
        mostrarModalInfo(
          "Error al cargar el ranking. Asegúrate de que localStorage esté habilitado."
        );
      }
    };*/

    // 3. Función para guardar puntuación desde el botón
    window.guardarPuntuacionLocal = function () {
      if (ah_guardarRankingLocal()) {
        mostrarModalInfo(
          `¡Puntuación de ${ah_puntos} puntos guardada para ${ah_usuario}!`
        );
      } else {
        mostrarModalInfo("Error al guardar la puntuación");
      }
    };

    // 4. Función para exportar ranking a archivo JSON
    window.exportarRanking = function () {
      try {
        const ranking = JSON.parse(
          localStorage.getItem("rankingAhorcado") || "[]"
        );
        if (ranking.length === 0) {
          mostrarModalInfo("No hay datos para exportar.");
          return;
        }

        const dataStr = JSON.stringify(ranking, null, 2);
        const dataUri =
          "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute(
          "download",
          `ranking_ahorcado_${new Date().toISOString().split("T")[0]}.json`
        );
        linkElement.click();

        mostrarModalInfo("Ranking exportado correctamente como archivo JSON.");
      } catch (error) {
        console.error("Error al exportar:", error);
        mostrarModalInfo("Error al exportar el ranking.");
      }
    };

    // 5. Función para importar ranking desde archivo (opcional)
    window.importarRanking = function () {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
              localStorage.setItem(
                "rankingAhorcado",
                JSON.stringify(importedData)
              );
              mostrarModalInfo(
                `Ranking importado correctamente. ${importedData.length} registros cargados.`
              );
            } else {
              mostrarModalInfo(
                "Error: El archivo no contiene un array válido."
              );
            }
          } catch (error) {
            mostrarModalInfo("Error: Archivo JSON inválido.");
          }
        };
        reader.readAsText(file);
      };

      input.click();
    };

    // ================================
    // FUNCIONES
    // ================================

    function normalizarLetra(letra) {
      return letra
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    }

    // Iniciar juego
    window.iniciarAhorcado = function () {
      const inputUsuario = document.getElementById("usuario");
      if (!inputUsuario) {
        mostrarModalInfo("No se encontró el campo usuario.");
        return;
      }
      ah_usuario = inputUsuario.value.trim();
      // Limitar a 3-8 caracteres
      if (ah_usuario.length < 3 || ah_usuario.length > 12) {
        mostrarModalInfo(
          "Nombre inválido",
          "El nombre debe tener entre 3 y 12 caracteres."
        );
        return;
      }
      if (!ah_usuario) {
        mostrarModalInfo("Por favor ingresa un nombre de usuario");
        return;
      }
      const modalInicio = document.getElementById("modal-inicio");
      if (modalInicio) modalInicio.style.display = "none";
      ah_puntos = 0;
      ah_actualizarMarcador();
      ah_resetearSVG(); // Resetear el dibujo SVG
      ah_nuevaPalabra();
    };

    // Función para resetear el SVG (ocultar todas las partes)
    function ah_resetearSVG() {
      ah_partesSVG.forEach((parteId) => {
        const elemento = document.getElementById(parteId);
        if (elemento) {
          elemento.style.display = "none";
        }
      });
    }

    function ah_nuevaPalabra() {
      // 'palabras' debe venir de tu archivo palabras.js (array de strings)
      ah_palabraSecreta =
        palabras[Math.floor(Math.random() * palabras.length)].toUpperCase();
      ah_progreso = Array(ah_palabraSecreta.length).fill("_");
      ah_errores = 0;

      // En lugar de cambiar la imagen, resetear el SVG
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
          setTimeout(() => ah_nuevaPalabra(), 700);
        }
      } else {
        btn.style.background = "red";
        ah_errores++;
        ah_actualizarAhorcado();
      }
    }

    function ah_actualizarAhorcado() {
      // Mostrar la parte correspondiente del ahorcado
      if (ah_errores > 0 && ah_errores <= ah_partesSVG.length) {
        const parteId = ah_partesSVG[ah_errores - 1];
        const elemento = document.getElementById(parteId);
        if (elemento) {
          elemento.style.display = "block";
        }
      }

      if (ah_errores >= ah_maxErrores) {
        // Revelar palabra con las no adivinadas en rojo
        ah_revelarPalabra();
        // Mostrar modal final tras un pequeño retardo
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
        resultado.textContent = `${ah_usuario}, tu puntuación final es: ${ah_puntos} puntos`;
      }

      // Guardar automáticamente si la puntuación es buena (opcional)
      if (ah_puntos >= 3) {
        // Puedes guardar automáticamente o dejar que el usuario decida
        // ah_guardarRankingLocal();
      }
    }

    window.ah_reiniciarCompleto = function () {
      const modalFinal = document.getElementById("modal-final");
      if (modalFinal) modalFinal.style.display = "none";
      const modalInicio = document.getElementById("modal-inicio");
      if (modalInicio) modalInicio.style.display = "flex";
    };

    // Exportar la función reiniciarCompleto para el botón HTML
    window.reiniciarCompleto = function () {
      window.ah_reiniciarCompleto();
    };
  })();

  // Funciones modal del ranking
  window.mostrarModalInfo = function (titulo, mensaje) {
    document.getElementById("modal-info-titulo").textContent = titulo;
    document.getElementById("modal-info-texto").textContent = mensaje;
    document.getElementById("modal-info").style.display = "flex";
  };

  window.cerrarModalInfo = function () {
    document.getElementById("modal-info").style.display = "none";
  };
});
