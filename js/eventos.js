/* js/eventos.js */
"use strict";

// Variables para el control de la interfaz
var timeoutBusqueda = null;
var jugadorSeleccionadoActual = null;

/**
 * Inicializa todos los listeners según la página en la que estemos.
 */
function inicializarApp() {
  // 1. Aplicar el tema guardado
  var temaGuardado = obtenerPreferenciaTema();
  if (temaGuardado === "oscuro") {
    document.body.classList.add("tema-oscuro");
  }

  var botonTema = document.getElementById("botonTema");
  if (botonTema) {
    botonTema.addEventListener("click", alternarTema);
  }

  // 2. Listeners de la página de JUEGO (index.html)
  var botonComenzar = document.getElementById("botonComenzar");
  if (botonComenzar) {
    botonComenzar.addEventListener("click", iniciarPartida);
    document
      .getElementById("botonReiniciar")
      .addEventListener("click", reiniciarJuego);
    document
      .getElementById("inputBusqueda")
      .addEventListener("input", manejarBusqueda);
    document
      .getElementById("botonEnviarIntento")
      .addEventListener("click", procesarIntento);
  }

  // 3. Listeners de la página de CONTACTO (contacto.html)
  var formContacto = document.getElementById("formularioContacto");
  if (formContacto) {
    formContacto.addEventListener("submit", manejarEnvioContacto);
  }

  // 4. Listeners de la página de HISTORIAL (historial.html)
  var selectOrden = document.getElementById("selectOrdenHistorial");
  if (selectOrden) {
    cargarHistorialUI();
    selectOrden.addEventListener("change", manejarOrdenHistorial);
  }

  // 5. Cierre de Modales global
  var botonCerrarModal = document.getElementById("botonCerrarModal");
  if (botonCerrarModal) {
    botonCerrarModal.addEventListener("click", ocultarModal);
  }
}

// --- Funciones de Callback para Event Listeners ---

/** Callback para el .then() de obtenerJugadorSecreto */
function onJugadorSecretoObtenido(jugador) {
  estadoApp.jugadorSecreto = jugador;

  if (estadoApp.dificultad === "facil") {
    var imgFotoSecreta = document.getElementById("imgFotoSecreta");
    imgFotoSecreta.src = jugador.photo;
    // Fallback por si la imagen no carga
    imgFotoSecreta.onerror = function () {
      this.src = "https://placehold.co/120x120/cccccc/333333?text=Error";
    };
    actualizarBlurFotoUI(0);
  }

  // Habilitar buscador e iniciar reloj
  document.getElementById("inputBusqueda").disabled = false;
  iniciarTemporizador();
}

/** Callback para el .catch() de obtenerJugadorSecreto */
function onJugadorSecretoError() {
  mostrarModal("Error de Conexión", "No se pudo obtener el jugador secreto. Por favor, recargá la página.", []);
}

/**
 * Alterna entre modo claro y oscuro, y guarda la preferencia.
 */
function alternarTema() {
  var esOscuro = document.body.classList.toggle("tema-oscuro");
  guardarPreferenciaTema(esOscuro ? "oscuro" : "claro");
}

/**
 * Valida el nombre e inicia la partida.
 */
function iniciarPartida() {
  var inputNombre = document.getElementById("inputNombreJugador");
  var selectDificultad = document.getElementById("selectDificultad");
  var errorNombre = document.getElementById("errorNombreJugador");
  var nombre = inputNombre.value.trim();

  // Validación obligatoria: mínimo 3 letras
  if (nombre.length < 3) {
    errorNombre.classList.remove("oculto");
    return;
  }
  errorNombre.classList.add("oculto");

  // Configurar estado inicial
  estadoApp.nombreJugador = nombre;
  estadoApp.dificultad = selectDificultad.value;
  estadoApp.intentosRealizados = [];
  estadoApp.intentosRestantes = CONFIG.MAX_INTENTOS;
  estadoApp.segundosTranscurridos = 0;
  estadoApp.partidaActiva = true;

  // Cambiar pantallas
  document.getElementById("panelInicio").classList.add("oculto");
  document.getElementById("panelJuego").classList.remove("oculto");

  // Configurar UI de dificultad
  document.getElementById("indicadorDificultad").textContent =
    estadoApp.dificultad.toUpperCase();
  if (estadoApp.dificultad === "facil") {
    document.getElementById("contenedorFotoSecreta").classList.remove("oculto");
  } else if (estadoApp.dificultad === "medio") {
    document
      .getElementById("contenedorPistasAtributos")
      .classList.remove("oculto");
  }

  // Obtener jugador secreto desde el endpoint
  obtenerJugadorSecreto()
    .then(onJugadorSecretoObtenido).catch(onJugadorSecretoError);
}

