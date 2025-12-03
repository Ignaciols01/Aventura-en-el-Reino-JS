export class Producto {
    constructor(nombre, precio, rareza, tipo, bonus, imagen) {
        this.nombre = nombre;
        this.precio = precio;
        this.rareza = rareza;
        this.tipo = tipo;
        this.bonus = bonus;
        this.imagen = imagen;
    }

    obtenerPrecioFormateado() {
        return `${this.precio.toFixed(2)}€`;
    }

    aplicarDescuento(porcentaje) {
        const nuevoPrecio = this.precio - (this.precio * (porcentaje / 100));
        return new Producto(
            this.nombre,
            nuevoPrecio,
            this.rareza,
            this.tipo,
            this.bonus,
            this.imagen
        );
    }
}