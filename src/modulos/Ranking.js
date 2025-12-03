import { UMBRAL_VETERANO } from '../constantes.js';

export function distinguirJugador(puntuacion, umbral = UMBRAL_VETERANO) {
    return puntuacion >= umbral ? "VETERANO" : "NOVATO";
}