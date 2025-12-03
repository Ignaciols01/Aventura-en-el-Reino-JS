import { Personaje } from './Personaje.js';

export class Enemigo extends Personaje {
    constructor(nombre, imagen, ataque, vida) {
        super(nombre, imagen, vida);
        this.ataque = ataque;
    }
}

export class Jefe extends Enemigo {
    constructor(nombre, imagen, ataque, vida, multiplicador = 1.2) {
        super(nombre, imagen, ataque, vida);
        this.multiplicador = multiplicador;
    }
}