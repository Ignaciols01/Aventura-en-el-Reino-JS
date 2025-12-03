import { Jugador } from './clases/Jugador.js';
import { Enemigo, Jefe } from './clases/Enemigo.js';
import { obtenerCatalogoConDescuentoAleatorio, buscarProducto } from './modulos/Mercado.js';
import { combate } from './modulos/Batalla.js';
import { distinguirJugador } from './modulos/Ranking.js';
// Importante: Uso 'Constante.js' porque así se ve en tu captura de pantalla
import { ESCENAS } from './constantes.js'; 

// --- ESTADO DEL JUEGO ---
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

// --- NAVEGACIÓN ---
function cambiarEscena(id) {
    document.querySelectorAll('.escena').forEach(e => e.classList.remove('activa'));
    
    const escena = document.getElementById(id);
    if(escena) escena.classList.add('activa');

    // Hooks de lógica
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
    if (id === ESCENAS.FINAL) mostrarRanking();
}

// --- LÓGICA MERCADO ---
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

// --- ACTUALIZAR INVENTARIO (DINÁMICO E INFINITO) ---
function actualizarInventarioVisual() {
    const barrasInventario = document.querySelectorAll('.inventario');

    barrasInventario.forEach(barra => {
        // 1. Borramos todo el contenido anterior
        barra.innerHTML = ''; 

        // 2. Por cada objeto real, creamos un div nuevo
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

// --- INTERACCIÓN CARRITO (SIN LÍMITE) ---
window.toggleCart = function(btn) {
    const tarjeta = btn.closest('.item');
    const nombre = tarjeta.querySelector('h3').textContent;
    const prod = buscarProducto(juego.catalogoActual, nombre);

    if (!prod) return;

    tarjeta.classList.toggle('seleccionado');
    
    if (tarjeta.classList.contains('seleccionado')) {
        // --- COMPRAR ---
        btn.textContent = "RETIRAR";
        juego.jugador.comprarObjeto(prod);
        
        // Animación de la imagen del producto
        const imgBox = tarjeta.querySelector('.item-img');
        if(imgBox) {
            imgBox.classList.add('animate-added');
            setTimeout(() => imgBox.classList.remove('animate-added'), 1000);
        }

    } else {
        // --- RETIRAR ---
        btn.textContent = "AÑADIR";
        const index = juego.jugador.inventario.findIndex(p => p.nombre === prod.nombre);
        if (index > -1) {
            juego.jugador.inventario.splice(index, 1);
        }
    }

    // Actualizar la barra visual
    actualizarInventarioVisual(); 
};

// --- UI: ESTADÍSTICAS ---
function actualizarStatsUI() {
    const j = juego.jugador;
    document.getElementById('final-atk').textContent = j.obtenerAtaqueTotal();
    document.getElementById('final-def').textContent = j.obtenerDefensaTotal();
    document.getElementById('final-hp').textContent = j.obtenerVidaTotal();
    document.getElementById('final-score').textContent = j.puntos;
}

// --- LÓGICA DE BATALLA (CON ANIMACIONES) ---
function iniciarBatalla() {
    const enemigo = juego.enemigos[juego.indiceEnemigo];
    
    if (!enemigo) {
        cambiarEscena(ESCENAS.FINAL);
        return;
    }

    // 1. Poner imagen del enemigo
    const imgEnemigo = document.querySelector('#img-enemigo');
    if(imgEnemigo) imgEnemigo.src = enemigo.imagen;

    // 2. BUSCAR IMÁGENES PARA LA ANIMACIÓN
    // Nota: Asegúrate de que tu imagen del jugador en el HTML tenga alt="Jugador"
    const imgJugador = document.querySelector('.arena img[alt="Jugador"]');

    // 3. FUNCIÓN PARA REINICIAR ANIMACIÓN (Reflow)
    const reiniciarAnimacion = (elemento, claseAnimacion) => {
        if (elemento) {
            elemento.classList.remove(claseAnimacion); 
            void elemento.offsetWidth; // Truco del reflow
            elemento.classList.add(claseAnimacion);    
        }
    };

    // 4. LANZAR ANIMACIONES
    reiniciarAnimacion(imgJugador, 'entrada-izquierda');
    reiniciarAnimacion(imgEnemigo, 'entrada-derecha');

    // 5. LÓGICA MATEMÁTICA DEL COMBATE
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

// --- UI: FINAL ---
function mostrarRanking() {
    const rango = distinguirJugador(juego.jugador.puntos);
    const rankEl = document.getElementById('rank-final');
    const scoreEl = document.getElementById('score-final');
    
    if(rankEl) rankEl.textContent = rango;
    if(scoreEl) scoreEl.textContent = juego.jugador.puntos;
}

// --- ASIGNACIÓN DE EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#scene-1 .boton').onclick = () => cambiarEscena(ESCENAS.MERCADO);
    document.querySelector('#scene-2 .boton').onclick = () => cambiarEscena(ESCENAS.ESTADO);
    document.querySelector('#scene-3 .boton').onclick = () => cambiarEscena(ESCENAS.ENEMIGOS);
    document.querySelector('#scene-4 .boton').onclick = () => cambiarEscena(ESCENAS.BATALLA);
    
    actualizarInventarioVisual();
});