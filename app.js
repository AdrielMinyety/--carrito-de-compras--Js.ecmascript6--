//================ Variables ===============

const carrito = document.querySelectorAll("div.carrito")[0];
const cliente = document.querySelectorAll("div.cliente")[0];
const mercado = document.querySelectorAll("div.mercado")[0];
const total = document.querySelectorAll("#total")[0];
const total2 = document.querySelectorAll("#total")[1];
const pagar = document.getElementById("pagar");
const notificacion = document.querySelectorAll(".notificacion")[0];
const recivo = document.getElementById("recivo");

//=============== EventListeners ===============

cargarEventListeners();

function cargarEventListeners(e) {
    mercado.addEventListener("click", articuloTomado);
    cliente.addEventListener("click", sacarDeCarrito);
    pagar.addEventListener("click", function () {
        let articulosDeCliente = obtenerProductoLocalStorage();
        if (articulosDeCliente.length == 0 ) {
            alert("Seleccione productos para comprar.");
        }else {
            varciarLocalStorage();
            alert("Gracias por su compra!!");
            location.reload();
        }
    });
    carrito.addEventListener("DOMSubtreeModified", calcularTotal, true);
}

//================= Functions ==============

// Toma el articulo
// take the article
function articuloTomado(e) {
    e.preventDefault();   

    let articulo;
    if ( e.target.classList.contains("llevar-articulo") ) {
        articulo = e.target.parentElement.parentElement;
        
        leerDatosDeArticulo(articulo);
    }
}


// toma los datos del articulo tomado
// take the article's data
function leerDatosDeArticulo(articulo) {
    const infoArticulo = {
        articulo: articulo.querySelector("p").textContent,
        precio: articulo.querySelector("span").textContent,
        id: articulo.querySelector("a").getAttribute("data-id"),
        cantidad: 1
    };
    
    ponerEnCarrito(infoArticulo);
}

// pone en el carrito el articulo
// put the article in the cart
function ponerEnCarrito(producto) {
    productosLS = obtenerProductoLocalStorage();
    productosLS.forEach(function (productoLS, index) {
        if (productoLS.articulo == producto.articulo) {
            // console.log("hay mas de uno");
            producto.cantidad = productoLS.cantidad + 1;
        }
    })

    let template = `
        <p class="font-weight-bold m-1" data-id="${producto.id}">
            <i class="quitar fas fa-minus-circle text-danger"></i> ${producto.articulo} <span class="precio text-info">${producto.precio}</span>
            <i class="fas fa-tag"></i>
        </p>
    `;

    notificar("success");
    guardarProductoLocalStorage(producto);
    carrito.innerHTML += template;
}

// saca articulos o vacía el carrito
// take out articles or empty it
function sacarDeCarrito(e) {
    e.preventDefault();

    let producto, productoId;
    if (e.target.classList.contains("quitar")) {
        producto = e.target.parentElement;
        productoId = producto.getAttribute("data-id");
        borrarProductoLocalStorage(productoId);

        producto.remove();
        notificar("deleted");
    }
    
    if( e.target.classList.contains("vaciar-carrito") ) {        
        carrito.innerHTML = "";
        varciarLocalStorage();
        notificar("deleted");
        total.textContent = "0.00$";
    }

    if (e.target.classList.contains("comprar-productos")) {
        crearFactura();
    }
}

// notifica si se ha agregado o sacado un articulo
// notify if it have added or took out an article
function notificar(tipo) {
    notificacion.classList.add(tipo);
    setTimeout(() => {
        notificacion.classList.remove(tipo);
    }, 800);
}

//guarda el articulo en el LocalStorage
//save the article in LocalStorage
function  guardarProductoLocalStorage(producto){
    let productosLS = obtenerProductoLocalStorage();
    
    productosLS.forEach(function(productoLS, index) {
        if (productoLS.id == producto.id) {
            productosLS.splice(index, 1);
        }
    });
    
    productosLS.push(producto);    
    localStorage.setItem("productos", JSON.stringify(productosLS));
}

//obtener datos del LocalStorage
//take LocalStorage's data
function obtenerProductoLocalStorage() {
    let productos;
    if (localStorage.getItem("productos") === null) {
        productos = [];
    }else {
        productos = JSON.parse( localStorage.getItem("productos") );
    }
    return productos;
}

//imprimir productos del LocalStorage
//Print articles from LocalStorage
imprimirProductorLocalStorage();

function imprimirProductorLocalStorage() {
    articulos = obtenerProductoLocalStorage();

    articulos.forEach(articulo => {
        if (articulo.cantidad !== 1) {
            for (let i = 0; i < articulo.cantidad; i++) {
                let template = `
                <p class="font-weight-bold m-1" data-id="${articulo.id}">
                <i class="quitar fas fa-minus-circle text-danger"></i> ${articulo.articulo} <span class="precio text-info">${articulo.precio}</span>
                <i class="fas fa-tag"></i>
                </p>
                `;
                
                carrito.innerHTML += template;             
            }
        }else {
            let template = `
            <p class="font-weight-bold m-1" data-id="${articulo.id}">
            <i class="quitar fas fa-minus-circle text-danger"></i> ${articulo.articulo} <span class="precio text-info">${articulo.precio}</span>
            <i class="fas fa-tag"></i>
            </p>
            `;
            
            carrito.innerHTML += template;
        }
    });
}

// crear Factura
// make ticket with all the articles
function crearFactura() {
    recivo.innerHTML = "";
    let articulos = obtenerProductoLocalStorage();
    calcularTotal(1);

    articulos.forEach(function (articulo) {
       let template = `
        <p class="font-weight-bold m-1">
            (${articulo.cantidad}) ${articulo.articulo} <span class="precio text-info">${articulo.precio}</span>
            <i class="fas fa-tag"></i>
        </p>
        `;
        recivo.innerHTML += template;
    });
}

// Borrar productos del LocalStorage
// delete articles from LocalStorage
function borrarProductoLocalStorage(producto) {
    let productosLS = obtenerProductoLocalStorage();

    productosLS.forEach(function(productoLS, index) {
        if (productoLS.id == producto ) {
            if (productoLS.cantidad !== 1) {
                productoLS.cantidad = productoLS.cantidad - 1;
            }else {
                productosLS.splice(index, 1);
            }
        }
    });

    localStorage.setItem("productos", JSON.stringify(productosLS));
}

// Vaciar LocalStorage
// empty LocalSorage
function varciarLocalStorage() {
    localStorage.clear();
}

// calcular total
// calculate total
function calcularTotal(pagar) {
    let precioTotal = 0;
    productos = obtenerProductoLocalStorage();

    productos.forEach(function (producto) {
        precio = Number( producto.precio.substring(0, producto.precio.length - 1) );
        precioTotal = precioTotal + precio;
    });

    if (pagar === 1) {
        total2.textContent = precioTotal.toFixed(2) + "$";
    } else{
        total.textContent = precioTotal.toFixed(2) + "$";
    }
}

