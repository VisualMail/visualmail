// Constantes requeridas para dibujar el mapa del diálogo 
var totalHeight = 580;
var totalWidth = 1328;
var circleHeight = 100;
var circleWidth = 90;
var circleRadio = 12;
var lineHeight = 102;
//var $listaMensajes = [];
// Variable para manejar los mensajes anclados 
var $anclar = false;


/**
* @method :: mapaDialogoDibujar 
* @description :: Se encarga de dibujar el mapa del diálogo 
* @param :: {Object} nodoMensaje, la lista de los mensajes del proyecto 
**/
function mapaDialogoDibujar(nodoMensaje) { 
	// Iniciar el 'div' que contiene el mapa del diálogo 
	$("#main").html(""); 

	// Añadir al 'div' el objeto 'svg' que contiene el mapa del diálogo 
	var svgContainer = d3.select("#main").append("svg").attr("style", "background-color: #fff;"); 

	// Establecer una variable auxiliar para verificar si la sesión del mensaje cambia 
	// en cada iteración en la lista de mensajes 
	var sessionIdAux = -1; 

	// Establecer una variable para almacenar el índice de la imagen cada vez que cambie la sesión 
	// en cada iteración en la lista de mensajes 
	var imageI = 0; 

	// Iniciar una lista para almacenar la información de los nodos 
	var listaNodos = []; 

	// Iniciar la iteración para buscar cada mensaje 
	$.each(nodoMensaje, function(k, v) {
		// Si la sesión ha cambiado 
		if(sessionIdAux !== v.sessionId) {
			// Alamcenar la nueva sesión en la variable auxiliar 
			sessionIdAux = v.sessionId;

			// Dibujar la línea del diálogo 
			mapaDialogoDibujarSesion(imageI, v.usuario.imgurl, v.usuario.initials, v.sessionId, svgContainer); 

			// Incrementar el índice de la imagen que se dibuja en cada sesión 
			imageI++;
		}

		// Establecer la altura tanto del nodo como de la línea que interconecta el nodo con el padre 
		var y2 = circleHeight + (v.nodoNivel * 40); 

		// Si no es el nodo inicial 
		if(v.sessionId > 0) { 
			// Dibujar la línea que interconecta el hijo con el padre 
			mapaDialogoDibujarLinea(svgContainer, v); 

			// Si la altura establecida es mayor al tamaño total del mapa del diálogo 
			// actualizar la altura del mapa 
			if(y2 > totalHeight) 
				totalHeight = y2 + 80; 

			// Verificar en que posición se encuentra el nodo 
			// Si es mayor al ancho del mapa, actualizar el ancho del mapa 
			if((circleWidth + (v.sessionId * 100) + 200) > totalWidth) 
				totalWidth = circleWidth + (v.sessionId * 100) + 200; 
		}

		// Establecer los datos para dibujar el nodo que representa al mensaje 
		listaNodos.push({ 
			nodoId: v.nodoId, 
			sessionId: v.sessionId, 
			nodoPadreId: v.nodoPadreId, 
			nodoPadreNivel: v.nodoPadreNivel, 
			nodoNivel: v.nodoNivel, 
			color: v.usuario.color, 
			cx: circleWidth + (v.sessionId * 100), 
			cy: y2, 
			name: v.name, 
			tipo: v.tipo 
		});
	}); 

	// Se dibujan los nodos aparte para que la línea del camino 
	// no se despliege por encima del nodo 
	$.each(listaNodos, function(key, value) { 
		mapaDialogoDibujarNodo(svgContainer, value); 
	}); 

	// Actualizar el alto y el ancho del mapa 
	d3.select("#main").select("svg")
		.attr("height", totalHeight)
		.attr("width", totalWidth); 

	// Iniciar los tooltips de los nodos del mapa 
	$(".tooltipped").tooltip({ delay: 50 }); 
} 

/**
* @method :: mapaDialogoAgregarNodo 
* @description :: Se encarga de dibujar la sesión del diálogo 
* @param :: {Object} mensaje, contiene la información del nodo que representa al mensaje 
**/
function mapaDialogoAgregarNodo(mensaje) {
	// Seleccionar el objeto SVG 
	var svgContainer = d3.select("#main svg"); 

	// Verificar si existe la línea que representa a la sesión en la que se encuentra el mensaje 
	// Si no existe, dibujar la sesión 
	if(!$("[data-header-session-id='" + mensaje.sessionId + "']").length) 
		mapaDialogoDibujarSesion(mensaje.sessionId, mensaje.usuario.imgurl, mensaje.usuario.initials, mensaje.sessionId, svgContainer); 

	// Establecer la altura del nodo 
	var y2 = circleHeight + (mensaje.nodoNivel * 40); 

	// Iniciar los datos del nodo 
	var data = { 
		nodoId: mensaje.nodoId, 
		sessionId: mensaje.sessionId, 
		nodoPadreId: mensaje.nodoPadreId, 
		nodoPadreNivel: mensaje.nodoPadreNivel, 
		nodoNivel: mensaje.nodoNivel, 
		color: mensaje.usuario.color, 
		cx: circleWidth + (mensaje.sessionId * 100), 
		cy: y2, 
		name: mensaje.name, 
		tipo: mensaje.tipo 
	}; 

	// Dibular la línea que interconecta al nuevo nodo con el padre 
	mapaDialogoDibujarLinea(svgContainer, mensaje); 

	// Dibujar el nuevo nodo 
	mapaDialogoDibujarNodo(svgContainer, data); 

	// Iniciar los tooltips de los nodos del mapa 
	$(".tooltipped").tooltip({ delay: 50 }); 
}

