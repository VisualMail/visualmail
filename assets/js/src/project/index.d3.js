// Constantes requeridas para dibujar el mapa del diálogo 
var totalHeight = 580;
var totalHeightSession = 48;
var totalWidth = 1328;
var circleHeight = 30;
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
	//$("#dialogo-svg > .svg-session, #dialogo-svg > .svg-mapa").html(""); 
	$("#dialogo-svg > .svg-session, .svg-mapa").html(""); 

	// Añadir al 'div' el objeto 'svg' que contiene el mapa del diálogo 
	//var svgSession = d3.select("#dialogo-svg > .svg-session").append("svg").attr("style", "background-color: #fff;"); 
	var svgSession = d3.select(".svg-session").append("svg").attr("style", "background-color: #fff;"); 
	var svgMapa = d3.select("#dialogo-svg > .svg-mapa").append("svg").attr("style", "background-color: #fff;"); 

	// Establecer una variable auxiliar para verificar si la sesión del mensaje cambia 
	// en cada iteración en la lista de mensajes 
	var sessionIdAux = -1; 

	// Establecer una variable para almacenar el índice de la imagen cada vez que cambie la sesión 
	// en cada iteración en la lista de mensajes 
	var imageI = 0; 

	// Iniciar una lista para almacenar la información de los nodos 
	var listaNodos = []; 

	// Almacenar la última session
	var sessionIdMax = 0; 
	
	// Almacenar la altura de las lineas de las sesiones 
	var ySession = 1024;

	// Iniciar la iteración para buscar cada mensaje 
	$.each(nodoMensaje, function(k, v) {
		// Si la sesión ha cambiado 
		if(sessionIdAux !== v.sessionId && $("[data-header-session-id=" + v.sessionId + "]").length === 0) {
			// Alamcenar la nueva sesión en la variable auxiliar 
			sessionIdAux = v.sessionId;

			// Almacenar la última session
			sessionIdMax = sessionIdAux > sessionIdMax ? sessionIdAux : sessionIdMax;

			// Dibujar la línea del diálogo 
			mapaDialogoDibujarSesion(v.usuario.id, imageI, v.usuario.imgurl, v.usuario.initials, v.sessionId, svgSession, svgMapa); 

			// Incrementar el índice de la imagen que se dibuja en cada sesión 
			imageI++;
		}

		// Establecer la altura tanto del nodo como de la línea que interconecta el nodo con el padre 
		var y2 = circleHeight + (v.nodoNivel * 40); 

		// Verificar si las lineas de las sesiones están a la misma altura
		ySession = y2 > ySession ? y2 : ySession;

		// Si no es el nodo inicial 
		if(v.sessionId > 0) { 
			// Dibujar la línea que interconecta el hijo con el padre 
			mapaDialogoDibujarLinea(svgMapa, v); 

			// Si la altura establecida es mayor al tamaño total del mapa del diálogo 
			// actualizar la altura del mapa 
			if((y2 + 80) > totalHeight) 
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
			tareaId: v.tareaId ? true : false, 
			tipo: v.tipo, 
			tipoId: v.tipoId 
		});
	}); 

	// Se dibujan los nodos aparte para que la línea del camino 
	// no se despliege por encima del nodo 
	$.each(listaNodos, function(key, value) { 
		mapaDialogoDibujarNodo(svgMapa, value); 
	}); 

	// Actualizar el alto y el ancho del mapa 
	/*d3.select("#dialogo-svg > .svg-session").select("svg")
		.attr("height", totalHeightSession)
		.attr("width", totalWidth); */
	d3.select(".svg-session").select("svg")
		.attr("height", totalHeightSession)
		.attr("width", totalWidth + 48); 
	var m = $("#dialogo-svg > .svg-mapa"); 
	m.find("svg")
		.attr("height", totalHeight)
		.attr("width", totalWidth); 
	m.attr("style", "heigth: " + totalHeight + "px; width: " + (totalWidth > window.screen.availWidth ? totalWidth : window.screen.availWidth) + "px;"); 

	// Iniciar los tooltips de los nodos del mapa 
	$('[rel="popover"]').popover();
	$('[rel="popover"]').popover({ trigger: "hover" });

	// Almacenar la última sesión 
	angular.element(document.getElementById("IndexControllerMain")).scope().vm.miSessionId = sessionIdMax + 1; 
	
	// Actualizar la altura de lineas de las sesiones 
	$("[data-line-type='session']").attr("y2", ySession); 
} 

