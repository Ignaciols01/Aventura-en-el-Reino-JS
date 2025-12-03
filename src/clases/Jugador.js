import { Personaje } from './Personaje.js';

export class Jugador extends Personaje {
    constructor(nombre, imagen) {
        super(nombre, imagen, 100);
        this.puntos = 0;
        this.inventario = [];
    }

    comprarObjeto(producto) {
        const nuevoItem = { ...producto };
        this.inventario.push(nuevoItem);
    }

    sumarPuntos(puntos) {
        this.puntos += puntos;
    }

    obtenerAtaqueTotal() {
        let ataqueBase = 10;
        const bonus = this.inventario
            .filter(item => item.tipo === 'Arma')
            .reduce((total, item) => total + item.bonus, 0);
        return ataqueBase + bonus;
    }

    obtenerDefensaTotal() {
        let defensaBase = 0;
        const bonus = this.inventario
            .filter(item => item.tipo === 'Armadura')
            .reduce((total, item) => total + item.bonus, 0);
        return defensaBase + bonus;
    }

    obtenerVidaTotal() {
        const bonus = this.inventario
            .filter(item => item.tipo === 'Consumible')
            .reduce((total, item) => total + item.bonus, 0);
        return this.vidaMaxima + bonus;
    }
}