// Constantes requeridas para dibujar el mapa del diálogo 
var totalHeight = 580;
var totalWidth = 1328;
var circleHeight = 100;
var circleWidth = 90;
var circleRadio = 12;
var lineHeight = 102;


/**
* @method :: dibujarDialogo 
* @description :: Se encarga de dibujar el mapa del diálogo 
* @param :: {Object} nodoMensaje, la lista de los mensajes del proyecto 
**/
function dibujarDialogo(nodoMensaje) {
	var x1 = 0;
	var x2 = 0; 
	var y1 = 0;
	var y2 = 0;
	var listaNodos = [];
	listaNodos.push({
		nodoId: nodoMensaje[0].nodoId,
		sessionId: nodoMensaje[0].sessionId,
		nodoPadreId: nodoMensaje[0].nodoPadreId,
		cx: circleWidth,
		cy: circleHeight,
		color: nodoMensaje[0].usuario.color,
		name: nodoMensaje[0].name,
		tipo: nodoMensaje[0].tipo
	});

	// Obtener el 'div' que contiene el mapa del diálogo 
	$("#main").html("");

	// Añadir al 'div' el objeto 'svg' que contiene el mapa del diálogo
	var svgContainer = d3.select("#main").append("svg").attr("style", "background-color: #fff;");
	var sessionIdAux = -1;
	var imageI = 0;

	$.each(nodoMensaje, function(k, v) {

		// Crear una nueva línea de sesión 
		if(sessionIdAux !== v.sessionId) {
			sessionIdAux = v.sessionId;
			mapaDialogoDibujarSesion(imageI, v.usuario.imgurl, v.usuario.initials, v.sessionId, svgContainer); 
			imageI++;
		}

		// Si no es el nodo inicial, calcular los parámetros 
		if(v.sessionId > 0) { 
			y2 = circleHeight + (v.nodoNivel * 40); 

			mapaDialogoDibujarLinea(svgContainer, v); 

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

			if(y2 > totalHeight) 
				totalHeight = y2 + 80; 

			if((circleWidth + (v.sessionId * 100) + 200) > totalWidth) 
				totalWidth = circleWidth + (v.sessionId * 100) + 200;
		}
	});

	$.each(listaNodos, function(k, v) {
		mapaDialogoDibujarNodo(svgContainer, v); 
	});

	d3.select("#main").select("svg")
		.attr("height", totalHeight)
		.attr("width", totalWidth);
	$('.tooltipped').tooltip({delay: 50}); 
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
	var sessionLine = svgContainer.append("line") 
		.attr("x1", circleWidth + (sessionId * 100)) 
		.attr("x2", circleWidth + (sessionId * 100)) 
		.attr("y1", 0) 
		.attr("y2", 1024) 
		.attr("style", "stroke: #999999; fill:none; stroke-dasharray: 10 5") 
		.attr("stroke-width", "1"); 
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

function mapaDialogoAgregarNodo(mensaje) {
	console.log("AgregarNodo"); 
	var svgContainer = d3.select("#main svg"); 

	if(!$("[data-header-session-id='" + mensaje.sessionId + "']").length) 
		mapaDialogoDibujarSesion(mensaje.sessionId, mensaje.usuario.imgurl, mensaje.usuario.initials, mensaje.sessionId, svgContainer); 

	var y2 = circleHeight + (mensaje.nodoNivel * 40); 
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

	mapaDialogoDibujarNodo(svgContainer, data); 
	mapaDialogoDibujarLinea(svgContainer, mensaje); 
}

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

function mapaDialogoDibujarLinea(svgContainer, data) { 
	var x1 = lineHeight + (100 * data.nodoPadreSessionId); 
	var x2 = lineHeight + 76 + (100 * (data.sessionId - 1)); 
	var y1 = circleHeight + (data.nodoPadreNivel * 40); 
	var y2 = circleHeight + (data.nodoNivel * 40); 

	if(y1 === y2) { 
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
		var d = "M " + x1 + " " + y1 + " L " + parseInt(x1 + 50) + " " + y2 + " L " + x2 + " " + y2; 
		svgContainer.append("path").attr("d", d)
			.attr("data-line-navigate", "")
			.attr("data-line-nodo-id", data.nodoId)
			.attr("fill", "none") 
			.attr("stroke", "#797979")
			.attr("stroke-width", "1"); 
	}
}

function mapaDialogoModificarNodo(mensaje) {
	console.log("ModificarNodo"); 

	var x1 = lineHeight + (100 * mensaje.nodoPadreSessionId); 
	var x2 = lineHeight + 76 + (100 * (mensaje.sessionId - 1)); 
	var y1 = circleHeight + (mensaje.nodoPadreNivel * 40); 
	var y2 = circleHeight + (mensaje.nodoNivel * 40); 

	// Modificar el nodo 
	var circle = $("[data-nodo-id='" + mensaje.nodoId + "'"); 
	circle.attr("data-nodo-parent-nivel", mensaje.nodoPadreNivel);
	circle.attr("data-nodo-nivel", mensaje.nodoNivel);
	circle.attr("cy", y2);

	var d = "M " + x1 + " " + y1 + " L " + parseInt(x1 + 50) + " " + y2 + " L " + x2 + " " + y2; 
	var line = $("[data-line-nodo-id='" + mensaje.nodoId + "'"); 

	if(line.prop("nodeName") === "line") {
		line.remove(); 
		var svgContainer = d3.select("#main svg"); 
		svgContainer.append("path").attr("d", d)
			.attr("data-line-navigate", "")
			.attr("data-line-nodo-id", mensaje.nodoId)
			.attr("fill", "none") 
			.attr("stroke", "#797979")
			.attr("stroke-width", "1"); 
	} else 
		line.attr("d", d); 
}