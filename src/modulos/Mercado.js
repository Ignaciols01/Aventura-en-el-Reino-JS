import { Producto } from '../clases/Producto.js';

export const catalogoInicial = [
    new Producto("Chaleco Kevlar", 650, "Común", "Armadura", 50, "img/mercado/Kevlar-mercado.png"),
    new Producto("Defuse Kit", 400, "Común", "Armadura", 20, "img/mercado/Kit-mercado.png"), 
    new Producto("M4A4 Rifle", 3100, "Rara", "Arma", 80, "img/mercado/M4A4-mercado.png"),
    new Producto("AK-47", 2700, "Rara", "Arma", 90, "img/mercado/AK-47-mercado.png"),
    new Producto("Bayoneta M9", 5000, "Épica", "Arma", 120, "img/mercado/BayonetaM9-mercado.png"),
    new Producto("Granada HE", 300, "Común", "Arma", 30, "img/mercado/GranadaHE-mercado.png") 
];

export function buscarProducto(catalogo, nombre) {
    return catalogo.find(p => p.nombre.toUpperCase() === nombre.toUpperCase());
}

export function obtenerCatalogoConDescuentoAleatorio() {
    const rarezas = ["Común", "Rara", "Épica"];
    const rarezaElegida = rarezas[Math.floor(Math.random() * rarezas.length)];
    const porcentajeDescuento = 20;

    return catalogoInicial.map(prod => {
        if (prod.rareza === rarezaElegida) {
            return prod.aplicarDescuento(porcentajeDescuento);
        }
        return prod;
    });
}