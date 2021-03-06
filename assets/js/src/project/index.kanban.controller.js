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
        vm.miKanbanColumn5 = []; 
        vm.miKanbanColumnSearch1 = "";
        vm.miKanbanColumnSearch2 = "";
        vm.miKanbanColumnSearch3 = "";
        vm.miKanbanColumnSearch4 = "";
        vm.miKanbanColumnSearch5 = "";
        vm.miKanbanListaTareas = [];
        vm.miKanbanTipoTarea = ["new", "doing", "testing", "done", "discard"];
        vm.tareaDeliveryDate = "";
        vm.tareaDeliveryDateTime = "";
        vm.tareaDescription = "";
        vm.tareaEstado = ""; 
        vm.tareaId = "";
        vm.tareaInsert = true;
        vm.tareaProfileNone = "/images/profile_none.jpeg";
        vm.tareaTitle = "";
        vm.tareaUser = "";
        vm.timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; 

        vm.onActualizarTareaIndice = onActualizarTareaIndice;
        vm.onBtnTareaCrearEditarClick = onBtnTareaCrearEditarClick;
        vm.onBtnTareaDescartarClick = onBtnTareaDescartarClick; 
        vm.onBtnTareaGuardarClick = onBtnTareaGuardarClick;
        vm.onBtnTareaVerDescartadosClick = onBtnTareaVerDescartadosClick; 
        vm.onBtnVerMensajeClick = onBtnVerMensajeClick;
        vm.onKanbanBoardUpdateColumn = onKanbanBoardUpdateColumn;
        vm.onSocketTareaActualizar = onSocketTareaActualizar;
        vm.onSocketTareaActualizarTipo = onSocketTareaActualizarTipo;
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
                    else if(value.estado === vm.miKanbanTipoTarea[4]) // Descartada
                        vm.miKanbanColumn5.push(value);
                });

                $(".input-group.date").datepicker({
                    autoclose: true,
                    format: "yyyy-mm-dd",
                    language: "es",
                    todayBtn: "linked",
                    todayHighlight: true
                });
                parent.vm.scopeTarea = $scope;
                $("#projectNavBar").fadeIn(200);
            }).catch(function(err) {
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/tarea/getAllProjectId/'!", null, err);
            });

            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            h = (h < 10 ? "0" : "") + h; 
            m = (m < 10 ? "0" : "") + m; 
            vm.tareaDeliveryDateTime = h + ":" + m; 
        };

        /**
        * @method :: onActualizarTareaIndice
        * @description :: Actualizar el índice de la tarea cuando el usuario cambia la tarea posición en el tablero Kanban. 
        * @param :: {string} tareaId, identificador de la tarea. 
        * @param :: {integer} newColumn, el índice de la columna nueva (tipo de tarea). 
        * @param :: {integer} newCell, almacena si el usuario cambió de columna y no especificó en que celda (índice) colocar la tarea. 
        * @param :: {integer} newIndex, el índice donde se posiciona la tarea. 
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

        /**
        * @method :: onBtnTareaCrearEditarClick 
        * @description :: Muestra un formulario para editar una tarea. 
        * @param :: {boolean} nueva, es una tarea nueva. 
        * @param :: {Object} item, objeto con los datos de la tarea. 
        **/ 
        function onBtnTareaCrearEditarClick(nueva, item, esconder) { 
            if(esconder) 
                $('#modalDescartados').modal('hide');  
                
            vm.tareaInsert = nueva; 
            
            if(nueva) { 
                vm.tareaDeliveryDate = ""; 
                vm.formTarea.tareaDeliveryDate.$pristine = true; 
                var d = new Date(); 
                var h = d.getHours(); 
                var m = d.getMinutes(); 
                h = (h < 10 ? "0" : "") + h; 
                m = (m < 10 ? "0" : "") + m; 
                vm.tareaDeliveryDateTime = h + ":" + m; 
                vm.tareaDescription = ""; 
                vm.formTarea.tareaDescription.$pristine = true; 
                vm.tareaTitle = ""; 
                vm.formTarea.tareaTitle.$pristine = true; 
                vm.tareaUser = ""; 
                vm.tareaId = ""; 
                vm.tareaEstado = ""; 
                $("#tareaUser").val("").trigger("change"); 
            } else { 
                vm.formTarea.tareaDeliveryDate.$pristine = true; 
                vm.tareaDeliveryDate = item.deliveryDate ? item.deliveryDate : ""; 
                vm.tareaDeliveryDateTime = item.deliveryDateTime ? item.deliveryDateTime : ""; 
                vm.tareaDescription = item.description ? item.description : ""; 
                vm.tareaId = item.id; 
                vm.tareaTitle = item.title ? item.title : ""; 
                vm.tareaEstado = item.estado; 
                
                if(item.usuario) { 
                    vm.tareaUser = item.usuario.id; 
                    $("#tareaUser").val(vm.tareaUser).trigger("change"); 
                } else 
                    $("#tareaUser").val("").trigger("change"); 
            } 
            
            $("#modalTarea").modal("show");
        };

        function onBtnTareaDescartarClick() { 
            if(vm.procesando)
                return; 
            
            vm.procesando = true; 

            // Actualizar el indice da la tarea
            $http({
                method: "POST",
                url: "/tarea/updateTipo",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": parent.vm.csrfToken
                },
                data: {
                    id: vm.tareaId,
                    newCell: true,
                    newIndex: 0,
                    nuevoEstado: vm.miKanbanTipoTarea[4],
                    usuarioId: parent.vm.miUser.id
                }
            }).then(function(res) {
                vm.procesando = false; 

                // Verificar si la respuesta desde el servidor es error
                if(!res.data.proc)
                    vm.setMessageToast(res.data.msg);
                else 
                    $("#modalTarea").modal("hide");
            }).catch(function(err) {
                vm.procesando = false; 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/tarea/updateTipo'!", null, err);
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

            for(var i = 0; i < parent.vm.miUserListaParticipantes.length; i++) {
                if(parent.vm.miUserListaParticipantes[i].id !== vm.tareaUser)
                    continue;

                usuarioResponsable = parent.vm.miUserListaParticipantes[i];
                break;
            }

            // Almacenar los datos que se enviarán al servidor
            var tarea = {
                associated: false,
                deliveryDate: vm.tareaDeliveryDate, 
                deliveryDateTime: vm.tareaDeliveryDateTime, 
                description: vm.tareaDescription,
                drag: true,
                element: "",
                estado: "new",
                kanban: parent.vm.miProject.kanban[0].id,
                mensaje: null,
                nueva: vm.tareaInsert,
                project_id: parent.vm.miProject.id,
                selectedUsuarioTask: usuarioResponsable,
                title: vm.tareaTitle,
                usuario: usuarioResponsable.id ? usuarioResponsable.id : "",
            };

            if(!vm.tareaInsert)
              tarea.id = vm.tareaId;

            $http({
                method: "POST",
                url: vm.tareaInsert ? "/tarea/create" : "/tarea/update",
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
                vm.tareaDeliveryDate = "";
                vm.formTarea.tareaDeliveryDate.$pristine = true;
                vm.tareaDescription = "";
                vm.formTarea.tareaDescription.$pristine = true;
                vm.tareaTitle = "";
                vm.formTarea.tareaTitle.$pristine = true;
                vm.tareaUser = "";
                vm.tareaId = "";
                vm.tareaDeliveryDateTime = ""; 
                $("#tareaUser").val("").trigger("change");
            }).catch(function(err) {
                vm.setMessage(false, "¡Se produjo un error!", undefined, err);
                vm.procesando = false;
            });
        }; 

        function onBtnTareaVerDescartadosClick() { 
            $("#modalDescartados").modal("show"); 
        }; 

        /** 
        * @method :: onBtnVerMensajeClick 
        * @description :: Muestra el mensaje asociado a la tarea. 
        * @param :: {integer} nodoId, identificador de un nodo en el mapa. 
        **/ 
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
            else if(column === 5)
                listaAuxOrigen = vm.miKanbanColumn5;

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
            else if(column === 5)
                vm.miKanbanColumn5 = listaAuxDestino;

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
            else if(newColumn === 5)
                listaAuxOrigen = vm.miKanbanColumn5;

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
            else if(newColumn === 5)
                vm.miKanbanColumn5 = listaAuxDestino;

            vm.setMessageToast("Tarea actualizada");
        };

        /**
        * @method :: onSocketTareaActualizar
        * @description :: Recibe la tarea actualizada en el Kanban
        **/
        function onSocketTareaActualizar(data) {
            // Modificar la tarea
            var titulo = "";
            var usuarioOriginalId = "";

            for(var i = 0; i < vm.miKanbanListaTareas.length; i++) { 
                if(vm.miKanbanListaTareas[i].id !== data.obj.id) 
                    continue; 
                    
                titulo = vm.miKanbanListaTareas[i].title; 
                usuarioOriginalId = vm.miKanbanListaTareas[i].usuario ? vm.miKanbanListaTareas[i].usuario.id : ""; 
                data.obj.mensaje = vm.miKanbanListaTareas[i].mensaje; 
                data.obj.usuario = data.selectedUsuarioTask; 
                vm.miKanbanListaTareas[i] = data.obj; 
                break;
            }

            if(data.obj.estado === "new") {
                for(var i = 0; i < vm.miKanbanColumn1.length; i++) {
                    if(vm.miKanbanColumn1[i].id !== data.obj.id)
                        continue;
                    vm.miKanbanColumn1[i] = data.obj;
                    break;
                }
            } else if(data.obj.estado === "doing") {
                for(var i = 0; i < vm.miKanbanColumn2.length; i++) {
                    if(vm.miKanbanColumn2[i].id !== data.obj.id)
                        continue;
                    vm.miKanbanColumn2[i] = data.obj;
                    break;
                }
            } else if(data.obj.estado === "testing") {
                for(var i = 0; i < vm.miKanbanColumn3.length; i++) {
                    if(vm.miKanbanColumn3[i].id !== data.obj.id)
                        continue;
                    vm.miKanbanColumn3[i] = data.obj;
                    break;
                }
            } else if(data.obj.estado === "done") {
                for(var i = 0; i < vm.miKanbanColumn4.length; i++) {
                    if(vm.miKanbanColumn4[i].id !== data.obj.id)
                        continue;
                    vm.miKanbanColumn4[i] = data.obj;
                    break;
                }
            } else if(data.obj.estado === "discard") {
                for(var i = 0; i < vm.miKanbanColumn5.length; i++) {
                    if(vm.miKanbanColumn5[i].id !== data.obj.id)
                        continue;
                    vm.miKanbanColumn5[i] = data.obj;
                    break;
                }
            }

            if(parent.vm.miUser.id === data.usuarioProcedimiento) {
                vm.setMessageToast("Tarea actualizada");
                return;
            } else if(parent.vm.miUser.id !== usuarioOriginalId && parent.vm.miUser.id !== data.selectedUsuarioTask.id)
                return;

            var msg = "La tarea '" + titulo + "' de la que eres responsable, ha sido modificada";

            if(parent.vm.miUser.id !== usuarioOriginalId && parent.vm.miUser.id === data.selectedUsuarioTask.id)
                msg = "Se te asignó la tarea '" + titulo + "'";

            vm.setMessageToast(msg);
            $scope.$apply();
        };

        /**
        * @method :: onSocketTareaActualizarTipo
        * @description :: Recibe la tarea actualizada en el Kanban
        **/
        function onSocketTareaActualizarTipo(data) {
            // Obtener las tareas del tablero Kanban
            $http({
                url: "/tarea/getAllProjectId/",
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
                vm.miKanbanListaTareas = d.tarea;

                // Si es usuario es distinto al que modificó la tarea
                if(parent.vm.miUser.id !== data.usuarioId) {
                    // Iniciar las columnas
                    vm.miKanbanColumn1 = [];
                    vm.miKanbanColumn2 = [];
                    vm.miKanbanColumn3 = [];
                    vm.miKanbanColumn4 = [];
                    vm.miKanbanColumn5 = [];

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
                        else if(value.estado === vm.miKanbanTipoTarea[4]) // Descartada
                            vm.miKanbanColumn5.push(value);
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
                parent.vm.onScopeMensajeActualizarTarea(nuevaTarea.mensaje.id, nuevaTarea.id);
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