/**
* @method :: mapaDialogoAgregarNodo 
* @description :: Se encarga de dibujar la sesión del diálogo 
* @param :: {Object} mensaje, contiene la información del nodo que representa al mensaje 
**/
function mapaDialogoAgregarNodo(mensaje) {
	// Seleccionar el objeto SVG 
	//var svgSession = d3.select("#dialogo-svg > .svg-session svg"); 
	var svgSession = d3.select(".svg-session svg"); 
	var svgMapa = d3.select("#dialogo-svg > .svg-mapa svg"); 

	// Verificar si existe la línea que representa a la sesión en la que se encuentra el mensaje 
	// Si no existe, dibujar la sesión 
	if(!$("[data-header-session-id='" + mensaje.sessionId + "']").length) 
		mapaDialogoDibujarSesion(mensaje.usuario.id, mensaje.sessionId, mensaje.usuario.imgurl, mensaje.usuario.initials, mensaje.sessionId, svgSession, svgMapa); 

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
		tareaId: mensaje.tareaId, 
		tipo: mensaje.tipo, 
		tipoId: mensaje.tipoId 
	}; 

	// Dibular la línea que interconecta al nuevo nodo con el padre 
	mapaDialogoDibujarLinea(svgMapa, mensaje); 

	// Dibujar el nuevo nodo 
	mapaDialogoDibujarNodo(svgMapa, data); 

	// Verificar en que posición se encuentra el nodo 
	var svgWidth = parseInt(svgMapa.attr("width")); 

	// Si es mayor al ancho del mapa, actualizar el ancho del mapa 
	if((circleWidth + (mensaje.sessionId * 100) + 200) > svgWidth) 
		svgWidth = circleWidth + (mensaje.sessionId * 100) + 200; 

	// Si la altura establecida es mayor al tamaño total del mapa del diálogo 
	// actualizar la altura del mapa 
	var svgHeight = parseInt(svgMapa.attr("height")); 
	
	if((y2 + 80) > svgHeight) 
		svgHeight = y2 + 80; 

	svgSession.attr("width", svgWidth); 
	
	var m = $("#dialogo-svg > .svg-mapa"); 
	
	m.find("svg")
		.attr("height", svgHeight)
		.attr("width", svgWidth); 
	m.attr("style", "heigth: " + svgHeight + "px; width: " + (svgWidth > window.screen.availWidth ? svgWidth : window.screen.availWidth) + "px;"); 

	// Iniciar los tooltips de los nodos del mapa 
	$('[rel="popover"]').popover();
	$('[rel="popover"]').popover({ trigger: "hover" });

	// Verificar la altura de la linea de sesión
	var sessionH = parseInt($("[data-line-type='session']").first().attr("y2"));
	sessionH = y2 > sessionH ? y2 : sessionH; 
	$("[data-line-type='session']").attr("y2", sessionH);

	// Agregar palabra "Nuevo" 
	var a = $("#txtNew"); 

	if(a.length === 0) { 
		svgMapa.append("text") 
			.attr("id", "txtNew")
			.attr("dx", circleWidth + (data.sessionId * 100) + 5) 
			.attr("dy", circleHeight + (data.nodoNivel * 40) - 20) 
			.attr("fill", "red") 
			.style("text-anchor", "start") 
			.text("Nuevo"); 
	} else { 
		a.attr("dx", circleWidth + (data.sessionId * 100) + 5); 
		a.attr("dy", circleHeight + (data.nodoNivel * 40) - 20); 
	}
}

