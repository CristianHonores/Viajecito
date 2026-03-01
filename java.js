/* ============================================================
   VIAJECITO — java.js
   Firebase Realtime Database + Carrito con panel lateral
   Usar con: <script type="module" src="java.js"></script>
   ============================================================ */

import { initializeApp }                    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, push }      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


/* ── 1. CONFIG FIREBASE ───────────────────────────────────── */
const firebaseConfig = {
    apiKey:            "AIzaSyBqQS90gihFdXfG_ONbLvrR6N1b2AnP0yk",
    authDomain:        "viajecitocr.firebaseapp.com",
    databaseURL:       "https://viajecitocr-default-rtdb.firebaseio.com",
    projectId:         "viajecitocr",
    storageBucket:     "viajecitocr.firebasestorage.app",
    messagingSenderId: "679414504729",
    appId:             "1:679414504729:web:77256abf8aa16755213988",
    measurementId:     "G-GDCFPECEQ4"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);
console.log("Firebase inicializado correctamente");


/* ── 2. DATOS LOCALES DE LOS TOURS ───────────────────────── */
/* Se usan como fallback. Si Firebase tiene los datos,
   se pueden sobreescribir en cargarProductosFirebase()     */
const toursDatos = [
    { id: "1", nombre: "La Bombonera",         precio: 45 },
    { id: "2", nombre: "Monumental",           precio: 40 },
    { id: "3", nombre: "Racing — El Cilindro", precio: 35 },
    { id: "4", nombre: "Independiente",        precio: 35 },
    { id: "5", nombre: "San Lorenzo",          precio: 35 }
];


/* ── 3. HELPERS LOCALSTORAGE ──────────────────────────────── */

function leerCarrito() {
    const datos = localStorage.getItem("carritoViajecito");
    if (datos === null) {
        return [];
    }
    return JSON.parse(datos);
}

function guardarCarrito(carrito) {
    const enJSON = JSON.stringify(carrito);
    localStorage.setItem("carritoViajecito", enJSON);
}


/* ── 4. LÓGICA DEL CARRITO ────────────────────────────────── */