/**
 * Maneja el reloj del juego.
 */
function iniciarTemporizador() {
  estadoApp.tiempoInicio = Date.now();
  actualizarUI_Temporizador(0);

  estadoApp.intervaloTemporizador = setInterval(actualizarReloj, 1000);
}

/**
 * Callback para setInterval que actualiza el reloj del juego.
 */
function actualizarReloj() {
  estadoApp.segundosTranscurridos = Math.floor((Date.now() - estadoApp.tiempoInicio) / 1000);
  actualizarUI_Temporizador(estadoApp.segundosTranscurridos);
}


/**
 * Maneja el input del buscador con técnica de "Debounce"
 */
function manejarBusqueda(evento) {
  if (!estadoApp.partidaActiva) return;

  var consulta = evento.target.value.trim();
  var botonEnviar = document.getElementById("botonEnviarIntento");

  jugadorSeleccionadoActual = null;
  botonEnviar.disabled = true;

  if (timeoutBusqueda) {
    clearTimeout(timeoutBusqueda);
  }

  // Si tiene menos de 2 caracteres, no buscamos (Requisito PDF)
  if (consulta.length < 2) {
    document.getElementById("listaAutocompletado").classList.add("oculto");
    return;
  }

  timeoutBusqueda = setTimeout(function () { ejecutarBusqueda(consulta); }, 300);
}

/** Ejecuta la búsqueda de jugadores y renderiza los resultados. */
function ejecutarBusqueda(consulta) {
  buscarJugadores(consulta)
    .then(onBusquedaExitosa)
    .catch(onBusquedaFallida);
}

/** Callback para el .then() de buscarJugadores. */
function onBusquedaExitosa(jugadores) {
  renderizarSugerenciasUI(jugadores, seleccionarJugadorBusqueda);
}

/**
 * Callback al hacer clic en un jugador de la lista de sugerencias.
 */
function seleccionarJugadorBusqueda(jugador) {
  jugadorSeleccionadoActual = jugador;
  document.getElementById("inputBusqueda").value = jugador.name;
  document.getElementById("listaAutocompletado").classList.add("oculto");
  document.getElementById("botonEnviarIntento").disabled = false;
}

/** Callback para el .catch() de buscarJugadores (falla silenciosa). */
function onBusquedaFallida() {
  document.getElementById("listaAutocompletado").classList.add("oculto");
}

/**
 * Lógica principal al hacer click en "Adivinar".
 */
function procesarIntento() {
  if (!estadoApp.partidaActiva || !jugadorSeleccionadoActual) return;

  if (yaSeUsoJugador(jugadorSeleccionadoActual.name)) {
    mostrarModal(
      "Atención",
      "Ya usaste a este jugador en la partida actual.",
      [],
    );
    return;
  }

  // Guardar intento
  estadoApp.intentosRealizados.push(jugadorSeleccionadoActual);
  estadoApp.intentosRestantes--;
  actualizarUI_Intentos(estadoApp.intentosRestantes);

  // Comparar y renderizar
  var resultadoComparacion = compararJugadores(
    jugadorSeleccionadoActual,
    estadoApp.jugadorSecreto,
  );
  renderizarIntentoUI(jugadorSeleccionadoActual, resultadoComparacion);

  // Limpiar buscador
  document.getElementById("inputBusqueda").value = "";
  document.getElementById("botonEnviarIntento").disabled = true;
  jugadorSeleccionadoActual = null;

  // Verificar si ganó
  if (resultadoComparacion.nombre === "acierto") {
    finalizarPartida(true);
    return;
  }

  // Verificar si perdió por quedarse sin intentos
  if (estadoApp.intentosRestantes === 0) {
    finalizarPartida(false);
    return;
  }

  // Si sigue jugando, actualizar pistas según dificultad
  if (estadoApp.dificultad === "facil") {
    actualizarBlurFotoUI(estadoApp.intentosRealizados.length);
  } else if (estadoApp.dificultad === "medio") {
    var pistasExtra = determinarPistasMedio(
      estadoApp.intentosRealizados.length,
      estadoApp.jugadorSecreto,
    );
    actualizarPistasMedioUI(pistasExtra);
  }
}