/**
* @method :: mapaDialogoDibujarLinea 
* @description :: Se encarga de dibujar la línea que interconecta al nodo hijo con el padre 
* @param :: {Object} svgContainer, objeto svg que contiene el mapa del diálogo
* @param :: {Object} data, contiene la información del nodo que representa al mensaje 
**/
function mapaDialogoDibujarLinea(svgContainer, data) { 
	// Establecer el punto inicial de la línea en el eje X 
	var x1 = lineHeight + (100 * data.nodoPadreSessionId); 

	// Establecer el punto final de la línea en el eje X 
	var x2 = lineHeight + 76 + (100 * (data.sessionId - 1)); 

	// Establecer el punto inicial de la línea en el eje Y 
	var y1 = circleHeight + (data.nodoPadreNivel * 40); 

	// Establecer el punto final de la línea en el eje Y 
	var y2 = circleHeight + (data.nodoNivel * 40); 

	// Si el punto inicial y final en el eje Y son iguales 
	if(y1 === y2) { 
		// Dibujar una línea 
		svgContainer.append("line")
			.attr("data-line-navigate", "")
			.attr("data-line-nodo-id", data.nodoId)
			.attr("x1", x1)
			.attr("y1", y1)
			.attr("x2", x2)
			.attr("y2", y2)
			.attr("stroke", "#797979")
			.attr("stroke-width", "1");
	} else { 
		// Dibujar un camino 
		var d = "M " + x1 + " " + y1 + " L " + parseInt(x1 + 50) + " " + y2 + " L " + x2 + " " + y2; 
		svgContainer.append("path").attr("d", d)
			.attr("data-line-navigate", "")
			.attr("data-line-nodo-id", data.nodoId)
			.attr("fill", "none") 
			.attr("stroke", "#797979")
			.attr("stroke-width", "1"); 
	}
}

/**
* @method :: mapaDialogoDibujarNodo 
* @description :: Se encarga de dibujar la sesión del diálogo 
* @param :: {Object} svgContainer, objeto svg que contiene el mapa del diálogo
* @param :: {Object} data, contiene la información del nodo que representa al mensaje 
**/
function mapaDialogoDibujarNodo(svgContainer, data) {
	var circle = svgContainer.append("circle")
		.attr("data-circle", "dialogo")
		.attr("data-circle-navigate", "")
		.attr("data-nodo-id", data.nodoId)
		.attr("data-nodo-session-id", data.sessionId)
		.attr("data-nodo-parent-id", data.nodoPadreId)
		.attr("data-nodo-parent-nivel", data.nodoPadreNivel)
		.attr("data-nodo-nivel", data.nodoNivel)
		.attr("fill", "#" + data.color)
		.attr("cx", data.cx)
		.attr("cy", data.cy)
		.attr("r", circleRadio)
		.attr("class", "tooltipped context-menu-one")
		.attr("data-position", "bottom")
		.attr("data-delay", "50")
		.attr("data-tooltip", 
			(data.tipo ? '"' + data.tipo +  '". ' : "") + 
			(data.name.length > 50 ? data.name.substring(0, 50) + "..." : data.name));
}

