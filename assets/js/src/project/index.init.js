/**
* @method :: $(document).ready(function() { });
* @description :: Función iniciar cuando el Documento HTML está listo
**/
$(document).ready(function() {

    // Iniciar el panel móvil del diálogo
    $('#IndexMensajeControllerMain').css({width: "100%", height: 840}).split({orientation:'horizontal', limit:100});
    $("#dialogo-panel").css({width: "100%", height: 340}).split({ orientation:'vertical', limit:10 });

    // Iniciar los datos del tablero kanban
    kanbanBoardInit();

    // Iniciar el menú contextual de cada nodo del mapa del diálogo
    $(function() { contextMenuMapaInit(); });

    // Iniciar el menú contextual de cada nodo del mapa del diálogo con kanban
    $(function() { contextMenuMapaKanbanInit(); });

    // Iniciar el menú contextual del panel de mensajes
    $(function() { contextMenuMensajePanelInit(); });

    // Iniciar el filtro de usuarios en el mapa
    $("#selectFiltrarUsuario").on("change", function() { onSelectFiltrarUsuario(this); });

    var scopeMain = angular.element(document.getElementById("IndexControllerMain")).scope();
    var scopeMensaje = angular.element(document.getElementById("IndexMensajeControllerMain")).scope();
    var scopeTarea = angular.element(document.getElementById("kanbanBoard")).scope();

    /**
    * @method :: io.socket.get
    * @description :: Inicializa la conexión con el soket io
    **/
    io.socket.get("/project/conectar_socket", { project_id: scopeMain.vm.miProjectId }, function gotResponse(body, response) {
        console.log("El servidor respondió con código " + response.statusCode + " y datos: ", body);
    });

    /**
    * @method :: io.socket.on 'socket_project_response'
    * @description :: Recibe la respuesta del servidor cuando se envía un mensaje o una tarea
    **/
    io.socket.on("socket_project_response", function gotSocketConectado(data) {
        console.log(data.message);

        // Verificar el tipo de mensaje
        switch(data.type) {
            case "MensajeNuevo":
                scopeMensaje.im.onSocketMensajeNuevo(data);
                break;
            case "TareaNueva":
                scopeTarea.ik.onSocketTareaNueva(data);
                break;
            case "TareaActualizar":
                scopeTarea.ik.onSocketTareaActualizar(data);
                break;
            default:
                break;
        }
    });

    /**
    * @method :: document.onkeydown
    * @description :: Verifica la tecla de navegación que envía el usuario
    **/
    document.onkeydown = function checkKey(e) {
        // Si no existe un mensaje anclado omitir o no está el foco en el mapa
        if(!$anclar || !scopeMensaje.im.miMapaSvgFocus)
            return;

        e = e || window.event;

        // Si no es una tecla de navegación retornar
        if([37, 38, 39, 40].indexOf(e.keyCode) > -1)
            e.preventDefault();
        else
            return;

        var accion = "";

        if (e.keyCode == "38")
            accion = "Arriba";
        else if (e.keyCode == "40")
            accion = "Abajo";
        else if (e.keyCode == "37")
            accion = "Izquierda";
        else if (e.keyCode == "39")
            accion = "Derecha";

        scopeMensaje.im.iniciarMensajeNavegar(true, true, accion);
    };
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
            var scope = angular.element(document.getElementById("IndexMensajeControllerMain")).scope();

            switch(key) {
                case "navigate":
                    scope.$apply(function () {
                        scope.im.onMensajeAnclarNavegar(nodoId);
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
            "reply": { name: "Responder todo", icon: "reply" },
            "anchor": { name: "Anclar/Desanclar", icon: "anchor" },
            "navigate": { name: "Desplegar mensaje", icon: "navigate" },
            "sep1": "---------",
            "quit": { name: "Cancelar", icon: function() { return "context-menu-icon context-menu-icon-quit"; } }
        }
    });
};

/**
* @method :: contextMenuMapaKanbanInit
* @description :: Inicia el sub-menú del mapa con 'ir al kanban' cuando el usuario hace clic derecho.
**/
function contextMenuMapaKanbanInit() {
    $.contextMenu({
        selector: ".context-menu-one-kanban",
        callback: function(key, options) {
            var nodoId = parseInt($(this[0]).attr("data-nodo-id"));
            var scopeMensaje = angular.element(document.getElementById("IndexMensajeControllerMain")).scope();
            var scopeMain = angular.element(document.getElementById("IndexControllerMain")).scope();

            switch(key) {
                case "navigate":
                    scopeMensaje.$apply(function () {
                        scopeMensaje.im.onMensajeAnclarNavegar(nodoId);
                    });
                    break;
                case "kanban":
                    scopeMain.$apply(function () {
                        scopeMain.vm.onActiveTabChanged(4, nodoId);
                    });
                    break;
                case "reply":
                case "anchor":
                    onMensajeAnclarResponder(nodoId, scopeMensaje, key === "reply");
                    break;
                default:
                    break;
            }
        },
        items: {
            "reply": { name: "Responder todo", icon: "reply" },
            "anchor": { name: "Anclar/Desanclar", icon: "anchor" },
            "kanban": { name: "Ir al kanban", icon: "kanban" },
            "navigate": { name: "Desplegar mensaje", icon: "navigate" },
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
    var scope = angular.element(document.getElementById("IndexMensajeControllerMain")).scope();

    // Si se 'marca el mensaje' o se 'responde'
    if(key === "mark" || key === "reply" || key === "add") {
        // Mostrar el PopUp del mensaje
        scope.$apply(function () {
            scope.im.onMostrarMensajeDialogo(key, mensaje);
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
        "da": { name: "Duda o alternativa", icon: "da" },
        "sep1": "---------",
        "quit": { name: "Cancelar", icon: function() { return "context-menu-icon context-menu-icon-quit"; } }
    };

    var scope = angular.element(document.getElementById("IndexMensajeControllerMain")).scope();

    $.contextMenu({
        selector: ".context-menu-mensaje-anclado",
        callback: function(key, options) {
            if(key === "sep1")
                return;

            scope.$apply(function () {
                scope.im.onMensajeMarcar(key, options, "anclado");
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
                scope.im.onMensajeMarcar(key, options, "navegar");
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
        scope.im.onMensajeAnclarClick(nodoId);
        scope.im.iniciarMensajeAnclado();
        scope.im.mensajeResponder = responder;
    });

    if(responder) {
        $('#mensajeRespuesta').focus();
        $("#x").css("opacity", "0.5");
    }
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

    if(scope.im.miMensajeAnclado !== "" && !(responder && scope.im.miMensajeAnclado.nodoId === nodoId))
        $anclar = nodoId !== scope.im.miMensajeAnclado.nodoId;

    onAnclar(nodoId, scope, responder);
};

/**
* @method :: onNodoClick
* @description :: Ancla el mensaje al momento que el usuario hace clic en un nodo
* @param :: {integer} nodoId, identificador del nodo
**/
function onNodoClick(nodoId) {
    var scope = angular.element(document.getElementById("IndexMensajeControllerMain")).scope();
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
