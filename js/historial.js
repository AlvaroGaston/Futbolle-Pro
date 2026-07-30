/* js/historial.js */
'use strict';

/**
 * Obtiene las partidas guardadas en el LocalStorage.
 * @returns {Array} Lista de partidas guardadas o array vacío si no hay datos.
 */
function obtenerHistorialGuardado() {
    var datos = localStorage.getItem(CONFIG.CLAVE_LOCALSTORAGE);
    if (!datos) {
        return [];
    }
    try {
        return JSON.parse(datos);
    } catch (error) {
        console.error('Error al leer el LocalStorage:', error);
        return [];
    }
}

/**
 * Guarda una nueva partida en el historial del LocalStorage.
 * Limita el historial a las últimas 25 partidas para optimizar almacenamiento.
 * @param {Object} registroPartida 
 */
function guardarPartidaEnHistorial(registroPartida) {
    var historial = obtenerHistorialGuardado();
    
    // Insertamos la nueva partida al principio de la lista (más reciente)
    historial.unshift(registroPartida);
    
    // Limitamos el máximo de partidas almacenadas
    if (historial.length > 25) {
        historial.length = 25;
    }
    
    try {
        localStorage.setItem(CONFIG.CLAVE_LOCALSTORAGE, JSON.stringify(historial));
    } catch (error) {
        console.error('Error al guardar la partida en LocalStorage:', error);
    }
}

/**
 * Ordena la lista de partidas del historial según el criterio seleccionado.
 * Cumple con la exigencia de permitir ordenar por fecha, intentos o puntaje.
 * @param {Array} historial - Lista de partidas
 * @param {string} criterio - 'fechaDesc', 'fechaAsc', 'intentosAsc', 'puntajeDesc'
 * @returns {Array} Lista ordenada
 */
function ordenarHistorial(historial, criterio) {
    var copiaHistorial = historial.slice(); // Copia superficial en ES5

    copiaHistorial.sort(function(a, b) {
        if (criterio === 'fechaDesc') {
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        }
        if (criterio === 'fechaAsc') {
            return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        }
        if (criterio === 'intentosAsc') {
            return a.intentos - b.intentos;
        }
        if (criterio === 'puntajeDesc') {
            return b.puntaje - a.puntaje;
        }
        return 0;
    });

    return copiaHistorial;
}

/**
 * Persiste la preferencia del tema visual (claro/oscuro).
 * @param {string} tema - 'claro' u 'oscuro'
 */
function guardarPreferenciaTema(tema) {
    try {
        localStorage.setItem(CONFIG.CLAVE_TEMA, tema);
    } catch (error) {
        console.error('Error al guardar el tema:', error);
    }
}

/**
 * Recupera la preferencia del tema visual guardada.
 * @returns {string} 'oscuro' o 'claro' (por defecto 'claro')
 */
function obtenerPreferenciaTema() {
    return localStorage.getItem(CONFIG.CLAVE_TEMA) || 'claro';
}