/**
* @method :: mapaDialogoDibujarSesion 
* @description :: Se encarga de dibujar la sesión del diálogo 
* @param :: {Object} imageI, el índice de la imagen del usuario en el arreglo de mensajes
* @param :: {Object} imgurl, la dirección hacia la imagen del usuario
* @param :: {Object} initials, iniciales del usuario
* @param :: {Object} sessionId, la sesión que se dibujará en el mapa
* @param :: {Object} svgContainer, objeto svg que contiene el mapa del diálogo
**/
function mapaDialogoDibujarSesion(imageI, imgurl, initials, sessionId, svgContainer) {
	// Dibujar la línea de la sesión 
	var sessionLine = svgContainer.append("line") 
		.attr("x1", circleWidth + (sessionId * 100)) 
		.attr("x2", circleWidth + (sessionId * 100)) 
		.attr("y1", 0) 
		.attr("y2", 1024) 
		.attr("style", "stroke: #999999; fill:none; stroke-dasharray: 10 5") 
		.attr("stroke-width", "1"); 

	// Dibujar la imagen del usuario 
	var defPattern = svgContainer.append("svg:defs")
		.append("svg:pattern")
		.attr("id", "image" + imageI)
		.attr("height", 44)
		.attr("width", 44)
		.append("svg:image")
		.attr("x", 0)
		.attr("y", 0)
		.attr("height", 44)
		.attr("width", 44)
		.attr("xlink:href", imgurl); 

	// Dibujar el circulo que contiene la imagen del usuario 
	var sessionCircle = svgContainer.append("circle")
		.attr("data-header-session-id", sessionId)
		.attr("fill", "url(#image" + imageI + ")")
		.attr("stroke", "black")
		.attr("stroke-width", "1")
		.attr("cx", circleWidth + (sessionId * 100))
		.attr("cy", 23)
		.attr("r", 22)
		.attr("class", "tooltipped")
		.attr("data-position", "left")
		.attr("data-delay", "50")
		.attr("data-tooltip", initials);
} 

/**
* @method :: mapaDialogoModificarNodo 
* @description :: Se encarga de dibujar la sesión del diálogo 
* @param :: {Object} mensaje, contiene la información del nodo que representa al mensaje 
**/
function mapaDialogoModificarNodo(mensaje) { 
	// Establecer el punto inicial de la línea en el eje X 
	var x1 = lineHeight + (100 * mensaje.nodoPadreSessionId); 

	// Establecer el punto final de la línea en el eje X 
	var x2 = lineHeight + 76 + (100 * (mensaje.sessionId - 1)); 

	// Establecer el punto inicial de la línea en el eje Y 
	var y1 = circleHeight + (mensaje.nodoPadreNivel * 40); 

	// Establecer el punto final de la línea en el eje Y 
	var y2 = circleHeight + (mensaje.nodoNivel * 40); 

	// Obtener el nodo que se va a modificar 
	var circle = $("[data-nodo-id='" + mensaje.nodoId + "'"); 

	// Establecer los nuevos valores a los atributos del nodo 
	circle.attr("data-nodo-parent-nivel", mensaje.nodoPadreNivel); 
	circle.attr("data-nodo-nivel", mensaje.nodoNivel); 
	circle.attr("cy", y2); 

	// Obtener la línea que interconecta al nodo hijo con el padre 
	var line = $("[data-line-nodo-id='" + mensaje.nodoId + "'"); 

	// Verificar si es una línea recta 
	if(line.prop("nodeName") === "line") { 
		// Actualizar los valores de los atributos de la línea 
		line.attr("x1", x1); 
		line.attr("x2", x2); 
		line.attr("y1", y1); 
		line.attr("y2", y2); 
	} else { 
		// Actualizar los valores del camino 
		var d = "M " + x1 + " " + y1 + " L " + parseInt(x1 + 50) + " " + y2 + " L " + x2 + " " + y2; 
		line.attr("d", d); 
	}
}

/**
* @method :: mapaDialogoDibujarAncla 
* @description :: Se encarga de dibujar el ícono del mensaje anclado en el mapa 
* @param :: {boolean} anclar, define si el mensaje se ancla o no 
* @param :: {Object} data, contiene la información del nodo que representa al mensaje 
**/
function mapaDialogoDibujarAncla(anclar, data) { 
	// Obtener el contenedor del SVG 
	var svgContainer = d3.select("#main svg"); 

	// Remover el ícono del nodo que se encontraba anclado 
	svgContainer.selectAll("[data-nodo-anchor-id=anchor]").remove(); 

	// Verificar si se debe anclar de nuevo 
	if(anclar) {
		// Establecer los parámetros de la imagen del ancla 
		var defPattern = svgContainer.append("svg:defs")
			.append("svg:pattern")
			.attr("data-nodo-anchor-id", "anchor")
			.attr("id", "imageAnchor")
			.attr("height", 15)
			.attr("width", 15)
			.append("svg:image")
			.attr("data-nodo-anchor-id", "anchor")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", 16)
			.attr("width", 16)
			.attr("xlink:href", "/images/anchor-small.png"); 

		// Dibujar el contenedor de la imagen del ancla 
		var sessionCircle = svgContainer.append("circle")
			.attr("data-nodo-anchor-id", "anchor")
			.attr("fill", "url(#imageAnchor)")
			.attr("stroke", "black")
			.attr("stroke-width", "0")
			.attr("cx", circleWidth + (data.sessionId * 100) + 20)
			.attr("cy", circleHeight + (data.nodoNivel * 40) - 15)
			.attr("r", 8);
	}
}