/**
* @method :: mapaDialogoDibujarLinea 
* @description :: Se encarga de dibujar la línea que interconecta al nodo hijo con el padre 
* @param :: {Object} svgMapa, objeto svg que contiene el mapa del diálogo
* @param :: {Object} data, contiene la información del nodo que representa al mensaje 
**/
function mapaDialogoDibujarLinea(svgMapa, data) { 
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
		svgMapa.append("line")
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
		var d = "M " + x1 + " " + y1 + " L " + parseInt(x1 + 50) + " " + y2 + " L " + x2 + " " + y2 + " L " + parseInt(x1 + 50) + " " + y2 + " z"; 

		svgMapa.append("path").attr("d", d)
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
* @param :: {Object} svgMapa, objeto svg que contiene el mapa del diálogo
* @param :: {Object} data, contiene la información del nodo que representa al mensaje 
**/
function mapaDialogoDibujarNodo(svgMapa, data) {
	var circle = svgMapa.append("circle")
		.attr("onclick", "onNodoClick(" + data.nodoId + ")")
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
		.attr("class", data.tareaId ? "context-menu-one-kanban" : "context-menu-one")
		.attr("data-content", data.name) 
		.attr("rel", "popover") 
		.attr("data-placement", "bottom")
		.attr("data-original-title", data.tipoId ? data.tipo : "") 
		.attr("data-trigger", "hover"); 
		//.attr("data-content", (data.name.length > 50 ? data.name.substring(0, 50) + "..." : data.name))

	// Verificar el tipo de mensaje 
	if(data.tipo !== "") { 
		var imagenTipo = ""; 

		if($.trim(data.tipoId) === "da") 
			imagenTipo = "da-small.png"; 
		else if($.trim(data.tipoId) === "nc") 
			imagenTipo = "nc-small.png"; 
		else if($.trim(data.tipoId) === "ci") 
			imagenTipo = "ci-small.png"; 
		else if($.trim(data.tipoId) === "ac") 
			imagenTipo = "ac-small.png"; 
		else if($.trim(data.tipoId) === "db") 
			imagenTipo = "db-small.png"; 
		else 
			return; 

		// Establecer los parámetros del tipo de mensaje 
		var defPattern = svgMapa.append("svg:defs")
			.append("svg:pattern")
			.attr("id", "nodoTipo" + data.nodoId)
			.attr("height", 20)
			.attr("width", 20)
			.append("svg:image")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", 21)
			.attr("width", 21)
			.attr("xlink:href", "/images/" + imagenTipo); 

		// Dibujar el contenedor del tipo de mensaje 
		var sessionCircle = svgMapa.append("circle")
			.attr("fill", "url(#nodoTipo" + data.nodoId + ")")
			.attr("data-nodo-id-tipo", data.nodoId)
			.attr("data-nodo-session-id", data.sessionId)
			.attr("stroke", "black")
			.attr("stroke-width", "0")
			.attr("cx", circleWidth + (data.sessionId * 100) - 17)
			.attr("cy", circleHeight + (data.nodoNivel * 40) - 15)
			.attr("r", 15);
	}
}

/**
* @method :: mapaDialogoDibujarSesion 
* @description :: Se encarga de dibujar la sesión del diálogo 
* @param :: {Object} imageI, el índice de la imagen del usuario en el arreglo de mensajes
* @param :: {Object} imgurl, la dirección hacia la imagen del usuario
* @param :: {Object} initials, iniciales del usuario
* @param :: {Object} sessionId, la sesión que se dibujará en el mapa
* @param :: {Object} svgHeader, objeto svg que contiene las sesiones del diálogo
* @param :: {Object} svgMapa, objeto svg que contiene el mapa del diálogo
**/
function mapaDialogoDibujarSesion(usuarioId, imageI, imgurl, initials, sessionId, svgHeader, svgMapa) {
	// Dibujar la línea de la sesión 
	var sessionLine = svgMapa.append("line") 
		.attr("x1", circleWidth + (sessionId * 100)) 
		.attr("x2", circleWidth + (sessionId * 100)) 
		.attr("y1", 0) 
		.attr("y2", 1024) 
		.attr("data-line-type", "session") 
		.attr("style", "stroke: #a0a0a0; fill:none; stroke-dasharray: 10 5") 
		.attr("stroke-width", "0.5"); 

	// Dibujar la imagen del usuario 
	var defPattern = svgHeader.append("svg:defs")
		.append("svg:pattern")
		.attr("id", "image" + imageI)
		.attr("height", 44)
		.attr("width", 44)
		.append("svg:image")
		.attr("x", 0)
		.attr("y", 0)
		.attr("height", 44)
		.attr("width", 44)
		.attr("xlink:href", imgurl ? imgurl : "/images/profile.jpg"); 

	// Dibujar el circulo que contiene la imagen del usuario 
	var sessionCircle = svgHeader.append("circle")
		.attr("data-header-usuario-id", usuarioId)
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
		.attr("data-content", initials) 
		.attr("rel", "popover") 
		.attr("data-placement", "bottom")
		.attr("data-original-title", "") 
		.attr("data-trigger", "hover"); 
} 

/**
* @method :: mapaDialogoModificarNodo 
* @description :: Cambia de posición un nodo (cuando se agrega un mensaje al diálogo) 
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
	$("[data-nodo-id-tipo='" + mensaje.nodoId + "']").attr("cy", circleHeight + (mensaje.nodoNivel * 40) - 15); 

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
	var svgMapa = d3.select("#dialogo-svg > .svg-mapa"); 

	// Remover el ícono del nodo que se encontraba anclado 
	svgMapa.selectAll("[data-nodo-anchor-id=anchor]").remove(); 

	// Verificar si se debe anclar de nuevo 
	if(anclar) {
		// Establecer los parámetros de la imagen del ancla 
		var defPattern = svgMapa.append("svg:defs")
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
		var sessionCircle = svgMapa.append("circle")
			.attr("data-nodo-anchor-id", "anchor")
			.attr("data-nodo-session-id", data.sessionId)
			.attr("fill", "url(#imageAnchor)")
			.attr("stroke", "black")
			.attr("stroke-width", "0")
			.attr("cx", circleWidth + (data.sessionId * 100) + 20)
			.attr("cy", circleHeight + (data.nodoNivel * 40) - 15)
			.attr("r", 8);
	}
}