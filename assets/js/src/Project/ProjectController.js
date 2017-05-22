(function() { 
	//"use strict"; 
    angular.module("VisualMailApp").requires.push("selectize");
    
	angular
		.module("VisualMailApp")
		.controller("ProjectController", ProjectController); 
    ProjectController.$inject = ["$scope", "$http", "$filter"]; 

	function ProjectController($scope, $http, $filter) { 
        var vm = this; 

        // Inicio variables usuario 
        vm.miSessionId = 1; 
		vm.miUsuario = []; 
        // Fin variables usuario 

        // Inicio variables proyecto
        vm.miProyecto = []; 
        vm.miProyectoEditar = { nombre: '', fechaLimite: '' }; 
        vm.miProyectoId = ""; 
        // Fin variables proyecto

        // Inicio variables usuarios candidatos y participantes
        vm.miListaParticipantes = []; 
        vm.miListaParticipantesSelectizeConfig; 
        vm.miListaUsuarios = []; 
        vm.miListaUsuariosSeleccionado = ""; 
        vm.miListaUsuariosSelectizeConfig; 
        // Fin variables usuarios candidatos y participantes

        // Inicio variables mensaje
		vm.miMensaje = []; 
		vm.miMensajeIntercalar = true; 
		vm.miMensajeRespuesta = ""; 
        vm.miMensajeSeleccionado = []; 
        vm.miMensajeSelectizeConfig; 
		vm.miMensajeTipoDialogo = [ 
			{ id: 0, title: "Duda o Alternativa" }, 
			{ id: 1, title: "Normas comunes" }, 
			{ id: 2, title: "Compromiso individual" }, 
			{ id: 3, title: "Acuerdos de Coordinación" }, 
			{ id: 4, title: "Desacuerdo o Brecha" } 
		]; 
		vm.miMensajeTipoSeleccionado = ""; 
        vm.miMensajeAnclado = "";
        vm.miMensajeAncladoNavegar = "";
        // Fin variables mensaje

        // Inicio variables kanban
        vm.miKanbanColumn1 = []; 
        vm.miKanbanColumn2 = []; 
        vm.miKanbanColumn3 = []; 
        vm.miKanbanColumn4 = []; 
        vm.miKanbanColumnSearch1 = ""; 
        vm.miKanbanColumnSearch2 = ""; 
        vm.miKanbanColumnSearch3 = ""; 
        vm.miKanbanColumnSearch4 = ""; 
        vm.miKanbanListaTareas = []; 
        vm.miKanbanResponsable; 
        vm.miKanbanSelectedTask = ""; 
        vm.miKanbanSelectedUsuarioTask = { }; 
		vm.miKanbanTareaNueva = []; 
        vm.miKanbanTipoTarea = ["new", "doing", "testing", "done"]; 
        // Fin variables kanban

        // Inicio variables date picker 
        vm.miClear = "Limpiar"; 
        vm.miClose = "Cerrar"; 
        vm.miCurrentTime = new Date();
        vm.miDays = 365; 
        vm.miDisable = [false, 1, 7]; 
        vm.miMaxDate = (new Date(vm.miCurrentTime.getTime() + (1000 * 60 * 60 * 24 * vm.miDays))).toISOString(); 
        vm.miMinDate = (new Date(vm.miCurrentTime.getTime() - (1000 * 60 * 60 * 24 * vm.miDays))).toISOString(); 
        vm.miMonth = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]; 
        vm.miMonthShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]; 
        vm.miToday = "Hoy"; 
        vm.miWeekdaysFull = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]; 
        vm.miWeekdaysLetter = ["D", "L", "M", "X", "J", "V", "S"]; 
        vm.onClose = function() { };
        vm.onOpen = function() { };
        vm.onRender = function() { };
        vm.onSet = function() { };
        vm.onStart = function() { };
        vm.onStop = function() { };
        // Fin variables date picker 

        // Inicio funciones 
        vm.getQueryString = getQueryString; 
        vm.iniciarMensajeAnclado = iniciarMensajeAnclado; 
        vm.iniciarMensajeNavegar = iniciarMensajeNavegar; 
        vm.iniciarTiempoDialogo = iniciarTiempoDialogo; 
        vm.onActualizarTareaIndice = onActualizarTareaIndice; 
        vm.onBtnActualizarProyectoClick = onBtnActualizarProyectoClick; 
        vm.onBtnAgregarParticipanteClick = onBtnAgregarParticipanteClick; 
        vm.onBtnMensajeEnviarClick = onBtnMensajeEnviarClick; 
        vm.onBtnTareaCrearClick = onBtnTareaCrearClick; 
        vm.onKanbanBoardUpdateColumn = onKanbanBoardUpdateColumn; 
        vm.onMensajeAnclarClick = onMensajeAnclarClick; 
        vm.onMensajeModalShow = onMensajeModalShow; 
        vm.onSocketMensajeNuevo = onSocketMensajeNuevo; 
        vm.onSocketTareaActualizar = onSocketTareaActualizar; 
        vm.onSocketTareaNueva = onSocketTareaNueva; 
        vm.setMensaje = setMensaje; 
        // Fin funciones 

        init(); 

        /**
        * @method :: init 
        * @description :: Función inicial que se llama cuando carga el controlador 
        **/
        function init() { 
            // Obtener el 'id' del proyecto 
            vm.miProyectoId = getQueryString("id"); 
            
            // Iniciar 'datepicker' 
            $(".datepicker").pickadate({ 
                selectMonths: true, // Creates a dropdown to control month 
                selectYears: 15 // Creates a dropdown of 15 years to control year 
            }); 

			// Obtener el token de csrf 
			$http.get("/csrfToken").then(function(token) { 
				vm.csrfToken = token.data._csrf;  
			});

			// Obtener el usuario que inició sesión
			$http.get("/session/getUser").then(function(resultado) {  
				vm.miUsuario = resultado.data.user;
			});
            
            // Obtener los usuarios de VisualMail menos mi usuario 
            $http.get("/user/getAllEmail").then(function(usuarios) { 

                // Obtener la información del proyecto
                $http({ 
                    url: "/project/getOne", 
                    method: "GET", 
                    params: { id: vm.miProyectoId } 
                })
                .then(function(proyecto) {
                    
                    // Obtener el proyecto y la lista de participantes
                    vm.miProyecto = proyecto.data.project; 
                    vm.miListaParticipantes = vm.miProyecto.participants; 

                    // Obtener cada usuario de la lista obtenida 'usuarios'
                    for(i in usuarios.data.arr) { 

                        // Iniciar la bandera que permitira almacenar los usuarios candidatos
                        var bandera = 0; 

                        // Verificar cada participante
                        for(j in vm.miListaParticipantes) { 

                            // Si el usuario ya es participante del proyecto, omitir 'bandera = 1'
                            if(usuarios.data.arr[i].email === vm.miListaParticipantes[j].email) { 
                                bandera = 1; 
                                break; 
                            } 
                        } 

                        // Si la bandera permanece en 0, añadir usuario a la lista de candidatos
                        if(bandera === 0) 
                            vm.miListaUsuarios.push(usuarios.data.arr[i]); 
                    } 

                    $.each(vm.miListaParticipantes, function(key, value) { 
                        $("#selectFiltrarUsuario").append(
                            "<option value=\"" + value.id + "\" data-icon=\"" + value.imgurl + "\" class=\"left circle\">" + value.firstname + " " + value.lastname + "</option>");
                    }); 

                    $("select").material_select();
                });
      		});

         	// Obtener los mensajes del proyecto
         	$http({ 
               url: "/mensaje/getMessages", 
               method: "GET", 
               params: { id: vm.miProyectoId } 
            })
            .then(function(resultado) { 
                vm.miMensaje = resultado.data.mensaje; 
                vm.miSessionId = vm.miMensaje[vm.miMensaje.length - 1].sessionId + 1;

               // 'miMensajeIntercalar' da un valor intercalado a cada mensaje para presentarlos en formato whatsapp 
				for(var i = 0; i < vm.miMensaje.length; i++) { 
					vm.miMensaje[i]["cssvalue"] = !vm.miMensajeIntercalar; 
					vm.miMensajeIntercalar = !vm.miMensajeIntercalar; 
				}

                // Dibujar el mapa del diálogo
                mapaDialogoDibujar(vm.miMensaje);

                // Establecer el primer mensaje como el mensaje anclado 
                $anclar = true; 
                onMensajeAnclarClick(vm.miMensaje[0].nodoId); 
                iniciarMensajeAnclado(); 

                // Iniciar el tiempo del diálogo 
                vm.iniciarTiempoDialogo(); 
                $("#ProjectControllerCargando").fadeOut(200); 
                $("#ProjectControllerMain").fadeIn(200); 
            });

            // Obtener las tareas del tablero Kanban
			$http({ 
				url: "/tarea/getTareas/", 
				method: "GET", 
				params: { id: vm.miProyectoId } 
            })
            .then(function(resultado) { 

            	// Si existe error
            	if(resultado.data.tarea === "false") 
                    return;

                // Almacenar la lista de tareas
                vm.miKanbanListaTareas = resultado.data.tarea; 

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
            }); 

            // Expresión regular para el E-mail
            var REGEX_EMAIL = 
                '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' + 
                '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)'; 

            // Iniciar la configuración de 'miListaParticipantesSelectizeConfig' selectize 
            vm.miListaParticipantesSelectizeConfig = { 
                create: false, 
                persist: false, 
                maxItems: 1, 
                valueField: "id", 
                labelField: "firstname", 
                delimiter: "|", 
                placeholder: "Hacer responsable", 
                searchField: ["firstname", "email", "rut"], 
                createFilter: function(input) { 
                    var match, regex; 

                    regex = new RegExp('^' + REGEX_EMAIL + '$', 'i'); 
                    match = input.match(regex); 

                    if(match) 
                        return !this.options.hasOwnProperty(match[0]); 

                    regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'); 
                    match = input.match(regex); 

                    if(match) 
                        return !this.options.hasOwnProperty(match[2]); 

                    return false; 
                }, 
                render: { 
                    item: function(item, escape) { 
                        return '<div>' + 
                            (item.firstname ? '<span class="name">' + escape(item.firstname + ' , ') + '</span>' : '') + 
                            (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') + 
                            '</div>'; 
                    }, 
                    option: function(item, escape) { 
                        var label = item.firstname || item.email; 
                        var caption = item.firstname ? item.email : null; 
                        return '<div>' + 
                            '<span class="label">' + escape(label + ' , ') + '</span>' + 
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') + 
                            '</div>'; 
                    }
                }, 

                //Funciones para actualizar la lista 
                onInitialize: function(selectize) { 
                    vm.miKanbanSelectize = selectize; 
                }, 
                onItemRemove: function(value) { 
                    vm.miListaParticipantes.splice(0, 0, value);
                    vm.miKanbanSelectedTask = ""; 
                    vm.miKanbanSelectedUsuarioTask = { }; 
                    vm.miKanbanSelectize.refreshItems(); 
                }, 
                onItemAdd: function(value, item) { 
                    vm.miKanbanSelectedTask = value; 
                }, 
                onDropdownOpen: function(dropdown) { 
                    vm.miKanbanSelectize.clear(); 
                    vm.miKanbanSelectize.refreshItems(); 
                } 
            }; 

            // Iniciar la configuración de 'miListaUsuariosSelectizeConfig' selectize 
            vm.miListaUsuariosSelectizeConfig = { 
                create: false, 
                persist: false, 
                valueField: "id", 
                labelField: "firstname", 
                delimiter: "|", 
                placeholder: "Seleccione un participante por nombre, rut o correo", 
                searchField: ["firstname", "email", "rut"], 
                createFilter: function(input) { 
                    var match, regex; 

                    regex = new RegExp('^' + REGEX_EMAIL + '$', 'i'); 
                    match = input.match(regex); 

                    if(match) 
                        return !this.options.hasOwnProperty(match[0]); 

                    regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'); 
                    match = input.match(regex); 

                    if(match) 
                        return !this.options.hasOwnProperty(match[2]); 

                    return false; 
                }, 
                render: { 
                    item: function(item, escape) { 
                        return '<div>' + 
                            (item.firstname ? '<span class="name">' + escape(item.firstname + ' , ') + '</span>' : '') + 
                            (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') + 
                            '</div>'; 
                    }, 
                    option: function(item, escape) { 
                        var label = item.firstname || item.email; 
                        var caption = item.firstname ? item.email : null; 
                        return '<div>' + 
                            '<span class="label">' + escape(label + ' , ') + '</span>' + 
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') + 
                            '</div>'; 
                    } 
                }, 
                onInitialize: function(selectize) { 
                    // Funciones para actualizar la lista al iniciar 
                    vm.miListaUsuariosSelectize = selectize; 
                }, 
                onItemRemove: function(value) { 
                    // Al remover un elemento 
                    vm.miListaUsuarios.splice(0, 0, value); 
                    vm.miListaUsuariosSelectize.selectize.refreshItems(); 
                } 
            }; 

            // Iniciar la configuración de 'miMensajeSelectizeConfig' selectize 
            vm.miMensajeSelectizeConfig = { 
                create: false, 
                persist: false, 
                maxItems: 1, 
                valueField: "title", 
                labelField: "title", 
                delimiter: "|", 
                placeholder: "Tipo de elemento del diálogo", 
                searchField: ["title"], 
                onInitialize: function(selectize) { 
                    vm.miMensajeSelectize = selectize; 
                }, 
                onDropdownOpen: function(dropdown) { 
                    vm.miMensajeSelectize.clear(); 
                    vm.miMensajeSelectize.refreshItems(); 
                }, 
                onItemRemove: function(value) { 
                    vm.miMensajeTipoDialogo.splice(0, 0, value); 
                    vm.miMensajeTipoSeleccionado = ""; 
                    vm.miMensajeSelectize.refreshItems(); 
                }, 
                onItemAdd: function(value, item) { 
                    vm.miMensajeTipoSeleccionado = value; 
                } 
            }; 
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
        * @method :: iniciarMensajeAnclado 
        * @description :: Iniciar el 'nodo anclado'  
        **/
        function iniciarMensajeAnclado() { 
            if($anclar && vm.miMensajeAnclado !== "") { 
                var c = $("[data-nodo-id=" + vm.miMensajeAnclado.nodoId + "]");
                c.attr("stroke", "#000"); 
                c.attr("stroke-width", "5"); 
                
                vm.miMensajeAncladoFinal = false; 

                if(vm.miMensajeAnclado.nodoId > 1 && $("[data-nodo-parent-id=" + vm.miMensajeAnclado.nodoId + "]").length === 0)
                    vm.miMensajeAncladoFinal = true; 
            } 
        };

        /**
        * @method :: iniciarMensajeNavegar 
        * @description :: Iniciar el 'nodo navegar' 
        * @param :: {boolean} iniciar, variable para verificar si se inicia el dibujo del mensaje navegar  
        **/
        function iniciarMensajeNavegar(iniciar, actualizar) {
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

            // Si el mensaje 'nodo navegar' existe 
            // marcar el borde y el color al nuevo 'nodo navegar' 
            if(vm.miMensajeAncladoNavegar !== "") {
                var nodoNavegarId = vm.miMensajeAncladoNavegar.nodoId; 
                var nodoNavegarOk = false; 

                do { 
                    if(!nodoNavegarOk) { 
                        n = $("[data-nodo-id=" + vm.miMensajeAncladoNavegar.nodoId + "]"); 
                        n.attr("stroke", "#18ffff"); 
                        n.attr("stroke-width", "5"); 
                        n.attr("data-circle-navigate", "ok"); 
                        nodoNavegarOk = true; 
                    } 

                    n = $("[data-line-nodo-id=" + nodoNavegarId + "]"); 
                    n.attr("stroke", "#18ffff");
                    n.attr("stroke-width", "4"); 
                    n.attr("data-line-navigate", "ok"); 
                    nodoNavegarId = parseInt($("[data-nodo-id=" + nodoNavegarId + "]").attr("data-nodo-parent-id")); 
                } while(nodoNavegarId !== vm.miMensajeAnclado.nodoId); 
            }

            if(actualizar) 
                $scope.$apply(); 
        }; 


        function iniciarTiempoDialogo() { 
            var date2 = new Date(vm.miMensaje[vm.miMensaje.length - 1].createdAt); 
            var date1 = new Date(vm.miMensaje[0].createdAt); 
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
                    usuarioId: vm.miUsuario.id 
                }
            })
            .then(function(respuesta) { 
                // Verificar si la respuesta desde el servidor es error 
                if(!respuesta.data.procedimiento) 
                    setMensaje(respuesta.data.mensaje); 
            }); 
        }; 
        
        /**
        * @method :: onBtnActualizarProyectoClick 
        * @description :: Función para mandar POST que actualiza los datos del proyecto
        **/
        function onBtnActualizarProyectoClick() { 

            // Verificar que los datos estén correctos
            if(vm.miProyectoEditar.nombre === "" && 
                (vm.miProyectoEditar.fechaLimite === "" || vm.miProyectoEditar.fechaLimite === null)) 
                return; 
            else { 
                // Actualizar el nombre del proyecto para la vista
                if(vm.miProyectoEditar.nombre === "") 
                    vm.miProyectoEditar.nombre = vm.miProyecto.name;

                // Actualizar la fecha para la vista
                if((vm.miProyectoEditar.fechaLimite === "" || 
                    vm.miProyectoEditar.fechaLimite === null)) 
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
        * @method :: onBtnAgregarParticipanteClick 
        * @description :: Función para agregar un usuario participante
        **/
        function onBtnAgregarParticipanteClick() { 
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
            })
            .then(function(data) { 
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
		* @method :: onBtnMensajeEnviarClick 
		* @description ::  Función para mandar POST que crea un nuevo mensaje
		**/
		function onBtnMensajeEnviarClick() { 

			// Arrego que almacena la posición del nuevo mensaje
			var mensajePosicion = []; 

            // Por cada valor de 'position' del mensaje seleccionado a responder se copia 
			for(var i = 0; i < vm.miMensajeSeleccionado.position.length; i++) 
				mensajePosicion.push(vm.miMensajeSeleccionado.position[i]); 

			// Ingresar el valor que le corresponde al nuevo mensaje en 'position'
			mensajePosicion.push(vm.miMensajeSeleccionado.numero_hijos); 

			// Para realizar el post con csrf 
			$http.defaults.withCredentials = true; 

            // Si el mensaje no tiene sesión, actualizar mi sesión
            if(vm.miMensajeSeleccionado.sessionId === vm.miSessionId)
                vm.miSessionId++;

			$http({
				method: "POST", 
				url: "/mensaje/create", 
				headers: { 
					"Content-Type": "application/json", 
					"X-CSRF-TOKEN": vm.csrfToken 
				}, 
				data: { 
					dialogos: vm.miProyecto.dialogos[0].id, 
					usuario: vm.miUsuario.id, 
					project_id: vm.miProyecto.id, 
					name: vm.miMensajeRespuesta, 
            		tipo: vm.miMensajeTipoSeleccionado, 
            		position: mensajePosicion, 
            		root: false, 
            		numero_hijos: 0, 
            		parent: vm.miMensajeSeleccionado.id, 
                    nodoPadreId: vm.miMensajeSeleccionado.nodoId,
                    sessionId: vm.miSessionId,
                    nodoNivel: vm.miMensajeSeleccionado.numero_hijos + vm.miMensajeSeleccionado.nodoNivel,
                    nodoPadreNivel: vm.miMensajeSeleccionado.nodoNivel,
                    nodoPadreSessionId: vm.miMensajeSeleccionado.sessionId
            	}
            })
            .then(function(respuesta) { 
                var mensajeTemporal = respuesta.data.mensaje;
                mensajeTemporal["usuario"] = vm.miUsuario; 

                // Se manda el POST para unir el mensaje nuevo con el anterior 
                $http({ 
                    method: "POST", 
                    url: "/mensaje/unir", 
                    headers: { 
                        "Content-Type": "application/json", 
                        "X-CSRF-TOKEN": vm.csrfToken 
                    }, 
                    data: { 
                        id: vm.miMensajeSeleccionado.id, 
                        idunion: mensajeTemporal.id 
                    } 
                }).then(function(datamensaje) {
                    // Ahora se agrega el mensaje creado en el dialogo 
                    // Manda el POST para añadirlo al dialogo 
                    $http({ 
                        method: "POST", 
                        url: "/dialogo/update_dialogo", 
                        headers: { 
                            "Content-Type": "application/json", 
                            "X-CSRF-TOKEN": vm.csrfToken 
                        }, 
                        data: { 
                            id: vm.miProyecto.dialogos[0].id, 
                            mensaje: mensajeTemporal
                        } 
                    })
                    .then(function(datadialogoupdate) { 
                        vm.miMensajeRespuesta = ""; 
                        var $select = $('#mensajeSelectize').selectize();
                        var control = $select[0].selectize;
                        control.clear();
                        $("#modalMensaje").modal("close");
                    }); 
                });
            });
        }; 

        /**
        * @method :: onBtnTareaCrearClick 
        * @description :: Función para mandar POST y crear una tarea
        */
        function onBtnTareaCrearClick(conMensaje) { 

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

            // Si es una tarea asociada al mensaje
            // agregar los datos del mensaje 
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
            })
            .then(function(respuesta) { 
                // Se reciben los valores del post 
                vm.miKanbanTareaNueva = ""; 

                // Verificar si la respuesta desde el servidor es error 
                if(!respuesta.data.procedimiento) 
                    setMensaje(respuesta.data.mensaje); 
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

            setMensaje("Tarea actualizada"); 
        }; 

        /**
        * @method :: onMensajeAnclarClick 
        * @description :: Establecer el 'nodo anclado' 
        * @param :: {integer} nodoId, identificador del nodo 
        **/
        function onMensajeAnclarClick(nodoId) { 
            // Iniciar el mensaje navegar 
            vm.miMensajeAncladoNavegar = ""; 

            // Si se debe anclar, Buscar en la lista de mensajes el mensaje anclado 
            // a través del id del nodo que identifica al mensaje, caso contrario 
            // iniciar el mensaje anclado 
            if($anclar) { 

                $.each(vm.miMensaje, function(key, value) { 
                    if(parseInt(value.nodoId) === nodoId) { 
                        vm.miMensajeAnclado = value; 
                        return false; 
                    } 
                }); 
                
                vm.miMensajeAncladoFinal = false; 

                if(vm.miMensajeAnclado.nodoId > 1 && $("[data-nodo-parent-id=" + vm.miMensajeAnclado.nodoId + "]").length === 0) 
                    vm.miMensajeAncladoFinal = true; 
                else {

                    $.each(vm.miMensaje, function(key, value) {
                        if(value.nodoPadreId === vm.miMensajeAnclado.nodoId) {
                            vm.miMensajeAncladoNavegar = value;
                            return false;
                        }
                    });
                    
                    vm.iniciarMensajeNavegar(true); 
                } 
            } else 
                vm.miMensajeAnclado = "";

            // En el caso de anclar el mensaje, dibujar el ancla 
            mapaDialogoDibujarAncla($anclar, vm.miMensajeAnclado); 
        };

        /**
        * @method :: onMensajeModalShow 
        * @description :: Desplegar el modal para enviar un mensaje 
        * @param :: {integer} nodoId, identificador del nodo que representa al nodo 
        * @param :: {integer} modal, identificador del elemento modal que se abrirá 
        **/
        function onMensajeModalShow(nodoId, modal) { 
            $.each(vm.miMensaje, function(key, value) { 
                if(parseInt(value.nodoId) === nodoId) { 
                    vm.miMensajeSeleccionado = value; 
                    return false; 
                } 
            });

            if(modal === 1) 
                $("#modalMensaje").modal("open"); 
            else if(modal === 2) 
                $("#modalMensajeKanban").modal("open"); 
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
            if(vm.miUsuario.id !== nuevoMensaje.usuario.id) 
                vm.miSessionId = nuevoMensaje.sessionId + 1; 

            var dibujado = false; 

            // Verificar cada mensaje 
            $.each(vm.miMensaje, function(key, value) { 

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
            vm.miMensaje.push(nuevoMensaje); 
            mapaDialogoAgregarNodo(nuevoMensaje); 
            
            vm.iniciarMensajeAnclado(); 
            vm.iniciarMensajeNavegar(false); 
            iniciarTiempoDialogo(); 

            // Actualizar el controlador
            $scope.$apply();
            setMensaje("Nuevo mensaje en el diálogo"); 
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
            })
            .then(function(resultado) { 
                // Si existe error
                if(resultado.data.tarea === "false") 
                    return;

                // Almacenar la lista de tareas 
                vm.miKanbanListaTareas = resultado.data.tarea; 

                // Si es usuario es distinto al que modificó la tarea 
                if(vm.miUsuario.id !== data.usuarioId) { 
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

                    setMensaje("Tarea actualizada"); 
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
            setMensaje("Se ha creado una nueva tarea"); 
        }; 

        /**
        * @method :: setMensaje 
        * @description :: Despliega un mensaje  
        * @param :: {string} mensaje, contenido del mensaje  
        **/
        function setMensaje(mensaje) { 
            Materialize.toast("<span>" + mensaje + "</span>", 2000); 
        }; 
        
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
        * @method :: io.socket.get 
        * @description :: Inicializa la conexión con el soket io
        **/
        io.socket.get("/project/conectar_socket", { project_id: vm.miProyectoId }, function gotResponse(body, response) { 
        	console.log("El servidor respondió con código " + response.statusCode + " y datos: ", body); 
        });

        /**
        * @method :: document.onkeydown 
        * @description :: Verifica la tecla de navegación que envía el usuario 
        **/
        document.onkeydown = function checkKey(e) {

            // Si existe un mensaje anclado capturar la tecla 
            if($anclar) {
                e = e || window.event;

                // Si no es una tecla de navegación retornar 
                if([37, 38, 39, 40].indexOf(e.keyCode) > -1) 
                    e.preventDefault();

                var iniciarControles = true; 

                if (e.keyCode == "38") {
                    // Tecla Flecha Arriba 

                    // En 'upMsg' se asigna el nodo más próximo 
                    var upMsg = ""; 

                    // Si el usuario ya navegó por el diálogo 
                    if(vm.miMensajeAncladoNavegar !== "") {

                        // Si el mensaje no está en el nivel 0 
                        if(vm.miMensajeAncladoNavegar.nodoNivel > 0) {

                            // Verificar por cada mensaje, el mensaje que está arriba del mensaje actual 
                            $.each(vm.miMensaje, function(key, value) {

                                // Si es el mensaje (nodo) hermano que está próximo, asignar 
                                if(value.nodoId !== vm.miMensajeAncladoNavegar.nodoId && 
                                    value.nodoPadreId === vm.miMensajeAncladoNavegar.nodoPadreId && 
                                    value.nodoNivel < vm.miMensajeAncladoNavegar.nodoNivel) 
                                    upMsg = value;  

                            });

                            // Si la variable 'upMsg' posee el mensaje próximo, asignar
                            if(upMsg !== "")
                                vm.miMensajeAncladoNavegar = upMsg; 

                        } else // Se limpiará el mensaje por el cual navegó el usuario 
                            iniciarControles = false;
                    }
                } else if (e.keyCode == "40") { 
                    // Tecla Flecha Abajo 

                    // Si el usuario ya navegó por el diálogo 
                    if(vm.miMensajeAncladoNavegar !== "") { 

                        // Se limpiará el mensaje por el cual navegó el usuario 
                        iniciarControles = false; 

                        // Verificar por cada mensaje, el mensaje que está debajo del mensaje actual 
                        $.each(vm.miMensaje, function(key, value) { 

                            // Si es el mensaje (nodo) hermano que está próximo, asignar 
                            if(value.nodoId !== vm.miMensajeAncladoNavegar.nodoId && 
                                value.nodoPadreId === vm.miMensajeAncladoNavegar.nodoPadreId && 
                                value.nodoNivel > vm.miMensajeAncladoNavegar.nodoNivel) { 

                                // Asignar 
                                vm.miMensajeAncladoNavegar = value; 

                                // Se iniciará el mensaje por el cuál navegó el usuario 
                                iniciarControles = true;
                                return false; 
                            } 
                        });
                    }
                } else if (e.keyCode == "37") { 
                    // Tecla Flecha Izquierda 

                    // Si el usuario ya navegó por el diálogo 
                    if(vm.miMensajeAncladoNavegar !== "") { 

                        // Si el mensaje siguiente es el padre, iniciar el mensaje por el cuál navegó el usuario 
                        if(vm.miMensajeAncladoNavegar.nodoPadreId !== vm.miMensajeAnclado.nodoId) 
                            //vm.miMensajeAncladoNavegar = ""; 
                        {

                            // Verificar por cada mensaje, el mensaje que está a la izquierda del mensaje actual 
                            $.each(vm.miMensaje, function(key, value) { 
                                if(value.nodoId === vm.miMensajeAncladoNavegar.nodoPadreId) {
                                    vm.miMensajeAncladoNavegar = value; 
                                    return false; 
                                } 
                            });
                        }
                    }
                } else if (e.keyCode == "39") {
                    // Tecla Flecha Derecha 

                    // Si el usuario no ha navegado, asignar el mensaje anclado 
                    var mensajeReferencia = (vm.miMensajeAncladoNavegar === "") ? vm.miMensajeAnclado : vm.miMensajeAncladoNavegar; 

                    // Verificar por cada mensaje, el mensaje que está a la derecha del mensaje actual 
                    $.each(vm.miMensaje, function(key, value) {
                        if(value.nodoPadreId === mensajeReferencia.nodoId) {
                            vm.miMensajeAncladoNavegar = value;
                            return false;
                        }
                    });
                }

                // Iniciar los controles 
                vm.iniciarMensajeNavegar(iniciarControles, true); 
            }
        }
	};

})(); 