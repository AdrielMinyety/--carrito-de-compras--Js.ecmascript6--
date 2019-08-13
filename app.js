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
    // delecta si han hecho clicks para ejecuta la función.
    // if is clicked the function is executed.
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
    // detecta si carrito (elementoHTML) es modificado para diparar función.
    // if carrito (htmlElement) is modified the function is fired.
    carrito.addEventListener("DOMSubtreeModified", calcularTotal, true);
}

//================= Functions ==============

// Toma el articulo.
// take the article.
function articuloTomado(e) {
    e.preventDefault();   

    let articulo;
    if ( e.target.classList.contains("llevar-articulo") ) {
        // toma el elementoHTML del articulo.
        // take the article's htmlElement.
        articulo = e.target.parentElement.parentElement;
        leerDatosDeArticulo(articulo);
    }
}

// toma los datos del articulo tomado.
// take the article's data.
function leerDatosDeArticulo(articulo) {
    // crea un objeto con los datos.
    // make an object with the data.
    const infoArticulo = {
        articulo: articulo.querySelector("p").textContent,
        precio: articulo.querySelector("span").textContent,
        id: articulo.querySelector("a").getAttribute("data-id"),
        cantidad: 1
    };
    
    ponerEnCarrito(infoArticulo);
}

// pone en el carrito el articulo.
// put the article in the cart.
function ponerEnCarrito(producto) {
    // crea un template con los datos.
    // make a template with the data.
    let template = `
        <p class="font-weight-bold m-1" data-id="${producto.id}">
            <i class="quitar fas fa-minus-circle text-danger"></i> ${producto.articulo} <span class="precio text-info">${producto.precio}</span>
            <i class="fas fa-tag"></i>
        </p>
    `;

    // notifa que ha sido agregado, guarda en LS y agrega al carrito.
    // notify that it has been added, save in LS and is added to carrito.
    notificar("success");
    guardarProductoLocalStorage(producto);
    carrito.innerHTML += template;
}

// saca articulos o vacía el carrito.
// take out articles or empty it.
function sacarDeCarrito(e) {
    e.preventDefault();

    let producto, productoId;
    // valida cual boton de cliente ha sido cliqueado.
    // detect wich one cliente's buttom has been clicked. 

    if (e.target.classList.contains("quitar")) {
        // toma el id del producto.
        // take the article's id
        producto = e.target.parentElement;
        productoId = producto.getAttribute("data-id");
        borrarProductoLocalStorage(productoId);
        // borra producto del carrito (del DOM).
        // delete the carrito's article (from the DOM). 
        producto.remove();
        notificar("deleted");
    }
    
    if( e.target.classList.contains("vaciar-carrito") ) {
        //limpia elementos del carrito y reinicia el precio total.
        //empty carrito's elements and reset the total price.  
        carrito.innerHTML = "";
        varciarLocalStorage();
        notificar("deleted");
        total.textContent = "0.00$";
    }

    if (e.target.classList.contains("comprar-productos")) {
        // crea factura.
        // make the receipt
        crearFactura();
    }
}

// notifica si se ha agregado o sacado un articulo
// notify if it have added or took out an article
function notificar(tipo) {
    // agrega clase de css (success or deleted) a notificacion (elementoHTMT).
    // add a css class (success or deleted) to notificacion (htmlElement).
    notificacion.classList.add(tipo);
    setTimeout(() => {
        notificacion.classList.remove(tipo);
    }, 800);
}

//guarda el articulo en el LocalStorage
//save the article in LocalStorage
function  guardarProductoLocalStorage(producto){
    // obtiene productos del LocalStorage.
    // get the articles from LocalStorage.
    let productosLS = obtenerProductoLocalStorage();
    // filtra los precios ("200$" = 200).
    // filer prices ("200$" = 200).
    producto.precio = Number( producto.precio.substring(0, producto.precio.length - 1) ); 

    productosLS.forEach(function (productoLS, index) {
        // verifica si el producto que se agregará ya ha sido agregado anteriormente.
        // verify if the article that is adding has been already added before.
        if (productoLS.articulo == producto.articulo) {
            // se actualiza datos (precio y cantidad) del producto.
            // update data (precio and cantidad "price and quantity") from producto.
            producto.precio = productoLS.precio + producto.precio;
            producto.cantidad = productoLS.cantidad + 1;
            // borra el elemento antiguo.
            // deletele the old elemento.
            productosLS.splice(index, 1);
        }
    })
    
    // si el elemtento (producto) es nuevo, se guarda en LS y si no lo es, se actualizan datos y se guardan los cambios en LS.
    // if the element (producto) is new, is saved in LS and if isn't, the data is updated and saved in LS.
    productosLS.push(producto);    
    localStorage.setItem("productos", JSON.stringify(productosLS));
}

