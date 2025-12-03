export class Personaje {
    constructor(nombre, imagen, vida) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.vida = vida;
        this.vidaMaxima = vida;
    }

    estaVivo() {
        return this.vida > 0;
    }

    recibirDano(cantidad) {
        this.vida -= cantidad;
        if (this.vida < 0) this.vida = 0;
    }
}