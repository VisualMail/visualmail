(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp") 
        .controller("IndexController", IndexController); 
    
    IndexController.$inject = ["$http", "$scope", "$filter", "$sce"]; 

    function IndexController($http, $scope, $filter, $sce) { 
        var vm = this; 
        vm.activeTab = 2; 
        vm.csrfToken = null; 
        vm.messageToast = ""; 
        vm.mensajeRespuesta = ""; 
        vm.mensajeRespuestaMarca = ""; 
        vm.mensajeRespuestaSelection = []; 
        vm.mensajeRespuestaTipo = ""; 
        vm.mensajeRespuestaTipoId = ""; 
        vm.projectUserId = ""; 
        vm.projectName = ""; 
        vm.projectDateEnd = ""; 

        vm.miKanbanColumn1 = []; 
        vm.miKanbanColumn2 = []; 
        vm.miKanbanColumn3 = []; 
        vm.miKanbanColumn4 = []; 
        vm.miKanbanColumnSearch1 = ""; 
        vm.miKanbanColumnSearch2 = ""; 
        vm.miKanbanColumnSearch3 = ""; 
        vm.miKanbanColumnSearch4 = ""; 
        vm.miKanbanListaTareas = []; 
        vm.miKanbanTipoTarea = ["new", "doing", "testing", "done"]; 
        vm.miMapaSvgFocus = true; 
        vm.miMensajeIntercalar = true; 
        vm.miMensajeAnclado = { }; 
        vm.miMensajeAncladoNavegar = { }; 
        vm.miMensajeLista = []; 
        vm.miProject = { }; 
        vm.miProjectId = ""; 
        vm.miSessionId = 0; 
        vm.miUser = ""; 
        vm.miUserLista = []; 
        vm.miUserListaParticipantes = []; 
        

        vm.getQueryString = getQueryString; 
        vm.iniciarLineaDialogo = iniciarLineaDialogo; 
        vm.iniciarMensajeAnclado = iniciarMensajeAnclado; 
        vm.iniciarMensajeNavegar = iniciarMensajeNavegar; 
        vm.iniciarTiempoDialogo = iniciarTiempoDialogo; 
        vm.onActualizarTareaIndice = onActualizarTareaIndice; 
        vm.onBtnMensajeAncladoNavegarResponderClick = onBtnMensajeAncladoNavegarResponderClick; 
        vm.onBtnMensajeCancelarClick = onBtnMensajeCancelarClick; 
        vm.onBtnMensajeEnviarClick = onBtnMensajeEnviarClick; 
        vm.onKanbanBoardUpdateColumn = onKanbanBoardUpdateColumn; 
        vm.onMensajeAnclarClick = onMensajeAnclarClick; 
        vm.onMensajeMarcar = onMensajeMarcar; 
        vm.onProjectUserInit = onProjectUserInit; 
        vm.onSocketMensajeNuevo = onSocketMensajeNuevo; 
        vm.onSocketTareaActualizar = onSocketTareaActualizar; 
        vm.setMessage = setMessage; 
        vm.setMessageToast = setMessageToast; 

        init(); 

        function init() { 
            $('.datepicker').pickadate()
            // Obtener el 'id' del proyecto 
            vm.miProjectId = getQueryString("id"); 

			// Obtener el token de csrf 
			$http.get("/csrfToken").then(function(res) { 
				vm.csrfToken = res.data._csrf;  
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error en el procedimiento '/csrfToken'!", null, err); 
            }); 
            
            // Obtener el usuario que inició sesión
			$http.get("/session/getUser").then(function(res) {  
				vm.miUser = res.data.user;
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error en el procedimiento '/session/getUser'!", null, err); 
            }); 
            
            // Iniciar select2 de la lista de usuarios 'project' 
            $("#projectUser").select2();
			$("#projectUser").on("change", function() { 
                var userId = $(this).val(); 
				vm.projectUserId = userId !== null ? userId : "-1"; 
            });
            
            // Obtener los usuarios de VisualMail menos mi usuario 
            $http.get("/user/getAllEmail").then(function(resUsers) { 
                var du = resUsers.data; 

                // Verificar si no existe un error 
                if(!du.proc) { 
                    setMessage(du.proc, du.msg, undefined, "warning"); 
                    return; 
                }
                
                // Obtener la información del proyecto 
                $http({ 
                    url: "/project/getOne", 
                    method: "GET", 
                    params: { id: vm.miProjectId } 
                }).then(function(resProject) { 
                    var dp = resProject.data; 

                    // Verificar si no existe un error 
                    if(!dp.proc) { 
                        setMessage(dp.proc, dp.msg, undefined, "warning"); 
                        return; 
                    }
                    
                    // Obtener el proyecto y la lista de participantes 
                    vm.miProject = dp.project; 
                    vm.miUserListaParticipantes = vm.miProject.participants; 
    
                    // Obtener cada usuario de la lista obtenida 'usuarios' 
                    for(var i in du.users) { 
                        // Iniciar la bandera que permitira almacenar los usuarios candidatos
                        var bandera = 0; 
                        
                        // Verificar cada participante 
                        for(var j in vm.miUserListaParticipantes) { 
                            // Si el usuario ya es participante del proyecto, omitir 'bandera = 1' 
                            if(du.users[i].email === vm.miUserListaParticipantes[j].email) { 
                                bandera = 1; 
                                break; 
                            } 
                        } 
                        
                        // Si la bandera permanece en 0, añadir usuario a la lista de candidatos 
                        if(bandera === 0) 
                            vm.miUserLista.push(du.users[i]); 
                    } 

                    onProjectUserInit(); 
                    
                    /*$.each(vm.miListaParticipantes, function(key, value) { 
                        $("#selectFiltrarUsuario").append("<option value=\"" + value.id + "\" data-icon=\"" + value.imgurl + "\" class=\"left circle\">" + value.firstname + " " + value.lastname + "</option>"); 
                    });  
                    $("select").material_select(); */
                }).catch(function(err) { 
                    setMessage(false, "¡Se produjo un error en el procedimiento '/project/getOne'!", null, err); 
                }); 
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error en el procedimiento '/user/getAllEmail'!", null, err); 
            }); 

         	// Obtener los mensajes del proyecto
         	$http({ 
                url: "/mensaje/getAllProjectId", 
                method: "GET", 
                params: { id: vm.miProjectId } 
             }).then(function(res) { 
                var d = res.data; 

                // Verificar si no existe un error 
                if(!d.proc) { 
                    setMessage(d.proc, d.msg, undefined, "warning"); 
                    return; 
                } 

                 vm.miMensajeLista = d.mensaje; 
                 //vm.miSessionId = vm.miMensaje[vm.miMensaje.length - 1].sessionId + 1;
 
                // 'miMensajeIntercalar' da un valor intercalado a cada mensaje para presentarlos en formato whatsapp 
                 for(var i = 0; i < vm.miMensajeLista.length; i++) { 
                     vm.miMensajeLista[i]["cssvalue"] = !vm.miMensajeIntercalar; 
                     vm.miMensajeIntercalar = !vm.miMensajeIntercalar; 
                 }
 
                 // Dibujar el mapa del diálogo (Función en el archivo IndexController.d3.js)
                 mapaDialogoDibujar(vm.miMensajeLista);
 
                 // Establecer el primer mensaje como el mensaje anclado 
                 $anclar = true; 
                 vm.onMensajeAnclarClick(vm.miMensajeLista[0].nodoId); 
                 vm.iniciarMensajeAnclado(); 
 
                 // Iniciar el tiempo del diálogo 
                 //vm.iniciarTiempoDialogo(); 
                 //$("#ProjectControllerCargando").fadeOut(200); 
                 //$("#ProjectControllerMain").fadeIn(200); 
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error en el procedimiento '/mensaje/getAllProjectId'!", null, err); 
            }); 

            // Obtener las tareas del tablero Kanban
			$http({ 
				url: "/tarea/getAllProjectId/", 
				method: "GET", 
				params: { id: vm.miProjectId } 
            }).then(function(res) { 
                var d = res.data; 
                
                // Verificar si no existe un error 
                if(!d.proc) { 
                    setMessage(d.proc, d.msg, undefined, "warning"); 
                    return; 
                } 

                // Almacenar la lista de tareas
                vm.miKanbanListaTareas = d.tarea; 

                // Añadir cada tarea a la columna correspondiente 
                $.each(vm.miKanbanListaTareas, function(key, value) { 
                    if(value.tipo === vm.miKanbanTipoTarea[0]) {// Nuevas 
                        vm.miKanbanColumn1.push(value); 
                    }
                    else if(value.tipo === vm.miKanbanTipoTarea[1]) // Haciendo 
                        vm.miKanbanColumn2.push(value); 
                    else if(value.tipo === vm.miKanbanTipoTarea[2]) // En pruebas 
                        vm.miKanbanColumn3.push(value); 
                    else if(value.tipo === vm.miKanbanTipoTarea[3]) // Terminada 
                        vm.miKanbanColumn4.push(value); 
                }); 
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error en el procedimiento '/tarea/getAllProjectId/'!", null, err); 
            }); 

            // Expresión regular para el E-mail
            //var REGEX_EMAIL = 
                //'([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' + 
                //'(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)'; 
        }; 

        /**
        * @method :: getQueryString 
        * @description :: Obtiene una variable desde el 'queryString' 
        * @param :: {string} name, nombre de la variable 
        * @param :: {string} url, ruta del 'querySring' 
        **/
        function getQueryString(name, url) {
            if (!url)
                url = window.location.href;

            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);

            if (!results)
                return null;

            if (!results[2])
                return "";

            return decodeURIComponent(results[2].replace(/\+/g, " "));
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
                            vm.miMensajeAncladoNavegarName = $sce.trustAsHtml(vm.miMensajeAncladoNavegar.name); 
                            //$(".context-menu-mensaje-navegar").html(vm.miMensajeAncladoNavegar.name); 
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
        * @method :: iniciarTiempoDialogo 
        * @description :: Presenta el tiempo del diálogo 
        **/
        function iniciarTiempoDialogo() { 
            var date2 = new Date(vm.miMensajeLista[vm.miMensajeLista.length - 1].createdAt); 
            var date1 = new Date(vm.miMensajeLista[0].createdAt); 
            var timeDiff = Math.abs(date2.getTime() - date1.getTime()); 
            vm.tiempoDialogo = Math.ceil(timeDiff / (1000 * 60)); 
            /*var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            console.log(diffDays); 
            console.log(diffDays);*/
        }; 

        /**
        * @method :: onActualizarTareaIndice 
        * @description :: Actualizar el índice de la tarea cuando el usuario cambia la tarea posición en el tablero Kanban 
        * @param :: {string} tareaId, identificador de la tarea 
        * @param :: {integer} newColumn, el índice de la columna nueva (tipo de tarea) 
        * @param :: {integer} newCell, almacena si el usuario cambió de columna y no especificó en que celda (índice) colocar la tarea 
        * @param :: {integer} newIndex, el índice donde se posiciona la tarea 
        **/
        function onActualizarTareaIndice(tareaId, newColumn, newCell, newIndex) { 
            // Actualizar el indice da la tarea 
            $http({ 
                method: "POST", 
                url: "/tarea/updateTipo", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: {
                    id: tareaId, 
                    nuevoTipo: vm.miKanbanTipoTarea[newColumn - 1], 
                    newCell: newCell, 
                    newIndex: newIndex, 
                    usuarioId: vm.miUser.id 
                }
            }).then(function(res) { 
                // Verificar si la respuesta desde el servidor es error 
                if(!res.data.proc) 
                    setMessageToast(res.data.msg); 
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error en el procedimiento '/tarea/updateTipo'!", null, err); 
            }); 
        }; 

        /** 
        * @method :: onBtnMensajeCancelarClick 
        * @description ::  Inicia los controles de la respuesta a un mensaje 
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
        }; 

        /** 
        * @method :: onBtnMensajeCancelarClick 
        * @description ::  Inicia los controles de la respuesta a un mensaje 
        **/ 
        function onBtnMensajeCancelarClick() { 
            vm.mensajeResponder = false; 
            vm.mensajeRespuesta = ""; 
            vm.mensajeRespuestaMarca = ""; 
            vm.mensajeRespuestaSelection = []; 
            vm.mensajeRespuestaTipo = ""; 
            vm.mensajeRespuestaTipoId = ""; 
            vm.formMensaje.mensajeRespuesta.$pristine = true; 
        }; 

        /** 
        * @method :: onBtnMensajeEnviarClick 
        * @description ::  Función para mandar POST que crea un nuevo mensaje
        **/ 
        function onBtnMensajeEnviarClick() { 
            // Si se está procesando retornar 
            if(vm.procesando) 
                return; 

            vm.procesando = true; 

            // Arreglo que almacena la posición del nuevo mensaje 
            var mensajePosicion = []; 
            
            // Por cada valor de 'position' del mensaje seleccionado a responder se copia 
            for(var i = 0; i < vm.miMensajeAnclado.position.length; i++) 
                mensajePosicion.push(vm.miMensajeAnclado.position[i]); 
            
            // Ingresar el valor que le corresponde al nuevo mensaje en 'position' 
            mensajePosicion.push(vm.miMensajeAnclado.numero_hijos); 

            // Si el mensaje no tiene sesión, actualizar mi sesión 
            if(vm.miMensajeAnclado.sessionId === vm.miSessionId) 
                vm.miSessionId++; 
            
            // Para realizar el post con csrf 
            $http.defaults.withCredentials = true; 
            $http({ 
                method: "POST", 
                url: "/mensaje/create", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    name: vm.mensajeRespuesta, 
                    namePlain: vm.mensajeRespuesta, 
                    nodoNivel: vm.miMensajeAnclado.numero_hijos + vm.miMensajeAnclado.nodoNivel, 
                    nodoPadreId: vm.miMensajeAnclado.nodoId, 
                    nodoPadreNivel: vm.miMensajeAnclado.nodoNivel, 
                    nodoPadreSessionId: vm.miMensajeAnclado.sessionId, 
                    numero_hijos: 0, 
                    parent: vm.miMensajeAnclado.id, 
                    position: mensajePosicion, 
                    project_id: vm.miProjectId, 
                    respuestaMarca: vm.mensajeRespuestaMarca, 
                    respuestaMarcaId: vm.mensajeRespuestaTipoId, 
                    root: false, 
                    session: 0, 
                    sessionId: vm.miSessionId, 
                    tipo: vm.mensajeRespuestaTipo 
                } 
            }).then(function(res) { 
                var d = res.data;

                // Si existe error 
                if(!d.proc) { 
                    setMessage(d.proc, d.msg, "warning"); 
                    return; 
                } 

                var mensajeTemporal = d.mensaje; 
                mensajeTemporal["usuario"] = vm.miUser; 
                
                // Ahora se agrega el mensaje creado en el dialogo 
                // Manda el POST para añadirlo al dialogo 
                $http({ 
                    method: "POST", 
                    url: "/dialogo/update_dialogo", 
                    headers: { 
                        "Content-Type": "application/json", 
                        "X-CSRF-TOKEN": vm.csrfToken 
                    }, data: { 
                        id: vm.miProject.dialogos[0].id, 
                        mensaje: mensajeTemporal 
                    } 
                }).then(function(datadialogoupdate) { 
                    vm.procesando = false; 
                }).catch(function(err) { 
                    vm.procesando = false; 
                    setMessage(false, "¡Se produjo un error en el procedimiento '/tarea/updateTipo'!", null, err); 
                }); 
            }).catch(function(err) { 
                vm.procesando = false; 
                setMessage(false, "¡Se produjo un error en el procedimiento '/mensaje/create'!", null, err); 
            }); 
        }; 

        /**
        * @method :: onKanbanBoardUpdateColumn 
        * @description :: Función para actualizar una tarea en el tablero Kanban 
        * @param :: {integer} column, el índice de la columna original (tipo de tarea original)
        * @param :: {integer} newColumn, el índice de la columna nueva (tipo de tarea) 
        * @param :: {integer} newIndex, el índice donde se posiciona la tarea 
        * @param :: {integer} newCell, almacena si el usuario cambió de columna y no especificó en que celda (índice) colocar la tarea 
        * @param :: {Object} tarea, objeto que contiene la información de la tarea modificada 
        */
        function onKanbanBoardUpdateColumn(column, newColumn, newIndex, newCell, tarea) { 
            // Iniciar las variables auxiliares 
            var listaAuxOrigen = []; 
            var listaAuxDestino = []; 
            var i = 1; 

            // Almacenar en una variable auxiliar la columna original de la tarea 
            if(column === 1)
                listaAuxOrigen = vm.miKanbanColumn1; 
            else if(column === 2)
                listaAuxOrigen = vm.miKanbanColumn2; 
            else if(column === 3)
                listaAuxOrigen = vm.miKanbanColumn3; 
            else if(column === 4)
                listaAuxOrigen = vm.miKanbanColumn4; 

            // Modificar los índices de todas las tareas en la columna original 
            $.each(listaAuxOrigen, function(key, value) { 
                if(value.id !== tarea.id) { 
                    value.index = i++; 
                    listaAuxDestino.push(value); 
                } 
            }); 

            // Actualizar la columna original 
            if(column === 1)
                vm.miKanbanColumn1 = listaAuxDestino; 
            else if(column === 2)
                vm.miKanbanColumn2 = listaAuxDestino; 
            else if(column === 3)
                vm.miKanbanColumn3 = listaAuxDestino; 
            else if(column === 4)
                vm.miKanbanColumn4 = listaAuxDestino; 

            // Iniciar las variables auxiliares 
            listaAuxOrigen = []; 
            listaAuxDestino = []; 
            i = 1; 

            // Almacenar en una variable auxiliar la columna destino de la tarea 
            if(newColumn === 1)
                listaAuxOrigen = vm.miKanbanColumn1; 
            else if(newColumn === 2)
                listaAuxOrigen = vm.miKanbanColumn2; 
            else if(newColumn === 3)
                listaAuxOrigen = vm.miKanbanColumn3; 
            else if(newColumn === 4)
                listaAuxOrigen = vm.miKanbanColumn4; 

            // Modificar los índices de todas las tareas en la columna destino (incluida la nueva tarea) 
            $.each(listaAuxOrigen, function(key, value) { 
                if(value.index === newIndex) { 
                    listaAuxDestino.push(tarea); 
                    i++; 
                    newIndex = -1; 
                } 

                value.index = i++; 
                listaAuxDestino.push(value); 
            }); 

            // Si la nueva tarea se encuentra en la última posición de la nueva columna destino 
            if(newIndex > 0) 
                listaAuxDestino.push(tarea); 

            // Actualizar la columna destino 
            if(newColumn === 1) 
                vm.miKanbanColumn1 = listaAuxDestino; 
            else if(newColumn === 2) 
                vm.miKanbanColumn2 = listaAuxDestino; 
            else if(newColumn === 3) 
                vm.miKanbanColumn3 = listaAuxDestino; 
            else if(newColumn === 4) 
                vm.miKanbanColumn4 = listaAuxDestino; 

            setMessageToast("Tarea actualizada"); 
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
                        vm.miMensajeAncladoName = $sce.trustAsHtml(vm.miMensajeAnclado.name); 
                        /*$(document).ready(function() { 
                            $(".marcar").on("click", function() { 
                                vm.onMensajeMarcaClick($(this).attr("data-marca"), parseInt($(this).attr("data-nid"))); 
                            }); 
                        }); */
                        return false; 
                    } 
                }); 
                
                // Verificar si el mensaje anclado tiene hijos
                //console.log(vm.miMensajeAnclado.nodoId, $("[data-nodo-parent-id=" + vm.miMensajeAnclado.nodoId + "]").length); 
                if(vm.miMensajeAnclado.nodoId >= 1 && $("[data-nodo-parent-id=" + vm.miMensajeAnclado.nodoId + "]").length > 0) 
                    vm.iniciarMensajeNavegar(true, false, "Derecha"); 
            } else 
                vm.miMensajeAnclado = { };

            // En el caso de anclar el mensaje, dibujar el ancla 
            mapaDialogoDibujarAncla($anclar, vm.miMensajeAnclado); 
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

            // Iniciar la respuesta y la marca seleccionada 
            vm.mensajeRespuesta = ""; 
            vm.mensajeRespuestaMarca = $.trim(s.toString()); 

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
            if(key === "ta")
                return; 

            // Guardar la selección 
            vm.mensajeRespuestaSelection = window.getSelection().getRangeAt(0); 
            vm.mensajeRespuestaSelection = [ 
                [vm.mensajeRespuestaSelection.startContainer, vm.mensajeRespuestaSelection.startOffset], 
                [vm.mensajeRespuestaSelection.endContainer, vm.mensajeRespuestaSelection.endOffset] 
            ]; 

            vm.mensajeResponder = true; 
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
            if(vm.miUser.id !== nuevoMensaje.usuario.id) 
                vm.miSessionId = nuevoMensaje.sessionId + 1; 

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

            nuevoMensaje["cssvalue"] = !vm.miMensajeIntercalar; 
            vm.miMensajeIntercalar = !vm.miMensajeIntercalar; 
            vm.miMensajeLista.push(nuevoMensaje); 
            mapaDialogoAgregarNodo(nuevoMensaje); 
            vm.iniciarMensajeAnclado(); 

            if($anclar) { 
                if(vm.miMensajeAnclado.nodoId === nuevoMensaje.nodoPadreId) { 
                    vm.miMensajeAncladoNavegar = nuevoMensaje; 
                    //vm.miMensajeAncladoNavegarName = $sce.trustAsHtml(nuevoMensaje.name); 

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

            vm.iniciarTiempoDialogo(); 

            // Actualizar el controlador
            $scope.$apply();
            setMessageToast("Nuevo mensaje en el diálogo"); 
        }; 

        /**
        * @method :: onSocketTareaActualizar 
        * @description :: Recibe la tarea actualizada en el Kanban 
        **/
        function onSocketTareaActualizar(data) { 
            // Obtener las tareas del tablero Kanban
            $http({ 
                url: "/tarea/getTareas/", 
                method: "GET", 
                params: { id: data.obj.project_id } 
            }).then(function(res) { 
                var d = res.data; 

                // Si existe error
                if(!d.proc) { 
                    setMessage(d.proc, d.msg, "warning"); 
                    return;
                } 

                // Almacenar la lista de tareas 
                vm.miKanbanListaTareas = d.lista; 

                // Si es usuario es distinto al que modificó la tarea 
                if(vm.miUser.id !== data.usuarioId) { 
                    // Iniciar las columnas 
                    vm.miKanbanColumn1 = []; 
                    vm.miKanbanColumn2 = []; 
                    vm.miKanbanColumn3 = []; 
                    vm.miKanbanColumn4 = []; 

                    // Añadir cada tarea a la columna correspondiente 
                    $.each(vm.miKanbanListaTareas, function(key, value) { 
                        if(value.tipo === vm.miKanbanTipoTarea[0]) // Nuevas 
                            vm.miKanbanColumn1.push(value); 
                        else if(value.tipo === vm.miKanbanTipoTarea[1]) // Haciendo 
                            vm.miKanbanColumn2.push(value); 
                        else if(value.tipo === vm.miKanbanTipoTarea[2]) // En pruebas 
                            vm.miKanbanColumn3.push(value); 
                        else if(value.tipo === vm.miKanbanTipoTarea[3]) // Terminada 
                            vm.miKanbanColumn4.push(value); 
                    }); 

                    setMessageToast("Tarea actualizada"); 
                } else { 
                    var column = 0, newColumn = 0;  

                    // Verificar la columna origen y destino (tipo de tarea origen y destino) 
                    for(var i = 0; i < vm.miKanbanTipoTarea.length; i++) {
                        if(vm.miKanbanTipoTarea[i] === data.tipoOriginal) 
                            column = i + 1; 
                        if(vm.miKanbanTipoTarea[i] === data.nuevoTipo) 
                            newColumn = i + 1; 
                    }

                    // Actualizar el tablero kanban en el usuario que envió la tarea 
                    vm.onKanbanBoardUpdateColumn(column, newColumn, data.newIndex, data.newCell, data.obj); 
                }
            }); 
        }; 

        /**
        * @method :: setMessage 
        * @description :: Despliega un mensaje  
        * @param :: {boolean} proc, procedimiento correcto o incorrecto 
        * @param :: {string} msg, contenido del mensaje  
        * @param :: {string} state, estado del mensaje 
        * @param :: {Object} err, error del proceso 
        **/
        function setMessage(proc, msg, state, err) { 
            swal(proc ? "¡Datos registrados!" : "¡No se completó la operación!", msg, state ? state : (proc ? "success" : "error")); 

            if (err !== undefined) { 
                console.debug("Error: " + msg); 
                console.debug(err); 
                console.log(err); 
            } 
        }; 

        /**
        * @method :: setMessageToast 
        * @description :: Despliega un mensaje 
        * @param :: {string} message, contenido del mensaje  
        **/
        function setMessageToast(message) {
            vm.messageToast = message; 
            // Get the snackbar DIV
            var x = document.getElementById("snackbar"); 
        
            // Add the "show" class to DIV
            x.className = "show";
        
            // After 3 seconds, remove the show class from DIV
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        }





























        
        












        vm.onBtnProjectModalClick = onBtnProjectModalClick; 
        vm.onBtnProjectGuardarClick = onBtnProjectGuardarClick; 
        vm.onBtnProjectAgregarParticipanteClick = onBtnProjectAgregarParticipanteClick; 

        function onBtnProjectModalClick() { 
            vm.projectName = vm.miProject.name; 
            vm.projectDateEnd = vm.miProject.projectDateEnd; 
            $("#modalProject").modal("show"); 
        }; 
    
        /**
        * @method :: onBtnProjectGuardarClick 
        * @description :: Función para mandar POST que actualiza los datos del proyecto
        **/
        function onBtnProjectGuardarClick() { 
            // Verificar que los datos estén correctos 
            if(vm.projectName === "" && (vm.projectDateEnd === "" || vm.projectDateEnd === null)) 
                return; 
            else { 
                // Actualizar el nombre del proyecto para la vista 
                if(vm.miProyectoEditar.nombre === "") 
                    vm.miProyectoEditar.nombre = vm.miProyecto.name; 
                
                // Actualizar la fecha para la vista 
                if((vm.miProyectoEditar.fechaLimite === "" || vm.miProyectoEditar.fechaLimite === null)) 
                    vm.miProyectoEditar.fechaLimite = vm.miProyecto.finish_date; 
                
                $http({ 
                    method: "POST", 
                    url: "/project/editarproyecto", 
                    headers: { 
                        "Content-Type": "application/json", 
                        "X-CSRF-TOKEN": vm.csrfToken 
                    }, 
                    data: { 
                        id: vm.miProyecto.id, 
                        name: vm.miProyectoEditar.nombre, 
                        finish_date: vm.miProyectoEditar.fechaLimite 
                    } 
                }).then(function(resultado) { 
                    var d = resultado.data; 
                    
                    // Desplegar el mensaje 
                    setMensaje(d.mensaje); 
                    
                    // Si el servidor devuelve un valor false retornar
                    if(!d.procedimiento) 
                        return; 
                    
                    // Se actualizan los datos en el cliente y se limpian los datos
                    vm.miProyecto.name = vm.miProyectoEditar.nombre; 
                    vm.miProyecto.finish_date = vm.miProyectoEditar.fechaLimite; 
                    vm.miProyectoEditar = { nombre: "", fechaLimite: "" }; 
                }); 
            }
        }; 
        
        /** 
         * @method :: onBtnProjectAgregarParticipanteClick 
         * @description :: Función para agregar un usuario participante 
         **/ 
        function onBtnProjectAgregarParticipanteClick() { 
            $http.defaults.withCredentials = true; 
            $http({ 
                method: "POST", 
                url: "/project/add_user", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    email: vm.miListaUsuariosSeleccionado, 
                    id: vm.miProyectoId 
                } 
            }).then(function(data) { 
                // Es necesario actualizar de parte del cliente el valor de usuarios 
                // para que estos no sean seleccionados en selectize 
                // primero para cada usuario ingresado al proyecto 
                for(var i = 0; i < vm.miListaUsuariosSeleccionado.length; i++) { 
                    var bandera = 0; 
                    var position = 0; 
                    
                    // Buscar la posición de cada usuario seleccionado por selectize en 'miListaUsuarios' 
                    for(var j = 0; j < vm.miListaUsuarios.length; j++) { 
                        if(vm.miListaUsuariosSeleccionado[i] == vm.miListaUsuarios[j].id) { 
                            bandera = 1; 
                            position = j; 
                            break; 
                        } 
                    } 
                    
                    // Si el elemento es encontrado se actualizan los arreglos 
                    if(bandera == 1) { 
                        // 'miListaParticipantes' lo agrega en la primera posicion 
                        vm.miListaParticipantes.splice(0, 0, vm.miListaUsuarios[position]); 
                        
                        // y agrega el elemento a usuarios 
                        vm.miListaUsuarios.splice(position, 1); 
                    } 
                } 
                
                //Se manda mensaje al usuario 
                if(vm.miListaUsuariosSeleccionado.length === 1) 
                    setMensaje("Se agregó el nuevo usuario al proyecto"); 
                else if(vm.miListaUsuariosSeleccionado.length >= 2) 
                    setMensaje("Se agregaron los nuevos usuarios al proyecto"); 
                
                //Se actualizan y refrescan los valores de Selectize 
                vm.miListaUsuariosSelectize.clear(); 
                vm.miListaUsuariosSelectize.refreshItems(); 
            }); 
        };
            











        

        







        /**
        * @method :: onBtnTareaCrearClick 
        * @description :: Función para mandar POST y crear una tarea
        */
        function onBtnTareaCrearClick(conMensaje) { 
            // Verificar si está procesando 
            if(vm.procesando) 
                return; 
            
            vm.procesando = true; 

            // Para identificar el usuario seleccionado de Selectize 
            for(var i = 0; i < vm.miListaParticipantes.length; i++) { 
                if(vm.miListaParticipantes[i].id === vm.miKanbanSelectedTask) { 
                    vm.miKanbanSelectedUsuarioTask = vm.miListaParticipantes[i]; 
                    break; 
                } 
            } 

            // Se eliminan valores que no se utilizan del usuario 
            delete vm.miKanbanSelectedUsuarioTask.$$hashKey; 
            delete vm.miKanbanSelectedUsuarioTask.$order; 
            delete vm.miKanbanSelectedUsuarioTask.password; 

            // Almacenar los datos que se enviarán al servidor 
            var dataPost = { 
                drag: true, 
                tipo: "new", 
                kanban: vm.miProyecto.kanban[0].id, 
                usuario: vm.miKanbanSelectedUsuarioTask.id, 
                title: vm.miKanbanTareaNueva, 
                project_id: vm.miProyecto.id, 
                associated: false, 
                element: "", 
                mensaje: null, 
                selectedUsuarioTask: vm.miKanbanSelectedUsuarioTask
            }; 

            // Si es una tarea asociada al mensaje agregar los datos del mensaje 
            if(conMensaje) { 
                dataPost.associated = true; 
                dataPost.element = vm.miMensajeSeleccionado.tipo; 
                dataPost.mensaje = vm.miMensajeSeleccionado.id; 
            } 

            $http({ 
                method: "POST", 
                url: "/tarea/create", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: dataPost
            }).then(function(res) { 
                // Se reciben los valores del post 
                vm.miKanbanTareaNueva = ""; 
                vm.procesando = false; 

                // Verificar si la respuesta desde el servidor es error 
                if(!res.data.procedimiento) 
                    setMensaje(res.data.mensaje); 
            }).catch(function(err) { 
                setMensaje("¡Se produjo un error!"); 
                console.log(err); 
                vm.procesando = false; 
            }); 
        }; 









        function onProjectUserInit() { 
            var s = $("#projectUser"); 
            s.select2("data", null); 
            s.html(""); 
            var list = []; 
            
            $.each(vm.miUserLista, function(key, value) { 
                list.push({ 
                    id: value.id, 
                    text: value.firstname 
                }); 
            }); 

            s.select2({ 
                cache: false, 
                data: list, 
                placeholder: "Seleccionar una sección", 
                allowClear: true, 
                multiple: true, 
            });  
        }; 


        



        /**
        * @method :: onSocketTareaNueva 
        * @description :: Recibe las tareas creadas que envía el servidor a través del socket 
        **/
        function onSocketTareaNueva(data) { 
            // Obtener la tarea creada 
            var nuevaTarea = data.obj; 

            // Asignar el usuario responsable 
            nuevaTarea["usuario"] = data.selectedUsuarioTask; 
            vm.miKanbanListaTareas.push(nuevaTarea); 

            // Agregar en la columna 'NUEVA' del Kanban 
            vm.miKanbanColumn1.push(nuevaTarea); 

            // Actualizar el 'scope' 
            $scope.$apply(); 
            //setMessage("Se ha creado una nueva tarea"); 
        }; 

        /**
        * @method :: io.socket.get 
        * @description :: Inicializa la conexión con el soket io
        **/
        io.socket.get("/project/conectar_socket", { project_id: vm.miProjectId }, function gotResponse(body, response) { 
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
                    vm.onSocketMensajeNuevo(data); 
                    break; 
                case "TareaNueva": 
                    vm.onSocketTareaNueva(data); 
                    break; 
                case "TareaActualizar": 
                    vm.onSocketTareaActualizar(data); 
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
            if(!$anclar || !vm.miMapaSvgFocus) 
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
            
            vm.iniciarMensajeNavegar(true, true, accion); 
        };
        
    }; 
})(); 