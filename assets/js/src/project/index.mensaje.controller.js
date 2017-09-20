(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("IndexMensajeController", IndexMensajeController); 

    IndexMensajeController.$inject = ["$http", "$scope", "$sce", "$timeout"]; 

    function IndexMensajeController($http, $scope, $sce, $timeout) { 
        var vm = this; 
        var parent = $scope.$parent; 
        vm.mensajeRespuesta = ""; 
        vm.mensajeRespuestaMarca = ""; 
        vm.mensajeRespuestaSelection = []; 
        vm.mensajeRespuestaTipo = ""; 
        vm.mensajeRespuestaTipoId = ""; 
        vm.mensajeRespuestaTipoName = $sce.trustAsHtml(""); 
        vm.mensajeRespuestaTipoNameMarca = ""; 
        vm.miMapaSvgFocus = true; 
        vm.miMensajeIntercalar = true; 
        vm.miMensajeAnclado = { }; 
        vm.miMensajeAncladoTipoName = ""; 
        vm.miMensajeAncladoNavegar = { }; 
        vm.miMensajeAncladoNavegarTipoName = ""; 
        vm.miMensajeLista = []; 

        vm.iniciarLineaDialogo = iniciarLineaDialogo; 
        vm.iniciarMensajeAnclado = iniciarMensajeAnclado; 
        vm.iniciarMensajeNavegar = iniciarMensajeNavegar; 
        vm.onBtnMensajeAncladoNavegarResponderClick = onBtnMensajeAncladoNavegarResponderClick; 
        vm.onBtnMensajeCancelarClick = onBtnMensajeCancelarClick; 
        vm.onBtnMensajeEnviarClick = onBtnMensajeEnviarClick; 
        vm.onBtnMensajeResponderClick = onBtnMensajeResponderClick; 
        vm.onMensajeAnclarClick = onMensajeAnclarClick; 
        vm.onMensajeAnclarNavegar = onMensajeAnclarNavegar; 
        vm.onMensajeMarcar = onMensajeMarcar; 
        vm.onMensajeTareaCrear = onMensajeTareaCrear; 
        vm.onSocketMensajeNuevo = onSocketMensajeNuevo; 
        vm.setMessage = parent.vm.setMessage; 
        vm.setMessageToast = parent.vm.setMessageToast; 

        init(); 

        function init() { 
            // Desactivar la navegación 
            $(document).ready(function() { 
                $("body").on("click", function(e) { 
                    var cn = e.target.parentNode.className; 
                    vm.miMapaSvgFocus = cn === "svg-mapa" || e.target.parentNode.nodeName === "svg" || cn === "context-menu-item context-menu-icon context-menu-icon-add"; 
                    $(".svg-mapa").css("opacity", vm.miMapaSvgFocus ? "1" : "0.3"); 
                }); 
            }); 

         	// Obtener los mensajes del proyecto
         	$http({ 
                url: "/mensaje/getAllProjectId", 
                method: "GET", 
                params: { id: parent.vm.miProjectId } 
             }).then(function(res) { 
                var d = res.data; 

                // Verificar si no existe un error 
                if(!d.proc) { 
                    setMessage(d.proc, d.msg, undefined, "warning"); 
                    return; 
                } 

                vm.miMensajeLista = d.mensaje; 
 
                // Dibujar el mapa del diálogo (Función en el archivo index.d3.js)
                mapaDialogoDibujar(vm.miMensajeLista);
 
                // Establecer el primer mensaje como el mensaje anclado 
                $anclar = true; 
                vm.onMensajeAnclarClick(vm.miMensajeLista[0].nodoId); 
                vm.iniciarMensajeAnclado(); 
            }).catch(function(err) { 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/mensaje/getAllProjectId'!", null, err); 
            }); 
        }; 

        /**
        * @method :: iniciarLineaDialogo  
        * @description :: Ilumina la línea del diálogo  
        * @param :: {nodoId} name, nombre de la variable 
        **/
        function iniciarLineaDialogo(nodoId) { 
            var n = $("[data-line-nodo-id=" + nodoId + "]"); 
            n.attr("stroke", "#18ffff"); 
            n.attr("stroke-width", "4"); 
            n.attr("data-line-navigate", "ok"); 
            n = $("[data-nodo-id=" + nodoId + "]"); 
            nodoId = parseInt(n.attr("data-nodo-parent-id")); 

            if(nodoId === 0) { 
                n = $("[data-line-navigate=ok]"); 
                n.attr("stroke", "#797979"); 
                n.attr("stroke-width", "1"); 
                n.attr("data-line-navigate", ""); 
                return; 
            } else if(nodoId === vm.miMensajeAnclado.nodoId)
                return; 
            else 
                vm.iniciarLineaDialogo(nodoId); 
        }; 

        /**
        * @method :: iniciarMensajeAnclado 
        * @description :: Iniciar el 'nodo anclado'  
        **/
        function iniciarMensajeAnclado() { 
            if(!$anclar || !vm.miMensajeAnclado.nodoId) { 
                var m = $("#main > .svg-mapa"); 
                m.find("svg").attr("height", 600); 
                $("#main").css("height", "600px");
                m.css("height", "600px");
                $(".resizable-panel-container").attr("style", ""); 
                return; 
            } 
            
            var c = $("[data-nodo-id=" + vm.miMensajeAnclado.nodoId + "]"); 
            c.attr("stroke", "#000"); 
            c.attr("stroke-width", "5"); 
        };

        /**
        * @method :: iniciarMensajeNavegar 
        * @description :: Iniciar el 'nodo navegar' 
        * @param :: {boolean} iniciar, variable para verificar si se inicia el dibujo del mensaje navegar  
        **/
        function iniciarMensajeNavegar(iniciar, actualizar, accion) { 
            var n; 

            // Si se deben iniciar los controles (nodo y línea)
            // quitar el borde y color al 'nodo navegar' 
            if(iniciar) {
                n = $("[data-circle-navigate=ok]"); 
                n.attr("stroke", ""); 
                n.attr("stroke-width", ""); 
                n.attr("data-circle-navigate", ""); 
                n = $("[data-line-navigate=ok]"); 
                n.attr("stroke", "#797979"); 
                n.attr("stroke-width", "1"); 
                n.attr("data-line-navigate", ""); 
            } 

            // Si el usuario presionó una tecla
            if(accion) { 
                var nodo = !vm.miMensajeAncladoNavegar.nodoId ? vm.miMensajeAnclado : vm.miMensajeAncladoNavegar; 
                var nodoId = 0; 
                var nodoPadreId = 0; 
                var nodoNivel = 0; 
                
                switch(accion) { 
                    case "Arriba": 
                        nodoNivel = nodo.nodoNivel; 
                        nodoPadreId = nodo.nodoPadreId; 
                        
                        n = $("[data-nodo-parent-id=" + nodoPadreId + "]"); 

                        $.each(n, function(key, value) { 
                            var v = $(value); 
                            var nid = parseInt(v.attr("data-nodo-id")); 

                            if(nid === nodo.nodoId) 
                                return false; 
                            
                            nodoId = nid; 
                        }); 

                        if(nodoId === vm.miMensajeAnclado.nodoId) { 
                            nodoId = 0; 
                            vm.miMensajeAncladoNavegar = { }; 
                        }

                        break; 
                    case "Abajo": 
                        nodoNivel = nodo.nodoNivel; 
                        nodoPadreId = nodo.nodoPadreId; 
                        
                        n = $("[data-nodo-parent-id=" + nodoPadreId + "]"); 

                        $.each(n, function(key, value) { 
                            var v = $(value); 
                            var nid = parseInt(v.attr("data-nodo-id")); 
                            var nn = parseInt(v.attr("data-nodo-nivel")); 

                            if(nn > nodoNivel) { 
                                nodoId = nid; 
                                return false; 
                            } 
                        }); 

                        if(nodoId === vm.miMensajeAnclado.nodoId) { 
                            nodoId = 0; 
                            vm.miMensajeAncladoNavegar = { }; 
                        }

                        break; 
                    case "Izquierda": 
                        n = $("[data-nodo-id=" + nodo.nodoPadreId + "]"); 

                        if(n.length === 0) 
                            break; 

                        nodoId = parseInt(n.attr("data-nodo-id")); 

                        if(nodoId === vm.miMensajeAnclado.nodoId) { 
                            nodoId = 0; 

                            if(vm.miMensajeAnclado.nodoPadreId === 0) 
                                break; 
                            
                            vm.miMensajeAncladoNavegar = { }; 
                        }

                        break; 
                    case "Derecha": 
                        n = $("[data-nodo-parent-id=" + nodo.nodoId + "][data-nodo-nivel=" + nodo.nodoNivel + "]"); 

                        if(n.length === 0) 
                            break; 

                        nodoId = parseInt(n.attr("data-nodo-id"));

                        if(nodoId === vm.miMensajeAnclado.nodoId) { 
                            nodoId = 0; 
                            vm.miMensajeAncladoNavegar = { }; 
                        }
                        
                        break; 
                    default: 
                        break; 
                } 

                if(nodoId > 0) { 
                    $.each(vm.miMensajeLista, function(key, value) { 
                        if(value.nodoId === nodoId) { 
                            vm.miMensajeAncladoNavegar = value; 
                            vm.miMensajeAncladoNavegarTipoName = $sce.trustAsHtml(vm.miMensajeAncladoNavegar.tipoName ? vm.miMensajeAncladoNavegar.tipoName : ""); 
                            return false; 
                        } 
                    }); 
                } 

                if(vm.miMensajeAncladoNavegar.nodoId) { 
                    n = $("[data-nodo-id=" + vm.miMensajeAncladoNavegar.nodoId + "]"); 
                    n.attr("stroke", "#18ffff"); 
                    n.attr("stroke-width", "5"); 
                    n.attr("data-circle-navigate", "ok"); 

                    if(vm.miMensajeAncladoNavegar.sessionId > vm.miMensajeAnclado.sessionId) 
                        vm.iniciarLineaDialogo(vm.miMensajeAncladoNavegar.nodoId); 
                } 
            } 

            if(actualizar) 
                $scope.$apply(); 
        }; 

        /** 
        * @method :: onBtnMensajeAncladoNavegarResponderClick. 
        * @description :: Inicia los controles de la respuesta a un mensaje 'navegar'. 
        **/ 
        function onBtnMensajeAncladoNavegarResponderClick() { 
            $anclar = true; 
            var nodoId = vm.miMensajeAncladoNavegar.nodoId; 
            vm.miMensajeAncladoNavegar = { }; 
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
            vm.onMensajeAnclarClick(nodoId); 
            vm.iniciarMensajeAnclado(); 
            vm.mensajeResponder = true; 
            $timeout(function () { $('#mensajeRespuesta').focus(); }); 
        }; 

        /** 
        * @method :: onBtnMensajeCancelarClick 
        * @description ::  Inicia los controles de la respuesta a un mensaje 
        **/ 
        function onBtnMensajeCancelarClick() { 
            vm.mensajeResponder = false; 
            vm.mensajeRespuesta = ""; 
            vm.formMensaje.mensajeRespuesta.$pristine = true; 
            vm.mensajeRespuestaSelection = []; 
            vm.mensajeRespuestaTipo = ""; 
            vm.mensajeRespuestaTipoId = ""; 
            vm.mensajeRespuestaTipoName = $sce.trustAsHtml(""); 
            vm.mensajeRespuestaTipoNameMarca = ""; 
            $("#x").css("opacity", "1"); 
        }; 

        /** 
        * @method :: onBtnMensajeEnviarClick 
        * @description :: Función para mandar POST que crea un nuevo mensaje. 
        **/ 
        function onBtnMensajeEnviarClick() { 
            // Si se está procesando retornar 
            if(vm.procesando) 
                return; 

            vm.procesando = true; 

            // Si el mensaje no tiene sesión, actualizar mi sesión 
            if(vm.miMensajeAnclado.sessionId === parent.vm.miSessionId) 
                parent.vm.miSessionId++; 
            
            // Para realizar el post con csrf 
            $http.defaults.withCredentials = true; 
            $http({ 
                method: "POST", 
                url: "/mensaje/create", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": parent.vm.csrfToken 
                }, 
                data: { 
                    name: vm.mensajeRespuesta, 
                    nodoNivel: vm.miMensajeAnclado.numero_hijos + vm.miMensajeAnclado.nodoNivel, 
                    nodoPadreId: vm.miMensajeAnclado.nodoId, 
                    nodoPadreNivel: vm.miMensajeAnclado.nodoNivel, 
                    nodoPadreSessionId: vm.miMensajeAnclado.sessionId, 
                    numero_hijos: 0, 
                    parent: vm.miMensajeAnclado.id, 
                    project_id: parent.vm.miProjectId, 
                    root: false, 
                    sessionId: parent.vm.miSessionId, 
                    tipo: vm.mensajeRespuestaTipo, 
                    tipoId: vm.mensajeRespuestaTipoId, 
                    tipoName: $("#miMensajeRespuestaTipoName").html(), 
                    tipoNameMarca: vm.mensajeRespuestaTipoNameMarca 
                } 
            }).then(function(res) { 
                var d = res.data;
                vm.procesando = false; 

                // Si existe error 
                if(!d.proc) { 
                    vm.setMessage(d.proc, d.msg, "warning"); 
                    return; 
                } 

                // Preparar el objeto tarea 
                var obj = { 
                    element: vm.mensajeRespuestaTipo === "Mensaje Inicial" || vm.mensajeRespuestaTipo === "Citar" || vm.mensajeRespuestaTipo === "" ? "" : vm.mensajeRespuestaTipo, 
                    mensajeId: d.mensaje.id, 
                    tipo: vm.mensajeRespuestaTipo, 
                    tipoId: vm.mensajeRespuestaTipoId, 
                    tipoName: $("#miMensajeRespuestaTipoName").html(), 
                    tipoNameMarca: vm.mensajeRespuestaTipoNameMarca, 
                    title: vm.mensajeRespuestaMarca, 
                    usuario: parent.vm.miUser 
                }; 

                // Si es un compromiso individual crear la tarea 
                if(vm.mensajeRespuestaTipoId === "ci") { 
                    vm.onMensajeTareaCrear(obj); 
                } else if(vm.mensajeRespuestaTipoId === "ac" || 
                    vm.mensajeRespuestaTipoId === "nc" || 
                    vm.mensajeRespuestaTipoId === "db" || 
                    vm.mensajeRespuestaTipoId === "ta" || 
                    vm.mensajeRespuestaTipoId === "da") { 
                    // Preguntar si se asocia a una tarea 
                    swal({ 
                        title: "¡Atención!", 
                        text: "¿Deseas asociar este mensaje a una tarea?", 
                        type: "warning", 
                        showCancelButton: true, 
                        confirmButtonClass: "btn-success", 
                        confirmButtonText: "Sí, crear tarea", 
                        cancelButtonText: "No, cerrar", 
                        closeOnConfirm: true, 
                        closeOnCancel: true 
                    }, function(isConfirm) { 
                        if(!isConfirm) 
                            return; 
                        vm.onMensajeTareaCrear(obj); 
                    }); 
                } 

                // Iniciar controles 
                vm.onBtnMensajeCancelarClick(); 
            }).catch(function(err) { 
                vm.procesando = false; 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/mensaje/create'!", null, err); 
            }); 
        }; 

        /**
        * @method :: onBtnMensajeResponderClick 
        * @description :: Responder a un mensaje. 
        **/
        function onBtnMensajeResponderClick() { 
            vm.mensajeResponder = true; 
            $timeout(function() { 
                $('#mensajeRespuesta').focus(); 
            }); 
            $("#x").css("opacity", "0.5"); 
        }; 

        /**
        * @method :: onMensajeAnclarClick 
        * @description :: Establecer el 'nodo anclado' 
        * @param :: {integer} nodoId, identificador del nodo 
        **/
        function onMensajeAnclarClick(nodoId) { 
            // Iniciar el mensaje navegar 
            vm.miMensajeAncladoNavegar = { }; 
            vm.onBtnMensajeCancelarClick(); 

            // Si se debe anclar, Buscar en la lista de mensajes el mensaje anclado 
            // a través del id del nodo que identifica al mensaje, caso contrario 
            // iniciar el mensaje anclado 
            if($anclar) { 

                $.each(vm.miMensajeLista, function(key, value) { 
                    if(parseInt(value.nodoId) === nodoId) { 
                        vm.miMensajeAnclado = value; 
                        vm.miMensajeAncladoTipoName = $sce.trustAsHtml(vm.miMensajeAnclado.tipoName ? vm.miMensajeAnclado.tipoName : ""); 
                        return false; 
                    } 
                }); 
                
                // Verificar si el mensaje anclado tiene hijos
                if(vm.miMensajeAnclado.nodoId >= 1 && $("[data-nodo-parent-id=" + vm.miMensajeAnclado.nodoId + "]").length > 0) {
                    vm.iniciarMensajeNavegar(true, false, "Derecha"); 
                }
            } else 
                vm.miMensajeAnclado = { };

            // En el caso de anclar el mensaje, dibujar el ancla 
            //mapaDialogoDibujarAncla($anclar, vm.miMensajeAnclado); 
        };

        function onMensajeAnclarNavegar(nodoId) { 
            $.each(vm.miMensajeLista, function(key, value) { 
                if(value.nodoId !== nodoId) 
                    return true; 

                vm.miMensajeAncladoNavegar = value; 
                vm.miMensajeAncladoNavegarTipoName = $sce.trustAsHtml(vm.miMensajeAncladoNavegar.tipoName ? vm.miMensajeAncladoNavegar.tipoName : ""); 
                return false; 
            }); 

            var n = $("[data-circle-navigate=ok]"); 
            n.attr("stroke", ""); 
            n.attr("stroke-width", ""); 
            n.attr("data-circle-navigate", ""); 
            n = $("[data-line-navigate=ok]"); 
            n.attr("stroke", "#797979"); 
            n.attr("stroke-width", "1"); 
            n.attr("data-line-navigate", ""); 
            n = $("[data-nodo-id=" + vm.miMensajeAncladoNavegar.nodoId + "]"); 
            n.attr("stroke", "#18ffff"); 
            n.attr("stroke-width", "5"); 
            n.attr("data-circle-navigate", "ok"); 
            vm.iniciarLineaDialogo(vm.miMensajeAncladoNavegar.nodoId); 
        }; 

        /**
        * @method :: onMensajeMarcar
        * @description :: Inicia la respuesta del mensaje con la opción del sub-menú del mensaje cuando el usuario hace clic derecho.
        * @param :: {string} key, identificador del nodo 
        * @param :: {Object} options, datos del contenedor del texto 
        * @param :: {Object} mensaje, datos del mensaje que se responde 
        **/
        function onMensajeMarcar(key, options, mensaje) { 
            // Obtener el texto seleccionado 
            var s = window.getSelection(); 

            // Si el texto está vacío retornar 
            if(s.toString() === "") 
                return; 

            // Guardar la selección 
            vm.mensajeRespuestaSelection = window.getSelection().getRangeAt(0); 
            vm.mensajeRespuestaSelection = [ 
                [vm.mensajeRespuestaSelection.startContainer, vm.mensajeRespuestaSelection.startOffset], 
                [vm.mensajeRespuestaSelection.endContainer, vm.mensajeRespuestaSelection.endOffset] 
            ]; 

            if(mensaje === "navegar") { 
                var aux = vm.mensajeRespuestaSelection; 
                vm.onBtnMensajeAncladoNavegarResponderClick(); 
                vm.mensajeRespuestaSelection = aux; 
            } 

            // Iniciar la respuesta y la marca seleccionada 
            vm.mensajeRespuesta = ""; 
            vm.formMensaje.mensajeRespuesta.$pristine = true; 
            vm.mensajeRespuestaTipoNameMarca = $.trim(s.toString()); 

            // Obtener el elemento del diálogo 
            switch(key) { 
                case "citar": 
                    vm.mensajeRespuestaTipo = "Citar"; 
                    break; 
                case "ci": 
                    vm.mensajeRespuestaTipo = "Compromiso individual"; 
                    break; 
                case "ac": 
                    vm.mensajeRespuestaTipo = "Acuerdo de coordinación"; 
                    break; 
                case "nc": 
                    vm.mensajeRespuestaTipo = "Norma común"; 
                    break; 
                case "db": 
                    vm.mensajeRespuestaTipo = "Desacuerdo o brecha"; 
                    break; 
                case "ta": 
                    vm.mensajeRespuestaTipo = "Tarea"; 
                    break; 
                case "da": 
                    vm.mensajeRespuestaTipo = "Duda o alternativa"; 
                    break; 
                default: 
                    vm.mensajeRespuestaTipo = ""; 
                    break; 
            }

            vm.mensajeRespuestaTipoId = key; 

            // Si es una tarea, retornar 
            if(key === "ta") { 
                //vm.onBtnTareaMostrarClick(vm.miMensajeAnclado.id)
                return; 
            } 

            vm.mensajeResponder = true; 
            $timeout(function() { 
                $('#mensajeRespuesta').focus(); 
            }); 

            // Dar formato al mensaje 
            var range = document.createRange(); 
            range.setStart(vm.mensajeRespuestaSelection[0][0], vm.mensajeRespuestaSelection[0][1]); 
            range.setEnd(vm.mensajeRespuestaSelection[1][0], vm.mensajeRespuestaSelection[1][1]); 
            var s = window.getSelection();

            if(s) 
                s.removeAllRanges(); 

            s.addRange(range);  
    
            // Si no existe el rango retornar 
            if(!s.rangeCount || !s.getRangeAt) 
                return; 
                
            // Crear la marca en el texto del mensaje 
            var span = document.createElement("span"); 
            span.className = "marcar"; 
            range = s.getRangeAt(0).cloneRange(); 
            range.surroundContents(span); 
            document.desingMode = "on"; 
    
            if(range) { 
                s.removeAllRanges(); 
                s.addRange(range); 
            } 
            
            document.designMode = "off"; 
    
            // Actualizar en el texto del mensaje 
            vm.mensajeRespuestaTipoName = $sce.trustAsHtml($(".context-menu-mensaje-anclado").html().trim()); 
            $(".context-menu-mensaje-anclado").html(vm.miMensajeAnclado.name); 
            $("#x").css("opacity", "0.5"); 
        }; 

        /**
        * @method :: onMensajeTareaCrear 
        * @description :: Crea una tarea a partir de un mensaje 
        * @param :: {Object} obj, datos del mensaje que se asocian a la tarea 
        **/
        function onMensajeTareaCrear(obj) { 
            // Almacenar los datos que se enviarán al servidor 
            var tarea = { 
                associated: true, 
                drag: true, 
                element: obj.element, 
                kanban: parent.vm.miProject.kanban[0].id, 
                mensaje: obj.mensajeId, 
                project_id: parent.vm.miProject.id, 
                selectedUsuarioTask: obj.usuario, 
                tipo: "new", 
                title: obj.title, 
                usuario: obj.usuario.id, 
            }; 

            // Si existe una marca agregar 
            if(obj.respuestaMarca) { 
                tarea.respuestaMarca = obj.respuestaMarca; 
                tarea.respuestaMarcaId = obj.respuestaMarcaId; 
            }  

            $http({ 
                method: "POST", 
                url: "/tarea/create", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: tarea 
            }).then(function(res) { 
                // Se obtiene el resultado 'res' 
                var d = res.data; 
                vm.procesando = false; 

                // Si existe un error retornar 
                if(!d.proc) { 
                    setMessage(d.proc, d.msg, "warning"); 
                    return; 
                } 
            }).catch(function(err) { 
                vm.setMessage(false, "¡Se produjo un error!", null, err); 
                vm.procesando = false; 
            }); 
        }; 

        /**
        * @method :: onSocketMensajeNuevo 
        * @description :: Actualizar el mensaje enviado desde el socket 
        * @param :: {Object} data, información acerca del proceso, contiene además el nuevo mensaje  
        **/
        function onSocketMensajeNuevo(data) { 
            // Obtener los parámetros 
            var nuevoMensaje = data.nuevoMensaje; 
            var revisarSession = data.revisarSession; 
            var actualizarNodos = data.actualizarNodos; 

            // Si un nuevo usuario creo el mensaje, actualizar mi sesión
            if(parent.vm.miUser.id !== nuevoMensaje.usuario.id) 
                parent.vm.miSessionId = nuevoMensaje.sessionId + 1; 

            var dibujado = false; 

            // Verificar cada mensaje 
            $.each(vm.miMensajeLista, function(key, value) { 

                // Si encuentra el mensaje padre 
                // actualizar el número de hijos 
                if(value.id === nuevoMensaje.parent) { 
                    value.numero_hijos++; 

                    if(!revisarSession)
                        return false; 
                }

                // Si hay que revisar los nodos 
                if(revisarSession && actualizarNodos.length > 0) { 

                    $.each(actualizarNodos, function(k, v) { 
                        if(v.id === value.id) { 
                            value.nodoNivel = v.nodoNivel; 
                        } else if(v.id === value.parent) {
                            value.nodoPadreNivel = v.nodoNivel; 
                        } 

                        if(!dibujado) 
                            mapaDialogoModificarNodo(v); 
                    }); 

                    dibujado = true; 
                } 
            }); 

            //nuevoMensaje["cssvalue"] = !vm.miMensajeIntercalar; 
            //vm.miMensajeIntercalar = !vm.miMensajeIntercalar; 
            vm.miMensajeLista.push(nuevoMensaje); 
            mapaDialogoAgregarNodo(nuevoMensaje); 
            vm.iniciarMensajeAnclado(); 

            if($anclar) { 
                if(vm.miMensajeAnclado.nodoId === nuevoMensaje.nodoPadreId) { 
                    vm.miMensajeAncladoNavegar = nuevoMensaje; 
                    vm.miMensajeAncladoNavegarTipoName = $sce.trustAsHtml(vm.miMensajeAncladoNavegar.tipoName ? vm.miMensajeAncladoNavegar.tipoName : ""); 

                    var n = $("[data-circle-navigate=ok]"); 
                    n.attr("stroke", ""); 
                    n.attr("stroke-width", ""); 
                    n.attr("data-circle-navigate", ""); 
                    n = $("[data-line-navigate=ok]"); 
                    n.attr("stroke", "#797979"); 
                    n.attr("stroke-width", "1"); 
                    n.attr("data-line-navigate", ""); 
                    n = $("[data-nodo-id=" + vm.miMensajeAncladoNavegar.nodoId + "]"); 
                    n.attr("stroke", "#18ffff"); 
                    n.attr("stroke-width", "5"); 
                    n.attr("data-circle-navigate", "ok"); 
                    vm.iniciarLineaDialogo(vm.miMensajeAncladoNavegar.nodoId); 
                } 
            }

            //vm.iniciarTiempoDialogo(); 

            // Actualizar el controlador
            vm.setMessageToast("Nuevo mensaje en el diálogo"); 
            
            if($anclar && vm.miMapaSvgFocus) 
                $(".svg-mapa").focus(); 
            else 
                $(".svg-mapa").css("opacity", "0.3"); 

            $scope.$apply(); 
        }; 

    }; 

})(); 