/**
 * Cierra la partida, calcula puntos y muestra modales.
 */
function finalizarPartida(gano) {
  estadoApp.partidaActiva = false;
  clearInterval(estadoApp.intervaloTemporizador);
  document.getElementById("inputBusqueda").disabled = true;

  var puntajeFinal = calcularPuntaje(
    gano,
    estadoApp.intentosRealizados.length,
    estadoApp.segundosTranscurridos,
    estadoApp.dificultad,
  );

  // Crear registro para historial
  var registro = {
    jugadorHumano: estadoApp.nombreJugador,
    secreto: estadoApp.jugadorSecreto.name,
    resultado: gano ? "victoria" : "derrota",
    dificultad: estadoApp.dificultad,
    intentos: estadoApp.intentosRealizados.length,
    duracion: estadoApp.segundosTranscurridos,
    puntaje: puntajeFinal,
    fecha: new Date().toISOString(),
  };
  guardarPartidaEnHistorial(registro);

  // Armar mensaje visual
  var tarjetaHTML =
    '<div class="tarjeta-jugador-modal">' +
    '<img id="imgModalJugadorSecreto" src="' +
    estadoApp.jugadorSecreto.photo +
    '" class="img-jugador-modal" referrerpolicy="no-referrer" alt="Foto de ' + estadoApp.jugadorSecreto.name + '">' +
    "<h3>" +
    estadoApp.jugadorSecreto.name +
    "</h3>" +
    "<p>" +
    estadoApp.jugadorSecreto.nationality +
    " - " +
    estadoApp.jugadorSecreto.club +
    "</p>" +
    "</div>";

  if (gano) {
    reproducirSonido("victoria");
    mostrarModal(
      "¡Victoria!",
      "Adivinaste en " +
        estadoApp.intentosRealizados.length +
        " intentos.<br>Sumaste: <strong>" +
        puntajeFinal +
        " pts</strong>." +
        tarjetaHTML,
      [{ texto: "Jugar de nuevo", accion: reiniciarJuego }],
    );
    // Asignar onerror después de mostrar el modal
    document.getElementById("imgModalJugadorSecreto").onerror = function() {
        this.onerror = null;
        this.src = 'https://placehold.co/100x100/cccccc/333333?text=?';
    };
    );
  } else {
    reproducirSonido("derrota");
    mostrarModal(
      "¡Derrota!",
      "Te quedaste sin intentos. El jugador era:" + tarjetaHTML,
      [{ texto: "Reintentar", accion: reiniciarJuego }],
    );
    // Asignar onerror después de mostrar el modal
    document.getElementById("imgModalJugadorSecreto").onerror = function() {
        this.onerror = null;
        this.src = 'https://placehold.co/100x100/cccccc/333333?text=?';
    };
  }
}

/**
 * Reinicia el estado del juego y la UI para una nueva partida sin recargar la página.
 */
function reiniciarJuego() {
  // 1. Ocultar modal si está abierto
  ocultarModal();

  // 2. Resetear estado de la aplicación
  estadoApp.nombreJugador = '';
  estadoApp.jugadorSecreto = null;
  estadoApp.intentosRealizados = [];
  estadoApp.intentosRestantes = CONFIG.MAX_INTENTOS;
  estadoApp.partidaActiva = false;
  estadoApp.segundosTranscurridos = 0;
  if (estadoApp.intervaloTemporizador) {
    clearInterval(estadoApp.intervaloTemporizador);
    estadoApp.intervaloTemporizador = null;
  }

  // 3. Resetear UI a la pantalla de inicio
  document.getElementById("panelJuego").classList.add("oculto");
  document.getElementById("panelInicio").classList.remove("oculto");

  // 4. Limpiar elementos de la partida anterior
  document.getElementById("inputNombreJugador").value = "";
  document.getElementById("tableroIntentos").innerHTML = "";
  document.getElementById("listaPistasAtributos").innerHTML = "";
  document.getElementById("contenedorFotoSecreta").classList.add("oculto");
  document.getElementById("contenedorPistasAtributos").classList.add("oculto");
  document.getElementById("inputBusqueda").value = "";
  document.getElementById("inputBusqueda").disabled = true;
  document.getElementById("botonEnviarIntento").disabled = true;
  actualizarUI_Intentos(CONFIG.MAX_INTENTOS);
  actualizarUI_Temporizador(0);
}

