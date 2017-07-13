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
    
    // Iniciar el menú contextual de cada nodo del mapa del diálogo
    $(function() { contextMenuMapaInit(); }); 
    $(function() { contextMenuMensajePanelInit(); }); 


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
            $("#main .svg-mapa").css("height", topHeight - (finalHeight > 0 ? finalHeight : 0)); 
        }
    }); 
    $(".resizable-panel-left").resizable({ 
        handles: "e", 
        classes: { "ui-resizable-e": "resizable-splitter" }, 
        resizeHeight: false 
    }); 

}); 

$("#selectFiltrarUsuario").on("change", function() {
    var s = $(this); 
    var svg = $("#main > .svg-mapa, #main > .svg-session"); 

    if(s.val() !== "0") { 
        svg.find("circle").css("fill-opacity", "0.3"); 
        svg.find("circle").css("stroke-opacity", "0.3"); 
        svg.find("line").css("stroke-opacity", "0.3"); 
        svg.find("path").css("stroke-opacity", "0.3"); 

        var h = $("[data-header-usuario-id='" + s.val() + "']"); 
        h.css("fill-opacity", "1"); 
        h.css("stroke-opacity", "1"); 

        $.each(h, function(key, value) { 
            var n = $("[data-nodo-session-id=" + $(value).attr("data-header-session-id") + "]"); 
            n.css("fill-opacity", "1"); 
            n.css("stroke-opacity", "1"); 
        }); 
    } else { 
        svg.find("circle").css("fill-opacity", "1"); 
        svg.find("circle").css("stroke-opacity", "1"); 
        svg.find("line").css("stroke-opacity", "1"); 
        svg.find("path").css("stroke-opacity", "1"); 
    }
}); 

/**
* @method :: onAnclar
* @description :: Llama a las funciones para anclar el mensaje.
* @param :: {integer} nodoId, identificador del nodo. 
* @param :: {Object} scope, Objeto que contiene el "scope" de angular.
**/
function onAnclar(nodoId, scope) { 
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
}; 

/**
* @method :: onNodoClick
* @description :: Ancla el mensaje al momento que el usuario hace clic en un nodo.
* @param :: {integer} nodoId, identificador del nodo 
**/
function onNodoClick(nodoId) { 
    var scope = angular.element(document.getElementById("ProjectControllerMain")).scope(); 
    $anclar = true; 
    onAnclar(nodoId, scope); 
}; 

/**
* @method :: contextMenuMapaInit
* @description :: Inicia el sub-menú del mapa cuando el usuario hace clic derecho.
**/
function contextMenuMapaInit() { 
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
                        
                    onAnclar(nodoId, scope); 
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
}; 

/**
* @method :: contextMenuMensajeInit
* @description :: Inicia el sub-menú del mensaje cuando el usuario hace clic derecho.
* @param :: {string} key, identificador del nodo 
* @param :: {Object} options, datos del contenedor del texto 
* @param :: {Object} mensaje, datos del mensaje que se responde 
**/
function contextMenuMensajeInit(key, options, mensaje) { 
    // Si se 'marca el mensaje' o se 'responde' 
    if(key === "mark" || key === "reply") { 
        // Obtener el texto seleccionado 
        var scope = angular.element(document.getElementById("ProjectControllerMain")).scope(); 
        mensaje = mensaje === "anclado" ? scope.vm.miMensajeAnclado : scope.vm.miMensajeAncladoNavegar; 

        // Mostrar el PopUp 
        scope.$apply(function () { 
            scope.vm.onMostrarMensajeDialogo(key, mensaje); 
        });
    }
}

/**
* @method :: contextMenuMensajePanelInit
* @description :: Inicia el sub-menú del mensaje cuando el usuario hace clic derecho.
**/
function contextMenuMensajePanelInit() { 
    var items = { 
        "mark": { name: "Marcar mensaje", icon: "copy" }, 
        "reply": { name: "Responder", icon: "edit" }, 
        "add": { name: "Añadir al Kanban", icon: "add" }, 
        "sep1": "---------", 
        "quit": { name: "Cancelar", icon: function() { return "context-menu-icon context-menu-icon-quit"; } } 
    }; 

    $.contextMenu({ 
        selector: ".context-menu-mensaje-anclado", 
        callback: function(key, options) { 
            contextMenuMensajeInit(key, options, "anclado"); 
        }, 
        items: items 
    });

    $.contextMenu({ 
        selector: ".context-menu-mensaje-navegar", 
        callback: function(key, options) { 
            contextMenuMensajeInit(key, options, "navegar"); 
        }, 
        items: items 
    });
}; 



/*
$('#showSelected').on('click', function(){

    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }

    alert(text);       
});
*/