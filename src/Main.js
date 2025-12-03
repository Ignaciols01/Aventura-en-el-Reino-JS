import { Jugador } from './clases/Jugador.js';
import { Enemigo, Jefe } from './clases/Enemigo.js';
import { obtenerCatalogoConDescuentoAleatorio, buscarProducto } from './modulos/Mercado.js';
import { combate } from './modulos/Batalla.js';
import { distinguirJugador } from './modulos/Ranking.js';
import { ESCENAS } from './constantes.js'; 
import confetti from 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/+esm';

const juego = {
    jugador: new Jugador("Operador CT", "img/personaje/ct-cs2.png"),
    catalogoActual: [],
    enemigos: [
        new Enemigo("Recluta T", "img/personaje/enemigos/enemigo_debil_1.png", 10, 50),
        new Enemigo("Sniper", "img/personaje/enemigos/enemigo_debil_2.png", 20, 80),
        new Enemigo("Mercenario", "img/personaje/enemigos/enemigo_medio.png", 30, 100),
        new Jefe("Líder Ghost", "img/personaje/enemigos/jefe_ghost.png", 45, 200, 1.5)
    ],
    indiceEnemigo: 0
};

function cambiarEscena(id) {
    document.querySelectorAll('.escena').forEach(e => e.classList.remove('activa'));
    
    const escena = document.getElementById(id);
    if(escena) escena.classList.add('activa');

    if (id === ESCENAS.MERCADO) {
        cargarMercado();
        actualizarInventarioVisual(); 
    } 
    if (id === ESCENAS.ESTADO) {
        actualizarStatsUI();
        actualizarInventarioVisual(); 
    }
    if (id === ESCENAS.BATALLA) {
        iniciarBatalla();
        actualizarInventarioVisual(); 
    } 
    if (id === ESCENAS.FINAL) {
        mostrarRanking();
        lanzarConfeti();
    }
}

function cargarMercado() {
    if (juego.catalogoActual.length === 0) {
        juego.catalogoActual = obtenerCatalogoConDescuentoAleatorio();
    }
    
    const contenedor = document.querySelector('#scene-2 .grid.cols-3');
    if (!contenedor) return;

    if (contenedor.children.length === 0) {
        juego.catalogoActual.forEach((prod) => {
            const article = document.createElement('article');
            article.className = 'item';
            article.innerHTML = `
                <div class="item-img">
                    <img src="${prod.imagen}" alt="${prod.nombre}">
                </div>
                <h3>${prod.nombre}</h3>
                <p class="desc">BONUS: +${prod.bonus}</p>
                <p class="precio">${prod.obtenerPrecioFormateado()}</p>
                <button class="boton-peque" onclick="toggleCart(this)">AÑADIR</button>
            `;
            contenedor.appendChild(article);
        });
    }
}

function actualizarInventarioVisual() {
    const barrasInventario = document.querySelectorAll('.inventario');

    barrasInventario.forEach(barra => {
        barra.innerHTML = ''; 

        juego.jugador.inventario.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'slot'; 
            
            const img = document.createElement('img');
            img.src = item.imagen;
            img.alt = item.nombre;
            
            slot.appendChild(img);
            barra.appendChild(slot);
        });
    });
}

window.toggleCart = function(btn) {
    const tarjeta = btn.closest('.item');
    const nombre = tarjeta.querySelector('h3').textContent;
    const prod = buscarProducto(juego.catalogoActual, nombre);

    if (!prod) return;

    tarjeta.classList.toggle('seleccionado');
    
    if (tarjeta.classList.contains('seleccionado')) {
        btn.textContent = "RETIRAR";
        juego.jugador.comprarObjeto(prod);
        
        const imgBox = tarjeta.querySelector('.item-img');
        if(imgBox) {
            imgBox.classList.add('animate-added');
            setTimeout(() => imgBox.classList.remove('animate-added'), 1000);
        }

    } else {
        btn.textContent = "AÑADIR";
        const index = juego.jugador.inventario.findIndex(p => p.nombre === prod.nombre);
        if (index > -1) {
            juego.jugador.inventario.splice(index, 1);
        }
    }

    actualizarInventarioVisual(); 
};

function actualizarStatsUI() {
    const j = juego.jugador;
    document.getElementById('final-atk').textContent = j.obtenerAtaqueTotal();
    document.getElementById('final-def').textContent = j.obtenerDefensaTotal();
    document.getElementById('final-hp').textContent = j.obtenerVidaTotal();
    document.getElementById('final-score').textContent = j.puntos;
}

function iniciarBatalla() {
    const enemigo = juego.enemigos[juego.indiceEnemigo];
    
    if (!enemigo) {
        cambiarEscena(ESCENAS.FINAL);
        return;
    }

    const imgEnemigo = document.querySelector('#img-enemigo');
    if(imgEnemigo) imgEnemigo.src = enemigo.imagen;

    const imgJugador = document.querySelector('.arena img[alt="Jugador"]');
    
    const reiniciarAnimacion = (elemento, claseAnimacion) => {
        if (elemento) {
            elemento.classList.remove(claseAnimacion); 
            void elemento.offsetWidth;
            elemento.classList.add(claseAnimacion);    
        }
    };

    reiniciarAnimacion(imgJugador, 'entrada-izquierda');
    reiniciarAnimacion(imgEnemigo, 'entrada-derecha');

    const resultado = combate(enemigo, juego.jugador);
    
    const titulo = document.getElementById('battle-msg');
    const desc = document.getElementById('battle-points');
    const btnNext = document.getElementById('btn-next-battle');

    if (resultado.victoria) {
        titulo.innerHTML = `GANADOR: <span class="texto-verde">${juego.jugador.nombre}</span>`;
        desc.textContent = `Puntos ganados: ${resultado.puntos}`;
        juego.jugador.sumarPuntos(resultado.puntos);
        juego.indiceEnemigo++;
        
        btnNext.style.display = 'inline-block';
        btnNext.textContent = "SIGUIENTE RONDA";
        btnNext.onclick = () => {
            if (juego.indiceEnemigo < juego.enemigos.length) {
                iniciarBatalla();
            } else {
                cambiarEscena(ESCENAS.FINAL);
            }
        };

    } else {
        titulo.innerHTML = `GANADOR: <span class="texto-acento" style="color:red">${enemigo.nombre}</span>`;
        desc.textContent = "Has sido eliminado.";
        btnNext.style.display = 'inline-block';
        btnNext.textContent = "REINICIAR";
        btnNext.onclick = () => location.reload();
    }
}

function mostrarRanking() {
    const rango = distinguirJugador(juego.jugador.puntos);
    const rankEl = document.getElementById('rank-final');
    const scoreEl = document.getElementById('score-final');
    
    if(rankEl) rankEl.textContent = rango;
    if(scoreEl) scoreEl.textContent = juego.jugador.puntos;
}

function lanzarConfeti() {
    const duracion = 3000;
    const animationEnd = Date.now() + duracion;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duracion);
        
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
    }, 250);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#scene-1 .boton').onclick = () => cambiarEscena(ESCENAS.MERCADO);
    document.querySelector('#scene-2 .boton').onclick = () => cambiarEscena(ESCENAS.ESTADO);
    document.querySelector('#scene-3 .boton').onclick = () => cambiarEscena(ESCENAS.ENEMIGOS);
    document.querySelector('#scene-4 .boton').onclick = () => cambiarEscena(ESCENAS.BATALLA);
    
    actualizarInventarioVisual();
});