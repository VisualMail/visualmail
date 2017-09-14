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

    $("#selectFiltrarUsuario").on("change", function() { 
        onSelectFiltrarUsuario(this); 
    }); 
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
                case "add": 
                    scope.$apply(function () { 
                        scope.vm.onMensajeModalShow(nodoId, 2); 
                    }); 
                    break; 
                case "reply":
                case "anchor": 
                    onMensajeAnclarResponder(nodoId, scope, key === "reply"); 
                    break; 
                default: 
                    break; 
            } 
        }, 
        items: { 
            "reply": { name: "Responder todo", icon: "edit" }, 
            //"add": { name: "Añadir al Kanban", icon: "add" }, 
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
    /*var items = { 
        "citar": { name: "Citar mensaje", icon: "citar" }, 
        "ci": { name: "Compromiso individual", icon: "ci" }, 
        "ac": { name: "Acuerdo de coordinación", icon: "ac" }, 
        "nc": { name: "Norma común", icon: "nc" }, 
        "db": { name: "Desacuerdo o brecha", icon: "db" }, 
        "ta": { name: "Tarea", icon: "ta" }, 
        "da": { name: "Duda o alternativa", icon: "da" }, 
        "sep1": "---------", 
        "quit": { name: "Cancelar", icon: function() { return "context-menu-icon context-menu-icon-quit"; } } 
    }; */

    var items = { 
        "citar": { name: "Citar mensaje", icon: "citar" }, 
        "ci": { name: "Compromiso individual", icon: "ci" }, 
        "ac": { name: "Acuerdo de coordinación", icon: "ac" }, 
        "nc": { name: "Norma común", icon: "nc" }, 
        "db": { name: "Desacuerdo o brecha", icon: "db" }, 
        "da": { name: "Duda o alternativa", icon: "da" }, 
        "sep1": "---------", 
        "quit": { name: "Cancelar", icon: function() { return "context-menu-icon context-menu-icon-quit"; } } 
    }; 

    var scope = angular.element(document.getElementById("IndexControllerMain")).scope(); 

    $.contextMenu({ 
        selector: ".context-menu-mensaje-anclado", 
        callback: function(key, options) { 
            if(key === "sep1")
                return; 

            scope.$apply(function () { 
                scope.vm.onMensajeMarcar(key, options, "anclado"); 
            }); 
        }, 
        items: items 
    });

    $.contextMenu({ 
        selector: ".context-menu-mensaje-navegar", 
        callback: function(key, options) { 
            if(key === "sep1")
                return; 
            
            scope.$apply(function () { 
                scope.vm.onMensajeMarcar(key, options, "navegar"); 
            }); 
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
function onAnclar(nodoId, scope, responder) { 
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
        scope.vm.iniciarMensajeAnclado(); 
        scope.vm.mensajeResponder = responder; 
    }); 
}; 

/** 
* @method :: onMensajeAnclarResponder 
* @description :: Ancla el mensaje al momento que el usuario hace clic en un nodo y permitir responder 
* @param :: {integer} nodoId, identificador del nodo 
* @param :: {Object} scope, datos del controlador de la vista 
* @param :: {boolean} responder, permite activar la respuesta al mensaje 
**/ 
function onMensajeAnclarResponder(nodoId, scope, responder) { 
    $anclar = true; 
    
    if(scope.vm.miMensajeAnclado !== "" && !(responder && scope.vm.miMensajeAnclado.nodoId === nodoId)) 
        $anclar = nodoId !== scope.vm.miMensajeAnclado.nodoId; 
        
    onAnclar(nodoId, scope, responder); 
}; 

/** 
* @method :: onNodoClick 
* @description :: Ancla el mensaje al momento que el usuario hace clic en un nodo 
* @param :: {integer} nodoId, identificador del nodo 
**/ 
function onNodoClick(nodoId) { 
    var scope = angular.element(document.getElementById("IndexControllerMain")).scope(); 
    $anclar = true; 
    onAnclar(nodoId, scope, false); 
}; 

/**
* @method :: onSelectFiltrarUsuario
* @description :: Filtran los nodos de interacción de un usuario 
* @param :: {Object} control, datos del dropdownlist que contiene la información de los usuarios 
**/
function onSelectFiltrarUsuario(control) { 
    var s = $(control); 
    var svg = $("#dialogo-svg > .svg-mapa, #dialogo-svg > .svg-session"); 

    if(s.val() !== "") { 
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
}; 