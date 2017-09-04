/**
* @method :: $(document).ready(function() { });
* @description :: Función iniciar cuando el Documento HTML está listo  
**/
$(document).ready(function() { 

    // Iniciar el panel móvil del diálogo 
    $('#dialogo-main').css({width: "100%", height: 840}).split({orientation:'horizontal', limit:100}); 
    $("#dialogo-panel").css({width: "100%", height: 340}).split({ orientation:'vertical', limit:10 });

    // Iniciar los datos del tablero kanban
    kanbanBoardInit(); 

    // Iniciar el menú contextual de cada nodo del mapa del diálogo
    $(function() { contextMenuMapaInit(); }); 

    // Iniciar el menú contextual del panel de mensajes 
    $(function() { contextMenuMensajePanelInit(); }); 
}); 

/**
* @method :: contextMenuMapaInit
* @description :: Inicia el sub-menú del mapa cuando el usuario hace clic derecho.
**/
function contextMenuMapaInit() { 
    $.contextMenu({ 
        selector: ".context-menu-one", 
        callback: function(key, options) { 
            var nodoId = parseInt($(this[0]).attr("data-nodo-id")); 
            var scope = angular.element(document.getElementById("IndexControllerMain")).scope(); 
            
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
                    
                    if(scope.vm.miMensajeAnclado.nodoId) 
                        $anclar = nodoId !== scope.vm.miMensajeAnclado.nodoId; 
                        
                    onAnclar(nodoId, scope); 
                    break; 
                default: 
                    break; 
            } 
        }, 
        items: { 
            "reply": { name: "Responder todo", icon: "edit" }, 
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
    // Obtener el texto seleccionado 
    var scope = angular.element(document.getElementById("IndexControllerMain")).scope(); 
    
    // Si se 'marca el mensaje' o se 'responde' 
    if(key === "mark" || key === "reply" || key === "add") { 
        // Mostrar el PopUp del mensaje 
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
        "citar": { name: "Citar mensaje", icon: "citar" }, 
        "ci": { name: "Compromiso individual", icon: "ci" }, 
        "ac": { name: "Acuerdo de coordinación", icon: "ac" }, 
        "nc": { name: "Norma común", icon: "nc" }, 
        "db": { name: "Desacuerdo o brecha", icon: "db" }, 
        "ta": { name: "Tarea", icon: "ta" }, 
        "da": { name: "Duda o alternativa", icon: "da" }, 
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
    
    var scope = angular.element(document.getElementById("IndexControllerMain")).scope(); 
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
    var scope = angular.element(document.getElementById("IndexControllerMain")).scope(); 
    $anclar = true; 
    onAnclar(nodoId, scope); 
}; 