import { PUNTOS_BASE_BATALLA } from '../constantes.js';

export function combate(enemigo, jugador) {
    let vidaJugador = jugador.obtenerVidaTotal();
    let defensaJugador = jugador.obtenerDefensaTotal();
    let ataqueJugador = jugador.obtenerAtaqueTotal();
    
    let vidaEnemigo = enemigo.vida;
    let ataqueEnemigo = enemigo.ataque;

    while (vidaJugador > 0 && vidaEnemigo > 0) {
        vidaEnemigo -= ataqueJugador;
        if (vidaEnemigo <= 0) break;

        let danoRecibido = Math.max(0, ataqueEnemigo - defensaJugador);
        vidaJugador -= danoRecibido;
    }

    const victoria = vidaJugador > 0;
    let puntosGanados = 0;

    if (victoria) {
        puntosGanados = PUNTOS_BASE_BATALLA + ataqueEnemigo;
        if (enemigo.multiplicador) {
            puntosGanados = puntosGanados * enemigo.multiplicador;
        }
    }

    return {
        victoria,
        puntos: Math.floor(puntosGanados),
        vidaRestante: vidaJugador
    };
}