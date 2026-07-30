/* js/ui.js */
"use strict";

/**
 * Muestra un modal con el título, cuerpo y botones especificados.
 * @param {string} titulo - Título del modal.
 * @param {string} cuerpoHTML - Contenido HTML para el cuerpo del modal.
 * @param {Array<Object>} acciones - Array de objetos {texto: string, accion: function} para los botones.
 */
function mostrarModal(titulo, cuerpoHTML, acciones) {
  var overlay = document.getElementById("overlayModal");
  var tituloModal = document.getElementById("tituloModal");
  var cuerpoModal = document.getElementById("cuerpoModal");
  var botonesModal = document.getElementById("botonesModal");

  tituloModal.textContent = titulo;
  cuerpoModal.innerHTML = cuerpoHTML;

  // Limpiar botones anteriores
  botonesModal.innerHTML = "";

  // Crear nuevos botones
  if (acciones && acciones.length > 0) {
    for (var i = 0; i < acciones.length; i++) {
      var boton = document.createElement("button");
      boton.textContent = acciones[i].texto;
      boton.classList.add("botonPrimario"); // O la clase que corresponda
      boton.addEventListener("click", acciones[i].accion);
      botonesModal.appendChild(boton);
    }
  }

  overlay.classList.remove("oculto");
}

/**
 * Oculta el modal.
 */
function ocultarModal() {
  document.getElementById("overlayModal").classList.add("oculto");
}

/**
 * Renderiza la lista de sugerencias de jugadores para el autocompletado.
 * @param {Array<Object>} jugadores - Lista de objetos de jugadores.
 * @param {Function} seleccionarCallback - Función a llamar cuando se selecciona un jugador.
 */
function renderizarSugerenciasUI(jugadores, seleccionarCallback) {
  var lista = document.getElementById("listaAutocompletado");
  lista.innerHTML = ""; // Limpiar sugerencias anteriores

  if (jugadores.length === 0) {
    lista.classList.add("oculto");
    return;
  }

  for (var i = 0; i < jugadores.length; i++) {
    var jugador = jugadores[i];
    var li = document.createElement("li");
    li.innerHTML =
      '<img src="' +
      jugador.photo +
      '" alt="' +
      jugador.name +
      '" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'https://placehold.co/30x30/cccccc/333333?text=?\';"> ' +
      jugador.name;
    li.dataset.jugador = JSON.stringify(jugador); // Guardar el objeto completo
    li.addEventListener(
      "click",
      (function (selectedPlayer) {
        return function () {
          seleccionarCallback(selectedPlayer);
        };
      })(jugador),
    );
    lista.appendChild(li);
  }
  lista.classList.remove("oculto");
}

/**
 * Actualiza el contador de tiempo en la UI.
 * @param {number} segundos - Segundos transcurridos.
 */
function actualizarUI_Temporizador(segundos) {
  var minutos = Math.floor(segundos / 60);
  var segundosRestantes = segundos % 60;
  var tiempoFormateado =
    (minutos < 10 ? "0" : "") +
    minutos +
    ":" +
    (segundosRestantes < 10 ? "0" : "") +
    segundosRestantes;
  document.getElementById("contadorTiempo").textContent = tiempoFormateado;
}

/**
 * Actualiza el contador de intentos en la UI.
 * @param {number} intentosRestantes - Número de intentos restantes.
 */
function actualizarUI_Intentos(intentosRestantes) {
  document.getElementById("contadorIntentos").textContent =
    intentosRestantes + "/" + CONFIG.MAX_INTENTOS;
}

/**
 * Renderiza una nueva fila de intento en el tablero de juego.
 * @param {Object} jugadorIntento - Objeto del jugador intentado.
 * @param {Object} resultadoComparacion - Objeto con los resultados de la comparación.
 */
