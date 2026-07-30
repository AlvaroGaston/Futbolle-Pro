/* js/globales.js */
'use strict'; // Obligatorio por consigna

// Configuración general y constantes
var CONFIG = {
    // Endpoints provistos por la cátedra
    URL_RANDOM: 'https://futbolle-daw-uai-2026.onrender.com/api/players/random',
    URL_SEARCH: 'https://futbolle-daw-uai-2026.onrender.com/api/players/search',
    MAX_INTENTOS: 8,
    LIMITE_BUSQUEDA: 8,
    CLAVE_LOCALSTORAGE: 'futbolle_historial_pro',
    CLAVE_TEMA: 'futbolle_tema_pro'
};

// Objeto principal para manejar el estado de la aplicación
var estadoApp = {
    nombreJugador: '',
    jugadorSecreto: null,
    intentosRealizados: [], // Guardará los objetos de los jugadores intentados
    intentosRestantes: CONFIG.MAX_INTENTOS,
    partidaActiva: false,
    dificultad: 'facil', // Valores posibles: 'facil', 'medio', 'dificil'
    tiempoInicio: null,
    intervaloTemporizador: null,
    segundosTranscurridos: 0,
    pistasReveladas: [] // Atributos revelados en modo medio
};