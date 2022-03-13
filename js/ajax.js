'use strict'

window.addEventListener('load', () =>{


/******* Parametros para la autorización de la API de Marvel *******/

// Marvel Developer Portal
    // https://developer.marvel.com
    
// Darse de alta para obtener las claves:
    // https://www.marvel.com/signin?referer=https%3A%2F%2Fdeveloper.marvel.com%2Faccount

var PRIV_KEY = "";      // Insertar la clave privada dentro de las comillas
var PUBLIC_KEY = "";    // Insertar la clave pública dentro de las comillas


var ts = new Date().getTime();
var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();

var params = "?ts=" + ts + "&apikey=" + PUBLIC_KEY + "&hash=" + hash;

var cookieExpira = new Date();
cookieExpira.setDate(cookieExpira.getDate() + 90);
cookieExpira = cookieExpira.toUTCString() ;

/************* Fin autorización de la API de Marvel *************/


/*********** Variables ***********/
var resultado = [];

// DIVS -> Slider con los thubmnails
var personajes_div = document.querySelector("#personajes_div");
var comics_div = document.querySelector("#comics_div");
var series_div = document.querySelector("#series_div");
var gustokoenak_div = document.querySelector("#gustokoenak_div");
var berriro_div = document.querySelector("#berriro_div");

// SLIDERS -> Apartado completo (incluye título)
var slider = document.querySelectorAll(".slider");
var slider_personajes = document.querySelector("#slider_personajes");
var slider_comics = document.querySelector("#slider_comics");
var slider_series = document.querySelector("#slider_series");
var slider_gustokoenak = document.querySelector("#slider_gustokoenak");
var slider_berriro = document.querySelector("#slider_berriro");

// Flechas de avance y retroceso por el slider
var prev = document.querySelectorAll(".prev");
var next = document.querySelectorAll(".next");

var thumbnails = document.querySelectorAll(".thumbnails");

var cabecera = document.querySelector("header");
var cabeceraTit = document.querySelector("header h1");

var hasi = document.querySelector(".hasi");
// var berriz = document.querySelector("#berriz");

// BANNER: mostrará información del elemento seleccionado
var banner = document.querySelector("#banner");
var img_banner = document.querySelector("#img_banner");
var info_banner = document.querySelector("#info_banner");


/***********************************/
/************* SLIDERS *************/
    /**** Carga inicial ****/
    cargaInicial();
    
    
        
/*************************************/
/************* FUNCIONES *************/

    //-- PETICIÓN de DATOS a la API ----
    function peticionDatos(url, id = null){
        if (id == null) {
            return fetch(url + params);
        } else {
            return fetch(url + params + "&id=" + id);
        }
        
    }

    /************* SLIDERS *************/
    /* FILTROS:
        -- "characters"
        -- "comics"
        -- "series"
    */
    function cargaInicial() {
        banner.style.display = "none";
        cabecera.style.display = "block";
        cabecera.style.backgroundImage = "url('https://i.pinimg.com/originals/4f/4d/da/4f4ddacf4ac20f9c6af4444779ed40e0.jpg')";
        cabecera.style.backgroundSize = "cover";
        cabeceraTit.style.display = "block";


        /* Personajes: carga inicial */
        sliderCrear("characters");
        // sliderCrear("characters", "comics", 1886);

        /* Comics: carga inicial */
        sliderCrear("comics");

        /* Comics: carga inicial */
        sliderCrear("series");


        /* Sliders COOKIES: de inicio se ocultan, presuponiendo que no tendrán elementos */
            /* Comics: carga inicial */
            slider_gustokoenak.style.display = "none";
            sliderCrearCookies("gustokoenak");

            /* Comics: carga inicial */
            slider_berriro.style.display = "none";
            sliderCrearCookies("ikusita");
    }


    /**************** CREAR SLIDERS ****************/

    // Crea los sliders GENERALES
        // Recibe como parametros:
            // tipo: tipo del slider a rellenar (obligatorio)
            // filtro (opcional): si se accede pinchando un elemento
            // ID (opcional): tendrá que aparecer si se filtra. es el ID del elemento pinchado, que condicionará el filtro
    function sliderCrear(tipo, filtro = false, id = null) {
          let url;
        if (!filtro) {
            url = 'https://gateway.marvel.com:443/v1/public/' + tipo;
        } else {
            url = 'https://gateway.marvel.com:443/v1/public/' + filtro + '/' + id + '/' + tipo;

            // Vaciar el div ANTES de PEDIR los datos
                // Si no se hace antes, se mantienen los datos anteriores mientras se espera la respuesta, y luego cambia de repente
                // Como el slider objeto del filtrado se oculta antes, parece que ya se tiene el resultado
            if (tipo == "characters") {
                personajes_div.innerHTML = "";
            } else if (tipo == "comics"){
                comics_div.innerHTML = "";
            } else if (tipo == "series"){
                series_div.innerHTML = "";
            }
        }

        // Solicitud de datos a la API
        peticionDatos(url)  // Llama a la funcion peticionDatos y le pasa como parámetro la URL a consultar 
        .then(function(data){
            return data.json();
        })
        .then(resultadosJSON => {    
            resultado = resultadosJSON.data.results;   
            pintaSlider(tipo, resultado);   // Envía el tipo de slider y los datos de la API a la función encargada de manejar los datos y pintarlos en pantalla
        });
    }



    // Crea los sliders de la información guardada en COOKIES
        // Recibe como parametros el NOMBRE de la COOKIE a utilizar
    function sliderCrearCookies(cookie) {
        let url;
        let tipo;
        let resultadosTodos = [];

        // ----- Consultar COOKIES ------
        // Separa todas las cookies y guarda en array
        var cookieArr = document.cookie.split(";"); 

        // Bucle por TODAS las COOKIES
        for(var i = 0; i < cookieArr.length; i++) {
            
            // Divide las cookies: nombre de la cookie por un lado; valor por otro lado (se guarda en array) 
            var cookiePair = cookieArr[i].split("=");

            // Elimina espacios y compara con el nombre de la cookie
            // Si la cookie tiene el nombre recibido como parámetro…
            if(cookiePair[0].trim() == cookie) {
                let jsonCookie = JSON.parse("["+cookiePair[1]+"]"); // …se convierte a JSON la cadena valor de la cookie

                // Mapeamos el JSON para recorrer los registros uno a uno
                jsonCookie.map(function(elemento, i){
                    tipo = elemento.tipo;
                    let id = elemento.id;
                    url = 'https://gateway.marvel.com:443/v1/public/' + tipo + '/' + id;

                    // Hace la consulta a la API de Marvel
                    peticionDatos(url)
                    .then(function(data){
                        return data.json();
                    })
                    .then(resultadosJSON => {    
                        resultado = resultadosJSON.data.results; 
                        resultadosTodos.push(resultado[0]); // Añade el resultado a l array con todos los elementos de la cookie
                    });
                });

                // setTimeout para que le dé tiempo a cargar los datos antes de enviarlos
                    // Si no, lo envía vacío
                setTimeout(function(){
                    pintaSlider(tipo, resultadosTodos, cookie);;
                }, 500)
            }
        }
    }


    //-- RELLENAR SLIDERS ----
        // Recibe como parámetros:
            // tipo (obligatorio): tipo del slider a rellenar 
            // datos (obligatorio): los datos recogidos de la API
            // cookie (opcional): si son datos de una cookie, recibe el NOMBRE de la cookie
    function pintaSlider(tipo, datos, cookie=null){
        let div;
        let slider;

        // En cada caso, guardará el div y el slider correspondiente en las variables que se usarán luego
        if (cookie != null) {   
            switch (cookie) {
                case "gustokoenak":
                    div = gustokoenak_div;
                    slider = slider_gustokoenak;
                    break;
    
                case "ikusita":
                    div = berriro_div;
                    slider = slider_berriro;
                    break;

                default:
                    break;
            } 

        } else {    // Si no procede de una cookie
            switch (tipo) {
                case "characters":
                    div = personajes_div;
                    slider = slider_personajes;
                    break;
    
                case "comics":
                    div = comics_div;
                    slider = slider_comics;
                    break;
            
                case "series":
                    div = series_div;
                    slider = slider_series;
                break;
    
                default:
                    break;
            } 

            
        }
        div.innerHTML = ""; // Vacía el slider de resultados anteriores
        slider.style.display = "block"; // Mostrar el bloque, que puede estar oculto

        if (datos.length == 0) {
            // Si no hay datos para ese apartado, mostrará un aviso
            let texto = "<div id='aviso_no_resultados'><h3>Ez dago emaitzik / No hay resultados</h3></div>";
            div.innerHTML = texto;
            if (cookie != null){
                // Si no hay datos en el apartado de una cookie, oculta el bloque completo
                slider.style.display = "none";
            }
        } else {
            // Si hay dato, los recorre y va creando los elementos que los contendrán
            datos.map(function(elemento, i){ 

                // Bloque <article>
                var articulo = document.createElement("article");
                articulo.className = tipo + "_article thumbnail_article";
                
                // Titulo <h3>
                let titulo = document.createElement('h3');
                let textoTitulo = elemento.name || elemento.title;
                titulo.innerHTML = textoTitulo;

                articulo.appendChild(titulo);

                // Imagen de fondo del artículo
                let bgurl = elemento.thumbnail.path + "." + elemento.thumbnail.extension;
                articulo.style.backgroundImage = "url("+bgurl+")";

                // --- Eventos al clicar articulo ----
                // Evento para modificar el contenido que se muestra en pantalla
                articulo.addEventListener("click", () => {
                    
                    // Llama a la función cambiarCabecera
                        // Eliminará la cabecerá y en su lugar mostrará el banner
                    cambiarCabecera(tipo, elemento.id, textoTitulo, bgurl, elemento.description);
                    
                    // En los apartados generales, se evitará crear el slider del tipo del elemento clicado
                    if (tipo != "characters") {
                        sliderCrear("characters", tipo, elemento.id);
                    }
                    if (tipo != "comics") {
                        sliderCrear("comics", tipo, elemento.id);
                    }
                    if (tipo != "series" && tipo != "comics") {
                        sliderCrear("series", tipo, elemento.id);
                    }

                    slider.style.display = "none"; // Oculta el slider del tipo del elemento clicado
                    
                    sliderCrearCookies("ikusita");
                    
                });

                // Evento para añadir elemento clicado a la cookie de elementos visitados
                articulo.addEventListener("click", () => {

                    // Cadena de texto con la información del elemento, tal como se guardará en la cookie
                    let infoCookie = '{"id": ' + elemento.id + ', "tipo": "' +  tipo + '"}';
                    
                    // ---- Obtener información de las cookies ----
                    // Separa todas las cookies y guarda en array
                    var cookieArr = document.cookie.split(";"); 

                    // Bucle por todas las cookies
                    for(var i = 0; i < cookieArr.length; i++) {
                        // Divide las cookies: nombre de la cookie por un lado; valor por otro lado (se guarda en array) 
                        var cookiePair = cookieArr[i].split("=");
                        // Elimina espacios y compara con el nombre de la cookie 
                        if("ikusita" == cookiePair[0].trim()) {
                            // Si el artículo pulsado ya se encuentra en la cookie (cookie incluye la ID)…
                            if (cookiePair[1].includes(elemento.id)) {  
                                infoCookie = "";    // Vacía cadena creada, para que no se incluya       
                                let nuevaInfo = []; // Objeto que guardará la cadena a incluir como valor de la cookie
                                
                                let jsonCookie = JSON.parse("["+cookiePair[1]+"]"); // Se convierte a JSON la cadena valor de la cookie

                                // Mapeamos el JSON para recorrer los registros uno a uno
                                jsonCookie.map(function(visto, i){
                                    // Si el registro de la cookie no es el que hemos pulsado…
                                    if (visto.id != id) {    
                                        nuevaInfo.push(visto);   // …lo metemos en el array
                                    } 
                                });

                                infoCookie = JSON.stringify(nuevaInfo); // Se convierte a cadena de texto el objeto con la información a guardar
                                infoCookie = infoCookie.slice(1);       // Eliminar el corchete de apertura
                                infoCookie = infoCookie.slice(0, -1);   // Eliminar el corchete de cierre

                            } else { // Si la la ID del artículo pulsado no se encuentra en la cookie
                                        // Simplemente añadirá la nueva cadena a la la existente

                                // Si hay más registros guardados en la cookie
                                if (cookiePair[1].trim().length > 0) {
                                    infoCookie += ", "; // Se le añade una coma para encadenar  
                                }
                                
                                // Añade el valor de la cookie antigua al string actual
                                infoCookie += decodeURIComponent(cookiePair[1]);
                            }
                        }
                    }
                    document.cookie = "ikusita=" + infoCookie + "; expires=" + cookieExpira;
                });

                // Añadir el articulo creado a su div correspondiente
                div.appendChild(articulo); 
                
            });
        }
        
    }

    // Funcion cambiarCabecera()
        // Oculta la cabecera principal y muestra el banner con la información del objeto pulsado
        // Recibe como parámetros:
            // Le pasa como parámetros:
                // tipo: apartado al que corresponde el elemento clicado
                // id del elemento que se clica
                // texto del título (así se evita tener que hacer una nueva consulta)
                // url de la imagen (así se evita tener que hacer una nueva consulta)
                // descripción del elemento (así se evita tener que hacer una nueva consulta)
    function cambiarCabecera(tipo, id, titulo, bgurl, descripcion){
        cabecera.style.display = "none";    // Oculta la cabecera
        banner.style.display = "block";     // Muestra el banner

        // URL de la consulta que se hará a la API
        let url = 'https://gateway.marvel.com:443/v1/public/' + tipo + '/' + id;

        // Establecer imagen del banner (url recibida como parámetro)
        img_banner.style.backgroundImage = "url('" + bgurl +"')";

        // Variables width y height: recoger info. de la ventana según la ofrecen diferentes navegadores
        const width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const height = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;

        // Comprobar si es formato 'landscape': no todos los navegadores aceptan (screen.orientation.type == "landscape-primary")
        if (width > height) { 
            banner.style.display = "flex"; // En formato horizontal será flex (en vertical, no)

            // Se crea una imagen igual que la que mostrará, pero no es ésta la que se mostrará
                // Se usa sólo para calcular las dimensiones que tiene que tener el div contenedor y que la imagen se siga viendo entera
                // La imagen se muestra como fondo del div para que se ponga como cover y siga un diseño responsive
                // Como el banner tendrá el mismo alto que la ventana del navegador, el ancho de la imagen irá en función del alto
            var imagen = document.createElement("img");
            imagen.setAttribute("src",  bgurl);
        
            var proporcionImagen = imagen.width / imagen.height;
            var anchoImagen = height * proporcionImagen;
            img_banner.style.width = anchoImagen + "px";
        }

        // Información (texto)
        if (descripcion === null) {
            descripcion = "";   // Para que no muestre el texto "null"
        }
        info_banner.innerHTML = "<h2>" + titulo + "</h2>"+
            "<p>"+ descripcion +"</p>";
        
        // Icono de favorito
        var imgFav = document.createElement("img");
        imgFav.setAttribute("src",  "../img/icons/fav-inact.png");

        // Si el artículo ya es favorito, mostrará un icono, y si no, otro
        var cookieArray = document.cookie.split(";");
        for(var i = 0; i < cookieArray.length; i++) {
            var cookiePair = cookieArray[i].split("=");
            if("gustokoenak" == cookiePair[0].trim()) {
                if (cookiePair[1].includes(id)) {
                    // Si ya es favorito   
                    imgFav.setAttribute("src",  "../img/icons/fav-act.png");
                } else {    
                    // Si no es favorito
                    imgFav.setAttribute("src",  "../img/icons/fav-inact.png");
                }
            }
        }
        
        // ---- Añadir evento click al icono de favorito ----
        imgFav.addEventListener("click", () => {
            
            // Cadena de texto con la información del elemento, tal como se guardará en la cookie
            let infoCookie = '{"id": ' + id + ', "tipo": "' +  tipo + '"}';

            var cookieArr = document.cookie.split(";"); // Separa todas las cookies y guarda en array

            // Bucle por todas las cookies
            for(var i = 0; i < cookieArr.length; i++) {
                // Divide las cookies: nombre de la cookie por un lado; valor por otro lado (se guarda en array) 
                var cookiePair = cookieArr[i].split("=");
                // Elimina espacios y compara con el nombre de la cookie 
                if("gustokoenak" == cookiePair[0].trim()) {
                    // Si la cookie incluye la ID del artículo pulsado
                    if (cookiePair[1].includes(id)) {  
                        infoCookie = "";    // Vacía cadena creada, para que no se incluya                
                        let nuevaInfo = []; // Objeto que guardará la cadena a incluir como valor de la cookie
                        
                        imgFav.setAttribute("src",  "../img/icons/fav-inact.png");   // El icono se cambia a inactivo
                        let jsonCookie = JSON.parse("["+cookiePair[1]+"]"); // Se convierte a JSON la cadena valor de la cookie


                        // Mapeamos el JSON para recorrer los registros uno a uno
                        jsonCookie.map(function(elemento, i){
                            // Si el registro de la cookie no es el que hemos pulsado…
                            if (elemento.id != id) {    
                                nuevaInfo.push(elemento);   // …lo metemos en el array
                            } 
                        });

                        infoCookie = JSON.stringify(nuevaInfo); // Se convierte a cadena de texto el objeto con la información a guardar
                        infoCookie = infoCookie.slice(1);       // Eliminar el corchete de apertura
                        infoCookie = infoCookie.slice(0, -1);   // Eliminar el corchete de cierre

                    } else { // Si la la ID del artículo pulsado no se encuentra en la cookie

                        // Si hay más registros guardados en la cookie
                        if (cookiePair[1].trim().length > 0) {
                            infoCookie += ", "; // Se le añade una coma para encadenar  
                        }
                        
                        imgFav.setAttribute("src",  "../img/icons/fav-act.png");    // Pone el icono activo

                        // Añade el valor de la cookie antigua al string actual
                        infoCookie += decodeURIComponent(cookiePair[1]);
                    }
 
                } else {
                    // Si la cookie "gustokoenak" no existe todavía, el icono cambia a activo
                    imgFav.setAttribute("src",  "../img/icons/fav-act.png");
                }
            }

            document.cookie = "gustokoenak=" + infoCookie + "; expires=" + cookieExpira;
              
            sliderCrearCookies("gustokoenak"); // Para que refresque el slider de favoritos
        });

        info_banner.appendChild(imgFav); // Añade el icono de favoritos a la zona de información del banner

        window.scrollTo({ top: 0, behavior: 'smooth' }); // Aquí para que no suba antes de que cambie el contenido
    }

/* Eventos */

    // Al pulsar un elemento asociado a la página de inicio, carga el contenido general (cargaInicial)
    hasi.addEventListener("click", () =>{
        cargaInicial();
    });


    // Botones de avance y retroceso de los sliders
    // Desplazan los sliders horizontalmente
    for (const i in slider) {
        next[i].addEventListener("click", () => {
            thumbnails[i].scrollBy(300, 0);
        })

        prev[i].addEventListener("click", () => {
            thumbnails[i].scrollBy(-300, 0);
        })
    }

});