function renderizarIntentoUI(jugadorIntento, resultadoComparacion) {
  var tablero = document.getElementById("tableroIntentos");
  var fila = document.createElement("div");
  fila.classList.add("filaIntento");
  fila.classList.add("animar-flip"); // Para la animación

  // Foto
  var celdaFoto = document.createElement("div");
  celdaFoto.classList.add("celdaAtributo", "foto");
  celdaFoto.innerHTML =
    '<img src="' +
    jugadorIntento.photo +
    '" alt="' +
    jugadorIntento.name +
    '" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'https://placehold.co/45x45/cccccc/333333?text=?\';">';
  fila.appendChild(celdaFoto);

  // Nombre
  var celdaNombre = document.createElement("div");
  celdaNombre.classList.add(
    "celdaAtributo",
    resultadoComparacion.nombre === "acierto"
      ? "estado-acierto"
      : "estado-fallo",
  );
  celdaNombre.textContent = jugadorIntento.name;
  fila.appendChild(celdaNombre);

  // Nacionalidad
  var celdaNacionalidad = document.createElement("div");
  celdaNacionalidad.classList.add(
    "celdaAtributo",
    resultadoComparacion.nacionalidad === "acierto"
      ? "estado-acierto"
      : "estado-fallo",
  );
  celdaNacionalidad.textContent = jugadorIntento.nationality;
  fila.appendChild(celdaNacionalidad);

  // Club
  var celdaClub = document.createElement("div");
  celdaClub.classList.add(
    "celdaAtributo",
    resultadoComparacion.club === "acierto" ? "estado-acierto" : "estado-fallo",
  );
  celdaClub.textContent = jugadorIntento.club;
  fila.appendChild(celdaClub);

  // Posición
  var celdaPosicion = document.createElement("div");
  celdaPosicion.classList.add(
    "celdaAtributo",
    resultadoComparacion.posicion === "acierto"
      ? "estado-acierto"
      : "estado-fallo",
  );
  celdaPosicion.textContent = jugadorIntento.position;
  fila.appendChild(celdaPosicion);

  // Edad
  var celdaEdad = document.createElement("div");
  celdaEdad.classList.add(
    "celdaAtributo",
    "estado-" + resultadoComparacion.edad,
  );
  celdaEdad.textContent = jugadorIntento.age;
  fila.appendChild(celdaEdad);

  // Overall
  var celdaOverall = document.createElement("div");
  celdaOverall.classList.add(
    "celdaAtributo",
    "estado-" + resultadoComparacion.overall,
  );
  celdaOverall.textContent = jugadorIntento.overall;
  fila.appendChild(celdaOverall);

  // Altura
  var celdaAltura = document.createElement("div");
  celdaAltura.classList.add(
    "celdaAtributo",
    "estado-" + resultadoComparacion.altura,
  );
  celdaAltura.textContent = jugadorIntento.heightCm + " cm";
  fila.appendChild(celdaAltura);

  tablero.prepend(fila); // Añadir al principio para que los más recientes estén arriba
}

/**
 * Actualiza el blur de la foto secreta en modo fácil.
 * @param {number} intentosRealizados - Cantidad de intentos realizados.
 */
function actualizarBlurFotoUI(intentosRealizados) {
  var imgFoto = document.getElementById("imgFotoSecreta");
  // El blur disminuye con cada intento. De 20px a 0px en MAX_INTENTOS intentos.
  var blurValue = Math.max(
    0,
    20 - intentosRealizados * (20 / CONFIG.MAX_INTENTOS),
  );
  imgFoto.style.filter = "blur(" + blurValue + "px)";
}

/**
 * Actualiza la lista de pistas extra en modo medio.
 * @param {Array<string>} pistasExtra - Array de strings con las pistas a mostrar.
 */
function actualizarPistasMedioUI(pistasExtra) {
  var listaPistas = document.getElementById("listaPistasAtributos");
  listaPistas.innerHTML = "";
  if (pistasExtra && pistasExtra.length > 0) {
    for (var i = 0; i < pistasExtra.length; i++) {
      var li = document.createElement("li");
      li.textContent = pistasExtra[i];
      listaPistas.appendChild(li);
    }
  }
}

/**
 * Renderiza la tabla de historial de partidas.
 * @param {Array<Object>} historial - Lista de partidas a mostrar.
 */
function renderizarTablaHistorialUI(historial) {
  var cuerpoTabla = document.getElementById("cuerpoTablaHistorial");
  cuerpoTabla.innerHTML = ""; // Limpiar filas anteriores

  for (var i = 0; i < historial.length; i++) {
    var registro = historial[i];
    var tr = document.createElement("tr");

    // Formatear duración a MM:SS
    var minutos = Math.floor(registro.duracion / 60);
    var segundos = registro.duracion % 60;
    var duracionFormateada =
      (minutos < 10 ? "0" : "") +
      minutos +
      ":" +
      (segundos < 10 ? "0" : "") +
      segundos;

    // Formatear fecha a DD/MM/YYYY HH:MM
    var fecha = new Date(registro.fecha);
    var fechaFormateada = fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    tr.innerHTML = `
            <td>${registro.jugadorHumano}</td>
            <td>${registro.secreto}</td>
            <td>${registro.resultado === "victoria" ? "Victoria" : "Derrota"}</td>
            <td>${registro.dificultad.charAt(0).toUpperCase() + registro.dificultad.slice(1)}</td>
            <td>${registro.intentos}</td>
            <td>${duracionFormateada}</td>
            <td>${registro.puntaje}</td>
            <td>${fechaFormateada}</td>
        `;
    cuerpoTabla.appendChild(tr);
  }
}

/**
 * Reproduce un sonido específico.
 * NOTA: Los elementos de audio deben estar presentes en el HTML para que esto funcione.
 * Se recomienda comentar las etiquetas <audio> en index.html si los archivos .mp3 no existen
 * para evitar errores 404 en consola.
 * @param {string} tipo - 'victoria', 'derrota', 'intento'.
 */
function reproducirSonido(tipo) {
  var audio;
  if (tipo === "victoria") {
    audio = document.getElementById("audioVictoria");
  } else if (tipo === "derrota") {
    audio = document.getElementById("audioDerrota");
  } else if (tipo === "intento") {
    audio = document.getElementById("audioIntento");
  }

  if (audio) {
    audio.play().catch(function (error) {
      console.warn("Error al reproducir sonido:", tipo, error);
    });
  }
}
