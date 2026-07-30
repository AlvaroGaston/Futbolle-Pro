/* js/api.js */
'use strict';

/**
 * Obtiene un jugador aleatorio del endpoint provisto por la cátedra.
 * @returns {Promise} Promesa que resuelve con el objeto del jugador.
 */
function obtenerJugadorSecreto() {
    return fetch(CONFIG.URL_RANDOM)
        .then(function(respuesta) {
            if (!respuesta.ok) {
                throw new Error('Error en el servidor al obtener jugador random.');
            }
            return respuesta.json();
        });
}

/**
 * Busca jugadores cuyo nombre coincida parcialmente.
 * Si la consulta tiene menos de 2 caracteres, el endpoint devuelve array vacío.
 * @param {string} consulta - El texto ingresado por el usuario.
 * @returns {Promise} Promesa que resuelve con un array de jugadores.
 */
function buscarJugadores(consulta) {
    var url = CONFIG.URL_SEARCH + '?q=' + encodeURIComponent(consulta) + '&limit=' + CONFIG.LIMITE_BUSQUEDA;
    
    return fetch(url)
        .then(function(respuesta) {
            if (!respuesta.ok) {
                throw new Error('Error al buscar jugadores.');
            }
            return respuesta.json();
        });
}