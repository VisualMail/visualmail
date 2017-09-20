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
        
        vm.miProject = { }; 
        vm.miProjectId = ""; 
        vm.miSessionId = 0; 
        vm.miUser = ""; 
        vm.miUserLista = []; 
        vm.miUserListaParticipantes = []; 
        vm.tareaTitle = ""; 
        vm.tareaUser = ""; 
        

        vm.getQueryString = getQueryString; 
        vm.iniciarTiempoDialogo = iniciarTiempoDialogo; 
        vm.onActualizarTareaIndice = onActualizarTareaIndice; 
        vm.onBtnTareaGuardarClick = onBtnTareaGuardarClick; 
        vm.onBtnTareaMostrarClick = onBtnTareaMostrarClick; 
        vm.onKanbanBoardUpdateColumn = onKanbanBoardUpdateColumn; 
        vm.onSocketTareaActualizar = onSocketTareaActualizar; 
        vm.onSocketTareaNueva = onSocketTareaNueva; 
        vm.setMessage = setMessage; 
        vm.setMessageToast = setMessageToast; 
        vm.child = {}; 
        init(); 

        function init() { 
            // Iniciar select2 tarea 
            $("#tareaUser").select2();
			$("#tareaUser").on("change", function() { 
                var userId = $(this).val(); 
				vm.tareaUser = userId !== null ? userId : "-1"; 
            });

            // Iniciar select2 filtrar por usuario 
            $("#selectFiltrarUsuario").select2(); 

            // Iniciar datetime 
            $(".input-group.date").datepicker({ 
                autoclose: true, 
                format: "yyyy-mm-dd", 
                language: "es", 
                todayBtn: "linked", 
                todayHighlight: true 
            }); 

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

            return; 

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
        * @method :: onBtnTareaGuardarClick 
        * @description :: Función para guardar una tarea 
        */
        function onBtnTareaGuardarClick() { 
            // Verificar si está procesando 
            if(vm.procesando) 
                return; 
            
            vm.procesando = true; 

            // Seleccionar el usuario responsable 
            var usuarioResponsable = { }; 
            for(var i = 0; i < vm.miUserListaParticipantes.length; i++) { 
                if(vm.miUserListaParticipantes[i].id !== vm.tareaUser) 
                    continue; 

                usuarioResponsable = vm.miUserListaParticipantes[i]; 
                break; 
            } 

            // Se eliminan valores que no se utilizan del usuario 
            //delete vm.miKanbanSelectedUsuarioTask.$$hashKey; 
            //delete vm.miKanbanSelectedUsuarioTask.$order; 
            //delete vm.miKanbanSelectedUsuarioTask.password; 

            // Almacenar los datos que se enviarán al servidor 
            var tarea = { 
                associated: false, 
                drag: true, 
                element: "", 
                kanban: vm.miProject.kanban[0].id, 
                mensaje: null, 
                project_id: vm.miProject.id, 
                selectedUsuarioTask: usuarioResponsable, 
                tipo: "new", 
                title: vm.tareaTitle, 
                usuario: usuarioResponsable.id, 
            }; 

            // Si es una tarea asociada al mensaje agregar los datos del mensaje 
            /*if(conMensaje) { 
                dataPost.associated = true; 
                dataPost.element = vm.miMensajeSeleccionado.tipo; 
                dataPost.mensaje = vm.miMensajeSeleccionado.id; 
            } */

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

                // Iniciar datos de la tarea 
                vm.tareaTitle = ""; 
                vm.formTarea.tareaTitle.$pristine = true; 
                vm.tareaUser = ""; 
                $("#tareaUser").val("").trigger("change"); 
                $("#modalTarea").modal("hide"); 
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error!"); 
                console.log(err); 
                vm.procesando = false; 
            }); 
        }; 

        function onBtnTareaMostrarClick(mensajeId) { 

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
            setMessageToast("Se ha creado una nueva tarea"); 
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
    }; 
})(); 