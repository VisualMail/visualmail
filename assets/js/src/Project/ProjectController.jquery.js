/**
* @method :: $(document).ready(function() { });
* @description :: Función iniciar cuando el Documento HTML está listo  
**/
$(document).ready(function() { 
	// Iniciar los tooltips 
    $(".tooltipped").tooltip({delay: 50}); 

    // Iniciar los modal popups
    $(".modal").modal(); 

    // Iniciar los datos del tablero kanban
    kanbanBoardInit(); 

    $("[data-circle='dialogo']")

    // Iniciar el menú contextual de cada nodo del mapa del diálogo
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
                        n.attr("stroke-width", "1"); 
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
        start: function(event, ui) { 
            ui.originalPosition.top  = ui.position.top + 2; 
        }, 
        stop: function(event, ui) {
            var topHeight = 600; 
            var originalHeight = 270; 
            var finalHeight = (ui.size.height > originalHeight ? (ui.size.height - originalHeight) : 0); 
            $("#main").css("height", topHeight - (finalHeight > 0 ? finalHeight : 0)); 
        }
    }); 
    $(".resizable-panel-left").resizable({ 
        handles: "e", 
        classes: { "ui-resizable-e": "resizable-splitter" }, 
        resizeHeight: false 
    }); 

    // Presentar la vista
    $("#ProjectControllerMain").fadeIn(200); 
}); 