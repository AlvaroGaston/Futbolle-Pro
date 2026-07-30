/* js/logica.js */
'use strict';

/**
 * Compara un número y devuelve si es acierto, mayor o menor.
 * @param {number} valorIntento 
 * @param {number} valorSecreto 
 * @returns {string} 'acierto', 'mayor' o 'menor'
 */
function compararNumero(valorIntento, valorSecreto) {
    if (valorIntento === valorSecreto) return 'acierto';
    return valorSecreto > valorIntento ? 'mayor' : 'menor';
}

/**
 * Compara los atributos del jugador intentado contra el secreto.
 * Retorna un objeto con el resultado de cada atributo como pide la cátedra.
 * @param {Object} intento 
 * @param {Object} secreto 
 * @returns {Object}
 */
function compararJugadores(intento, secreto) {
    return {
        nombre: intento.name === secreto.name ? 'acierto' : 'fallo',
        nacionalidad: intento.nationality === secreto.nationality ? 'acierto' : 'fallo',
        club: intento.club === secreto.club ? 'acierto' : 'fallo',
        posicion: intento.position === secreto.position ? 'acierto' : 'fallo',
        edad: compararNumero(intento.age, secreto.age),
        overall: compararNumero(intento.overall, secreto.overall),
        altura: compararNumero(intento.heightCm, secreto.heightCm)
    };
}

/**
 * Calcula el puntaje final basado en la dificultad, intentos y tiempo.
 * Fórmula provista en el PDF: puntaje = (puntos base) - (intentos - 1) * 10 + bonus.
 * @param {boolean} gano 
 * @param {number} intentosUsados 
 * @param {number} duracionSegundos 
 * @param {string} dificultad ('facil', 'medio', 'dificil')
 * @returns {number}
 */
function calcularPuntaje(gano, intentosUsados, duracionSegundos, dificultad) {
    if (!gano) return 0; // Si pierde, el puntaje es 0 (Requisito PDF)

    var puntosBase = 0;
    if (dificultad === 'facil') puntosBase = 60;
    else if (dificultad === 'medio') puntosBase = 80;
    else if (dificultad === 'dificil') puntosBase = 100;

    var descuentoIntentos = (intentosUsados - 1) * 10;
    
    var bonusTiempo = 0;
    if (duracionSegundos < 60) {
        bonusTiempo = 20;
    } else if (duracionSegundos < 120) {
        bonusTiempo = 10;
    }

    var puntajeFinal = puntosBase - descuentoIntentos + bonusTiempo;
    
    // Puntaje mínimo en victoria es 10 (Requisito PDF)
    return Math.max(puntajeFinal, 10);
}

/**
 * Verifica si un jugador ya fue intentado en la partida actual.
 * @param {string} nombreJugador 
 * @returns {boolean}
 */
function yaSeUsoJugador(nombreJugador) {
    for (var i = 0; i < estadoApp.intentosRealizados.length; i++) {
        if (estadoApp.intentosRealizados[i].name === nombreJugador) {
            return true;
        }
    }
    return false;
}

/**
 * Para el nivel Medio: determina qué pistas extra se revelan según los fallos.
 * @param {number} intentosFallidos 
 * @param {Object} secreto 
 * @returns {Array} Lista de strings con descripciones de pistas.
 */
function determinarPistasMedio(intentosFallidos, secreto) {
    var pistas = [];
    if (intentosFallidos >= 3) pistas.push('Liga/Club de origen: ' + secreto.club);
    if (intentosFallidos >= 5) pistas.push('Valoración General (GRL): ' + secreto.overall);
    if (intentosFallidos >= 7) pistas.push('Estatura exacta: ' + secreto.heightCm + ' cm');
    return pistas;
}