//obtener datos del LocalStorage
//take LocalStorage's data
function obtenerProductoLocalStorage() {
    let productos;
    if (localStorage.getItem("productos") === null) {
        // si el LocalStorage no tiene elementos, retorna un array vacio.
        // if LocalStorage hasn't elements, return a empty array. 
        productos = [];
    }else {
        // retorna un array con los productos.
        // return an array with the articles.
        productos = JSON.parse( localStorage.getItem("productos") );
    }

    // retorna productos (array), vacíos o no.
    // return productos (array), empty or not.
    return productos;
}

//imprimir productos del LocalStorage
//Print articles from LocalStorage
imprimirProductorLocalStorage();

function imprimirProductorLocalStorage() {
    articulos = obtenerProductoLocalStorage();
    // verifica si el articulo a imprimir tiene más de 1 en cantidad.
    // verify if the article to print has more than 1 in cantidad.
    articulos.forEach(articulo => {
        if (articulo.cantidad !== 1) {
            // imprime el producto las veces que tenga en "cantidad".
            // print the article as much as "cantidad" has.
            for (let i = 0; i < articulo.cantidad; i++) {
                let template = `
                <p class="font-weight-bold m-1" data-id="${articulo.id}">
                <i class="quitar fas fa-minus-circle text-danger"></i> ${articulo.articulo} <span class="precio text-info">${parseFloat(articulo.precio/articulo.cantidad).toFixed(2)}$</span>
                <i class="fas fa-tag"></i>
                </p>
                `;
                
                carrito.innerHTML += template;             
            }
        }else {
            // añada nuevo producto.
            // add new article.
            let template = `
            <p class="font-weight-bold m-1" data-id="${articulo.id}">
            <i class="quitar fas fa-minus-circle text-danger"></i> ${articulo.articulo} <span class="precio text-info">${articulo.precio}$</span>
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
    // imprime todos los productos en el elemento (recivo) e imprime el precio total.
    // print all the articles in the element (recivo) and print the total price.
    recivo.innerHTML = "";
    let articulos = obtenerProductoLocalStorage();
    calcularTotal(1);

    articulos.forEach(function (articulo) {
       let template = `
        <div class="font-weight-bold m-1">
            <p class="m-0">                
                (${articulo.cantidad}) ${articulo.articulo} <span class="precio text-info">${parseFloat(articulo.precio).toFixed(2)}$</span>
                <i class="fas fa-tag"></i>
            </p>
            <span class="font-weight-light">($ por unidad: ${parseFloat(articulo.precio/articulo.cantidad).toFixed(2)})</span>
        </div>
        `;
        recivo.innerHTML += template;
    });
}

// Borrar productos del LocalStorage
// delete articles from LocalStorage
function borrarProductoLocalStorage(producto) {
    let productosLS = obtenerProductoLocalStorage();
    // verifica si el articulo a borrar está en el LocalStorage.
    // verify if the article to delete is in LocalStorage.
    productosLS.forEach(function(productoLS, index) {
        if (productoLS.id == producto ) {
            if (productoLS.cantidad !== 1) {
                // actualiza datos (cantidad y precio) del producto.
                // update data (cantidad and precio "quantity and price") from producto.
                productoLS.precio = productoLS.precio - (productoLS.precio/productoLS.cantidad);
                productoLS.cantidad = productoLS.cantidad - 1;
            }else {
                // borra producto.
                // delete article.
                productosLS.splice(index, 1);
            }
        }
    });

    // guarda en LocalStorage la actualización.
    // save in LocalStorage the Update.
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

    // calcula el precio total.
    // the total price is calculated.
    productos.forEach(function (producto) {
        precio = Number( producto.precio );
        precioTotal = precioTotal + precio;
    });

    // verifica en cual elemento (del DOM) se imprime.
    // verify wich one element (from DOM) is going to print.
    if (pagar === 1) {
        total2.textContent = precioTotal.toFixed(2) + "$";
    } else{
        total.textContent = precioTotal.toFixed(2) + "$";
    }
}