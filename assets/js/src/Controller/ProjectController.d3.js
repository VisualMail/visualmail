$(document).ready(function() { 
    $(".tooltipped").tooltip({delay: 50}); 
    $(".modal-trigger").leanModal(); 
    $(function() { 
        $.contextMenu({ 
            selector: ".context-menu-one", 
            callback: function(key, options) { 
                var nodoId = parseInt($(this[0]).attr("data-nodo-id"));
                var scope = angular.element(document.getElementById("ProjectControllerMain")).scope();
                switch(key) {
                    case "reply":
                        scope.$apply(function () { 
                            scope.vm.onMensajeModalShow(nodoId, 1); 
                        });
                        break;
                    case "add":
                        scope.$apply(function () { 
                            scope.vm.onMensajeModalShow(nodoId, 2); 
                        });
                        break;
                    case "anchor":
                        $anclar = true; 

                        if(scope.vm.miMensajeAnclado !== "") 
                            $anclar = nodoId !== scope.vm.miMensajeAnclado.nodoId;

                        $("[data-circle=dialogo]").attr("stroke", ""); 
                        $("[data-circle=dialogo]").attr("stroke-width", ""); 
                        var n = $("[data-circle-navigate=ok]");
                        n.attr("stroke", ""); 
                        n.attr("stroke-width", ""); 
                        n.attr("data-circle-navigate", ""); 
                        n = $("[data-line-navigate=ok]"); 
                        n.attr("stroke", "#797979"); 
                        n.attr("data-line-navigate", ""); 

                        scope.$apply(function () { 
                            scope.vm.onMensajeAnclarClick(nodoId); 
                        });

                        scope.vm.iniciarMensajeAnclado();

                        break; 
                    default: 
                        break; 
                } 
            }, 
            items: { 
                "reply": { name: "Responder", icon: "edit" }, 
                "add": { name: "Añadir al Kanban", icon: "add" }, 
                "anchor": { name: "Anclar/Desanclar", icon: "paste" }, 
                "sep1": "---------", 
                "quit": { name: "Cancelar", icon: function() { return "context-menu-icon context-menu-icon-quit"; } } 
            } 
        });
    }); 
    $(".resizable-panel-container").resizable({ 
        handles: "n", 
        classes: { "ui-resizable-n": "resizable-splitter-horizontal" }, 
        maxHeight: 820,
        minHeight: 20, 
        resizeWidth: false, 
        start: function( event, ui ) { 
            ui.originalPosition.top  = ui.position.top + 2; 
        }
    }); 
    $(".resizable-panel-left").resizable({ 
        handles: "e", 
        classes: { "ui-resizable-e": "resizable-splitter" }, 
        resizeHeight: false 
    }); 
}); 

function dibujarDialogo(nodoMensaje) {
	var totalHeight = 580;
	var totalWidth = 1328;
	var circleHeight = 100;
	var circleWidth = 90;
	var circleRadio = 12;
	var lineHeight = 102;
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
	$("#main").html("");
	var svgContainer = d3.select("#main").append("svg").attr("style", "background-color: #fff;");
	var sessionIdAux = -1;
	var imageI = 0;

	$.each(nodoMensaje, function(k, v) {
		if(sessionIdAux != v.sessionId) {
			sessionIdAux = v.sessionId;
			var sessionLine = svgContainer.append("line")
				.attr("x1", circleWidth + (v.sessionId * 100))
				.attr("x2", circleWidth + (v.sessionId * 100))
				.attr("y1", 0)
				.attr("y2", 1024)
				.attr("style", "stroke: #999999; fill:none; stroke-dasharray: 10 5") 
				.attr("stroke-width", "1");
			var defPattern = svgContainer
				.append("svg:defs")
				.append("svg:pattern")
				.attr("id", "image" + imageI)
				.attr("height", 44)
				.attr("width", 44)
				.append("svg:image")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", 44)
				.attr("width", 44)
				.attr("xlink:href", v.usuario.imgurl);
			var sessionCircle = svgContainer.append("circle")
				.attr("data-header-session-id", v.sessionId)
				.attr("fill", "url(#image" + imageI + ")")
				.attr("stroke", "black")
				.attr("stroke-width", "1")
				.attr("cx", circleWidth + (v.sessionId * 100))
				.attr("cy", 23)
				.attr("r", 22)
				.attr("class", "tooltipped")
				.attr("data-position", "left")
				.attr("data-delay", "50")
				.attr("data-tooltip", v.usuario.initials);
				imageI++;
		}

		if(v.sessionId > 0) { 
			y1 = circleHeight + (v.nodoPadreNivel * 40);
			y2 = circleHeight + (v.nodoNivel * 40);

			var line = svgContainer.append("line")
				.attr("data-line-navigate", "")
				.attr("data-line-nodo-id", v.nodoId)
				.attr("x1", lineHeight + (100 * (v.nodoPadreSessionId)))
				.attr("y1", y1)
				.attr("x2", lineHeight + 76 + (100 * (v.sessionId - 1)))
				.attr("y2", y2)
				.attr("stroke", "#797979")
				.attr("stroke-width", "1");

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
		var circle = svgContainer.append("circle")
			.attr("data-circle", "dialogo")
			.attr("data-circle-navigate", "")
			.attr("data-nodo-id", v.nodoId)
			.attr("data-nodo-session-id", v.sessionId)
			.attr("data-nodo-parent-id", v.nodoPadreId)
			.attr("data-nodo-parent-nivel", v.nodoPadreNivel)
			.attr("data-nodo-nivel", v.nodoNivel)
			.attr("fill", "#" + v.color)
			.attr("cx", v.cx)
			.attr("cy", v.cy)
			.attr("r", circleRadio)
			.attr("class", "tooltipped context-menu-one")
			.attr("data-position", "bottom")
			.attr("data-delay", "50")
			.attr("data-tooltip", 
				(v.tipo ? '"' + v.tipo +  '". ' : "") + 
				(v.name.length > 50 ? v.name.substring(0, 50) + "..." : v.name));
	});

	d3.select("#main").select("svg")
		.attr("height", totalHeight)
		.attr("width", totalWidth);
	$('.tooltipped').tooltip({delay: 50});
} 