function agregarAlCarrito(idTour) {
    const tourInfo = toursDatos.find(function(t) { return t.id === idTour; });
    if (!tourInfo) return;

    let carrito  = leerCarrito();
    const existe = carrito.find(function(item) { return item.id === idTour; });

    if (existe) {
        /* ya está: suma cantidad */
        carrito = carrito.map(function(item) {
            if (item.id === idTour) {
                return {
                    id:       item.id,
                    nombre:   item.nombre,
                    precio:   item.precio,
                    cantidad: item.cantidad + 1
                };
            }
            return item;
        });
    } else {
        /* nuevo item */
        carrito.push({
            id:       tourInfo.id,
            nombre:   tourInfo.nombre,
            precio:   tourInfo.precio,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    console.log("Agregado:", idTour, "| Carrito:", carrito);
    renderCarrito();
    marcarTarjeta(idTour, true);
    abrirPanel();
}

function quitarDelCarrito(idTour) {
    let carrito = leerCarrito();
    carrito     = carrito.filter(function(item) { return item.id !== idTour; });
    guardarCarrito(carrito);
    console.log("Quitado:", idTour, "| Carrito:", carrito);
    renderCarrito();
    marcarTarjeta(idTour, false);
}

function cambiarCantidad(idTour, delta) {
    let carrito = leerCarrito();

    carrito = carrito.map(function(item) {
        if (item.id === idTour) {
            return {
                id:       item.id,
                nombre:   item.nombre,
                precio:   item.precio,
                cantidad: item.cantidad + delta
            };
        }
        return item;
    });

    /* eliminar si llegó a 0 */
    carrito = carrito.filter(function(item) { return item.cantidad > 0; });

    guardarCarrito(carrito);
    renderCarrito();

    /* si se eliminó, desmarcar tarjeta */
    const aun = carrito.find(function(item) { return item.id === idTour; });
    if (!aun) {
        marcarTarjeta(idTour, false);
    }
}

function vaciarCarrito() {
    localStorage.removeItem("carritoViajecito");
    renderCarrito();
    for (let i = 0; i < toursDatos.length; i++) {
        marcarTarjeta(toursDatos[i].id, false);
    }
    console.log("Carrito vaciado");
}

function calcularTotal() {
    const carrito = leerCarrito();
    let total = 0;
    for (let i = 0; i < carrito.length; i++) {
        total = total + (carrito[i].precio * carrito[i].cantidad);
    }
    return total;
}


/* ── 5. RENDER DEL PANEL ──────────────────────────────────── */

function renderCarrito() {
    const carrito    = leerCarrito();
    const listaEl    = document.getElementById("lista-carrito");
    const contadorEl = document.getElementById("carrito-contador");
    const totalEl    = document.getElementById("carrito-total-monto");

    if (!listaEl) return;

    /* contador en nav */
    let totalItems = 0;
    for (let i = 0; i < carrito.length; i++) {
        totalItems = totalItems + carrito[i].cantidad;
    }
    if (contadorEl) {
        contadorEl.innerHTML     = totalItems;
        contadorEl.style.display = totalItems === 0 ? "none" : "inline-block";
    }

    /* lista vacía */
    if (carrito.length === 0) {
        listaEl.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío 🏟️</p>';
        if (totalEl) totalEl.innerHTML = "USD 0";
        return;
    }

    /* renderizar items */
    let html = "";
    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        html = html + `
            <div class="carrito-item" id="item-${item.id}">
                <div class="carrito-item-info">
                    <p class="carrito-item-nombre">${item.nombre}</p>
                    <p class="carrito-item-precio">USD ${item.precio} / persona</p>
                </div>
                <div class="carrito-item-cantidad">
                    <button onclick="window._cambiar('${item.id}', -1)">−</button>
                    <span>${item.cantidad}</span>
                    <button onclick="window._cambiar('${item.id}', 1)">+</button>
                </div>
                <button class="btn-eliminar-item" onclick="window._quitar('${item.id}')">✕</button>
            </div>
        `;
    }
    listaEl.innerHTML = html;

    /* total */
    if (totalEl) totalEl.innerHTML = "USD " + calcularTotal();
}

/* exponer al scope global para los onclick del innerHTML dinámico */
window._cambiar = cambiarCantidad;
window._quitar  = quitarDelCarrito;


/* ── 6. FEEDBACK VISUAL EN TARJETAS ──────────────────────── */

function marcarTarjeta(idTour, activo) {
    const tarjeta = document.querySelector(`.tour-card[data-id="${idTour}"]`);
    if (!tarjeta) return;
    if (activo) {
        tarjeta.classList.add("en-carrito");
    } else {
        tarjeta.classList.remove("en-carrito");
    }
}

function sincronizarTarjetas() {
    const carrito = leerCarrito();
    for (let i = 0; i < toursDatos.length; i++) {
        const enLista = carrito.find(function(item) { return item.id === toursDatos[i].id; });
        marcarTarjeta(toursDatos[i].id, !!enLista);
    }
}


/* ── 7. PANEL — ABRIR / CERRAR ────────────────────────────── */

function abrirPanel() {
    const panel   = document.getElementById("carrito-panel");
    const overlay = document.getElementById("carrito-overlay");
    if (panel)   panel.classList.add("abierto");
    if (overlay) overlay.classList.add("activo");
}

function cerrarPanel() {
    const panel   = document.getElementById("carrito-panel");
    const overlay = document.getElementById("carrito-overlay");
    if (panel)   panel.classList.remove("abierto");
    if (overlay) overlay.classList.remove("activo");
}


/* ── 8. FIREBASE — leer /productos ───────────────────────── */

function cargarProductosFirebase() {
    const productosRef = ref(db, "productos");

    get(productosRef)
        .then(function(snapshot) {
            if (snapshot.exists()) {
                console.log("Datos Firebase /productos:", snapshot.val());
                /* Si querés sobrescribir toursDatos con datos de Firebase:
                   const datos = snapshot.val();
                   // datos es un objeto — convertirlo a array con for...in
                */
            } else {
                console.log("No hay datos en /productos — usando datos locales");
            }
        })
        .catch(function(error) {
            console.error("Error al leer Firebase:", error);
        });
}


/* ── 9. FIREBASE — guardar reserva en /reservas ──────────── */

function guardarReservaFirebase(nombre, email, mensaje) {
    const carrito     = leerCarrito();
    const toursTexto  = carrito.map(function(item) {
        return item.nombre + " x" + item.cantidad;
    });

    const reserva = {
        nombre:  nombre,
        email:   email,
        mensaje: mensaje,
        tours:   toursTexto.join(", "),
        total:   "USD " + calcularTotal(),
        fecha:   new Date().toString()
    };

    const reservasRef = ref(db, "reservas");

    push(reservasRef, reserva)
        .then(function() {
            console.log("Reserva guardada en Firebase:", reserva);
            alert("¡Reserva enviada! Te contactamos pronto.");
            vaciarCarrito();
            cerrarPanel();
        })
        .catch(function(error) {
            console.error("Error al guardar reserva:", error);
            alert("Hubo un error. Intentá de nuevo.");
        });
}


/* ── 10. EVENTOS ──────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {

    /* ── delegación en la grilla (btn-add / btn-remove) ── */
    const tourGrid = document.querySelector(".tour-grid");

    if (tourGrid) {
        tourGrid.addEventListener("click", function(e) {
            const id = e.target.getAttribute("data-id");
            if (!id) return;

            e.stopPropagation();

            if (e.target.classList.contains("btn-add")) {
                agregarAlCarrito(id);
            }

            if (e.target.classList.contains("btn-remove")) {
                quitarDelCarrito(id);
            }
        });
    }

    /* ── botón 🛒 en el nav ── */
    const btnNav = document.getElementById("btn-nav-carrito");
    if (btnNav) {
        btnNav.addEventListener("click", function() {
            abrirPanel();
        });
    }

    /* ── cerrar panel ── */
    const btnCerrar = document.getElementById("btn-cerrar-carrito");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", function() {
            cerrarPanel();
        });
    }

    /* ── cerrar con overlay ── */
    const overlay = document.getElementById("carrito-overlay");
    if (overlay) {
        overlay.addEventListener("click", function() {
            cerrarPanel();
        });
    }

    /* ── vaciar carrito ── */
    const btnVaciar = document.getElementById("btn-vaciar");
    if (btnVaciar) {
        btnVaciar.addEventListener("click", function() {
            vaciarCarrito();
        });
    }

    /* ── botón reservar → scroll al form ── */
    const btnReservar = document.getElementById("btn-reservar");
    if (btnReservar) {
        btnReservar.addEventListener("click", function() {
            cerrarPanel();
            const contacto = document.getElementById("contacto");
            if (contacto) {
                contacto.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    /* ── formulario de contacto ── */
    const formulario = document.querySelector("form");
    if (formulario) {
        formulario.addEventListener("submit", function(e) {
            e.preventDefault();

            const nombreEl  = formulario.querySelector("[name='nombre']");
            const emailEl   = formulario.querySelector("[name='email']");
            const mensajeEl = formulario.querySelector("[name='mensaje']");

            const nombre  = nombreEl  ? nombreEl.value.trim()  : "";
            const email   = emailEl   ? emailEl.value.trim()   : "";
            let   mensaje = mensajeEl ? mensajeEl.value.trim()  : "";

            if (nombre === "" || email === "") {
                alert("Por favor completá nombre y correo.");
                return;
            }

            /* autocompletar mensaje con tours si está vacío */
            if (mensaje === "") {
                const carrito = leerCarrito();
                if (carrito.length > 0) {
                    const nombres = carrito.map(function(item) {
                        return item.nombre + " x" + item.cantidad;
                    });
                    mensaje = "Tours seleccionados: " + nombres.join(", ");
                    if (mensajeEl) mensajeEl.value = mensaje;
                }
            }

            guardarReservaFirebase(nombre, email, mensaje);
        });
    }

    /* ── inicializar ── */
    cargarProductosFirebase();
    renderCarrito();
    sincronizarTarjetas();

});
