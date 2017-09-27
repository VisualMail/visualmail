(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("IndexKanbanController", IndexKanbanController); 
    
        IndexKanbanController.$inject = ["$http", "$scope"]; 

    function IndexKanbanController($http, $scope) { 
        var vm = this; 
        var parent = $scope.$parent; 
        vm.kanbanTareaIdFocus = ""; 
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
        vm.tareaDeliveryDate = ""; 
        vm.tareaDescription = ""; 
        vm.tareaProfileNone = "/images/profile_none.jpeg"; 
        vm.tareaTitle = ""; 
        vm.tareaUser = ""; 
        
        vm.onActualizarTareaIndice = onActualizarTareaIndice; 
        vm.onBtnTareaCrearEditarClick = onBtnTareaCrearEditarClick; 
        vm.onBtnTareaGuardarClick = onBtnTareaGuardarClick; 
        vm.onBtnVerMensajeClick = onBtnVerMensajeClick; 
        vm.onKanbanBoardUpdateColumn = onKanbanBoardUpdateColumn; 
        vm.onSocketTareaActualizar = onSocketTareaActualizar; 
        vm.onSocketTareaNueva = onSocketTareaNueva; 
        vm.setMessage = parent.vm.setMessage; 
        vm.setMessageToast = parent.vm.setMessageToast; 

        init(); 

        function init() { 
            // Iniciar select2 tarea 
            $("#tareaUser").select2();
			$("#tareaUser").on("change", function() { 
                var userId = $(this).val(); 
				vm.tareaUser = userId !== null ? userId : "-1"; 
            });

            // Obtener las tareas del tablero Kanban
			$http({ 
				url: "/tarea/getAllProjectId/", 
				method: "GET", 
				params: { id: parent.vm.miProjectId } 
            }).then(function(res) { 
                var d = res.data; 
                
                // Verificar si no existe un error 
                if(!d.proc) { 
                    setMessage(d.proc, d.msg, "warning"); 
                    return; 
                } 

                // Almacenar la lista de tareas
                vm.miKanbanListaTareas = d.tarea; 

                // Añadir cada tarea a la columna correspondiente 
                $.each(vm.miKanbanListaTareas, function(key, value) { 
                    if(value.estado === vm.miKanbanTipoTarea[0]) // Por Hacer 
                        vm.miKanbanColumn1.push(value); 
                    else if(value.estado === vm.miKanbanTipoTarea[1]) // Haciendo 
                        vm.miKanbanColumn2.push(value); 
                    else if(value.estado === vm.miKanbanTipoTarea[2]) // En pruebas 
                        vm.miKanbanColumn3.push(value); 
                    else if(value.estado === vm.miKanbanTipoTarea[3]) // Terminada 
                        vm.miKanbanColumn4.push(value); 
                }); 

                $(".input-group.date").datepicker({ 
                    autoclose: true, 
                    format: "yyyy-mm-dd", 
                    language: "es", 
                    todayBtn: "linked", 
                    todayHighlight: true 
                }); 
                parent.vm.scopeTarea = $scope; 
            }).catch(function(err) { 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/tarea/getAllProjectId/'!", null, err); 
            });             
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
                    "X-CSRF-TOKEN": parent.vm.csrfToken 
                }, 
                data: {
                    id: tareaId, 
                    newCell: newCell, 
                    newIndex: newIndex, 
                    nuevoEstado: vm.miKanbanTipoTarea[newColumn - 1], 
                    usuarioId: parent.vm.miUser.id 
                }
            }).then(function(res) { 
                // Verificar si la respuesta desde el servidor es error 
                if(!res.data.proc) 
                    vm.setMessageToast(res.data.msg); 
            }).catch(function(err) { 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/tarea/updateTipo'!", null, err); 
            }); 
        }; 

        function onBtnTareaCrearEditarClick(nueva, item) { 
            if(!nueva) { 
                vm.tareaDeliveryDate = item.deliveryDate; 
                vm.tareaDescription = item.description; 
                vm.tareaTitle = item.title; 
                vm.tareaUser = item.usuario.id; 
            }


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
            
            for(var i = 0; i < parent.vm.miUserListaParticipantes.length; i++) { 
                if(parent.vm.miUserListaParticipantes[i].id !== vm.tareaUser) 
                    continue; 

                usuarioResponsable = parent.vm.miUserListaParticipantes[i]; 
                break; 
            } 

            // Almacenar los datos que se enviarán al servidor 
            var tarea = { 
                associated: false, 
                description: vm.tareaDescription, 
                drag: true, 
                element: "", 
                estado: "new", 
                kanban: parent.vm.miProject.kanban[0].id, 
                mensaje: null, 
                project_id: parent.vm.miProject.id, 
                selectedUsuarioTask: usuarioResponsable, 
                title: vm.tareaTitle, 
                usuario: usuarioResponsable.id, 
            }; 

            $http({ 
                method: "POST", 
                url: "/tarea/create", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": parent.vm.csrfToken 
                }, 
                data: tarea 
            }).then(function(res) { 
                // Se obtiene el resultado 'res' 
                var d = res.data; 
                vm.procesando = false; 

                // Si existe un error retornar 
                if(!d.proc) { 
                    vm.setMessage(d.proc, d.msg, "warning"); 
                    return; 
                } 

                // Iniciar datos de la tarea 
                $("#modalTarea").modal("hide"); 
                vm.tareaDescription = ""; 
                vm.formTarea.tareaDescription.$pristine = true; 
                vm.tareaTitle = ""; 
                vm.formTarea.tareaTitle.$pristine = true; 
                vm.tareaUser = ""; 
                $("#tareaUser").val("").trigger("change"); 
            }).catch(function(err) { 
                vm.setMessage(false, "¡Se produjo un error!", undefined, err); 
                vm.procesando = false; 
            }); 
        }; 

        function onBtnVerMensajeClick(nodoId) { 
            parent.vm.onActiveTabChanged(2, nodoId); 
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

            vm.setMessageToast("Tarea actualizada"); 
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
                    vm.setMessage(d.proc, d.msg, "warning"); 
                    return;
                } 

                // Almacenar la lista de tareas 
                vm.miKanbanListaTareas = d.lista; 

                // Si es usuario es distinto al que modificó la tarea 
                if(parent.vm.miUser.id !== data.usuarioId) { 
                    // Iniciar las columnas 
                    vm.miKanbanColumn1 = []; 
                    vm.miKanbanColumn2 = []; 
                    vm.miKanbanColumn3 = []; 
                    vm.miKanbanColumn4 = []; 

                    // Añadir cada tarea a la columna correspondiente 
                    $.each(vm.miKanbanListaTareas, function(key, value) { 
                        if(value.estado === vm.miKanbanTipoTarea[0]) // Nuevas 
                            vm.miKanbanColumn1.push(value); 
                        else if(value.estado === vm.miKanbanTipoTarea[1]) // Haciendo 
                            vm.miKanbanColumn2.push(value); 
                        else if(value.estado === vm.miKanbanTipoTarea[2]) // En pruebas 
                            vm.miKanbanColumn3.push(value); 
                        else if(value.estado === vm.miKanbanTipoTarea[3]) // Terminada 
                            vm.miKanbanColumn4.push(value); 
                    }); 

                    vm.setMessageToast("Tarea actualizada"); 
                } else { 
                    var column = 0, newColumn = 0;  

                    // Verificar la columna origen y destino (tipo de tarea origen y destino) 
                    for(var i = 0; i < vm.miKanbanTipoTarea.length; i++) {
                        if(vm.miKanbanTipoTarea[i] === data.estadoOriginal) 
                            column = i + 1; 
                        if(vm.miKanbanTipoTarea[i] === data.nuevoEstado) 
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

            // Actualizar el mensaje con la tarea 
            if(nuevaTarea.mensaje) 
                parent.vm.onScopeMensajeActualizarTarea(nuevaTarea.mensaje, nuevaTarea.id); 
                //$("[data-nodo-id=" + data.nodoId + "]").attr("class", "tooltipped context-menu-one-kanban");
                $(".input-group.date").datepicker({ 
                    autoclose: true, 
                    format: "yyyy-mm-dd", 
                    language: "es", 
                    todayBtn: "linked", 
                    todayHighlight: true 
                }); 
            $scope.$apply(); 
            vm.setMessageToast("Se ha creado una nueva tarea"); 
        }; 
    }; 

})(); 