/**
 * Validaciones y lógica de la página de Contacto
 */
function manejarEnvioContacto(evento) {
  evento.preventDefault();

  var nombre = document.getElementById("inputContactoNombre").value.trim();
  var email = document.getElementById("inputContactoEmail").value.trim();
  var mensaje = document.getElementById("inputContactoMensaje").value.trim();

  var errorNombre = document.getElementById("errorContactoNombre");
  var errorEmail = document.getElementById("errorContactoEmail");
  var errorMensaje = document.getElementById("errorContactoMensaje");

  var valido = true;

  // Validación Nombre: Alfanumérico (Requisito PDF)
  var regexAlfanumerico = /^[a-zA-Z0-9\s]+$/;
  if (!regexAlfanumerico.test(nombre) || nombre.length === 0) {
    errorNombre.textContent =
      "Ingresá un nombre válido (solo letras y números).";
    errorNombre.classList.remove("oculto");
    valido = false;
  } else {
    errorNombre.classList.add("oculto");
  }

  // Validación Email
  var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    errorEmail.textContent = "Ingresá un correo electrónico válido.";
    errorEmail.classList.remove("oculto");
    valido = false;
  } else {
    errorEmail.classList.add("oculto");
  }

  // Validación Mensaje: > 5 caracteres (Requisito PDF)
  if (mensaje.length <= 5) {
    errorMensaje.textContent = "El mensaje debe tener más de 5 caracteres.";
    errorMensaje.classList.remove("oculto");
    valido = false;
  } else {
    errorMensaje.classList.add("oculto");
  }

  if (valido) {
    var accionesModal = [{ texto: "Entendido", accion: function() { enviarCorreoContacto(nombre, email, mensaje); } }];

    mostrarModal(
      "¡Validación exitosa!",
      "Formulario validado correctamente. Se abrirá tu cliente de correo.",
      accionesModal,
    );
  }
}

/**
 * Construye y abre el cliente de correo, y luego limpia el formulario.
 * @param {string} nombre 
 * @param {string} email 
 * @param {string} mensaje 
 */
function enviarCorreoContacto(nombre, email, mensaje) {
  var asunto = encodeURIComponent("Contacto desde Futbolle Pro - " + nombre);
  var cuerpo = encodeURIComponent("Nombre: " + nombre + "\nEmail: " + email + "\n\nMensaje:\n" + mensaje);
  var mailtoUrl = "mailto:profesor@uai.edu.ar?subject=" + asunto + "&body=" + cuerpo;

  window.location.href = mailtoUrl;

  ocultarModal();
  document.getElementById("formularioContacto").reset();
}

/**
 * Carga inicial de la tabla de historial y manejo de su orden
 */
function cargarHistorialUI() {
  var historial = obtenerHistorialGuardado();
  var contenedorTabla = document.getElementById("contenedorTablaHistorial");
  var controles = document.getElementById("controlesHistorial");
  var mensajeVacio = document.getElementById("mensajeSinHistorial");

  if (historial.length > 0) {
    contenedorTabla.classList.remove("oculto");
    controles.classList.remove("oculto");
    mensajeVacio.classList.add("oculto");

    var historialOrdenado = ordenarHistorial(historial, "fechaDesc");
    renderizarTablaHistorialUI(historialOrdenado);
  } else {
    contenedorTabla.classList.add("oculto");
    controles.classList.add("oculto");
    mensajeVacio.classList.remove("oculto");
  }
}

function manejarOrdenHistorial(evento) {
  var criterio = evento.target.value;
  var historial = obtenerHistorialGuardado();
  var historialOrdenado = ordenarHistorial(historial, criterio);
  renderizarTablaHistorialUI(historialOrdenado);
}

// Inicializar cuando el DOM esté listo
window.addEventListener("DOMContentLoaded", inicializarApp);
