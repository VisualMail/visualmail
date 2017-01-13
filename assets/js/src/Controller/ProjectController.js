var $mensaje1 = $('<span class="color_acentuado-text">Se agregó el nuevo usuario al proyecto</span>'); 
var $mensaje2 = $('<span class="color_acentuado-text">Se agregaron los nuevos usuarios al proyecto</span>'); 
var $mensaje4 = $('<span class="color_acentuado-text">Se han actualizado los cambios</span>'); 
var $mensaje5 = $('<span class="color_acentuado-text">Ocurrió un error</span>'); 
var $mensaje6 = $('<span class="color_acentuado-text">Se ha creado una nueva tarea</span>'); 
var $mensaje7 = $('<span class="color_acentuado-text">Tarea actualizada</span>'); 
var $mensaje8 = $('<span class="color_acentuado-text">Nuevo mensaje en el diálogo</span>'); 
var $listaMensajes = [];
var $anclar = false;

(function() {
	//"use strict";

	angular
		.module("app.ProjectController", [])
		.controller("ProjectController", ["$scope", "$http", ProjectController]);

	function ProjectController($scope, $http) { 
		var vm = this; 

        vm.miSessionId = 1; 
		vm.miUsuario = []; 

        // Inicio datos usuarios candidatos y participantes
        vm.miListaParticipantes = []; 
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

                // email@address.com 
                regex = new RegExp('^' + REGEX_EMAIL + '$', 'i'); 
                match = input.match(regex); 

                if(match) 
                    return !this.options.hasOwnProperty(match[0]); 

                // name <email@address.com> 
                regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'); 
                match = input.match(regex); 

                if(match) 
                    return !this.options.hasOwnProperty(match[2]); 

                return false; 
            }, render: { 
                item: function(item, escape) { 
                    return '<div>' + 
                        (item.firstname ? '<span class="name">' + escape(item.firstname+' , ') + '</span>' : '') + 
                        (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') + 
                        '</div>'; 
                }, option: function(item, escape) { 
                    var label = item.firstname || item.email; 
                    var caption = item.firstname ? item.email : null; 
                    return '<div>' + 
                        '<span class="label">' + escape(label+' , ') + '</span>' + 
                        (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') + 
                        '</div>'; 
                }
            }, 

            //Funciones para actualizar la lista 
            onInitialize: function(selectize) { 
                vm.miKanbanSelectize = selectize; 
            }, onItemRemove: function(value) { 
                vm.miListaParticipantes.splice(0, 0, value);
                vm.miKanbanSelectedTask = ""; 
                vm.miKanbanSelectedUsuarioTask = { }; 
                vm.miKanbanSelectize.refreshItems(); 
            }, onItemAdd: function(value, item) { 
                vm.miKanbanSelectedTask = value; 
            }, onDropdownOpen: function(dropdown) { 
                vm.miKanbanSelectize.clear(); 
                vm.miKanbanSelectize.refreshItems(); 
            } 
        }; 
        vm.miListaUsuarios = []; 
        vm.miListaUsuariosSeleccionado = ""; 
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

                // email@address.com 
                regex = new RegExp('^' + REGEX_EMAIL + '$', 'i'); 
                match = input.match(regex); 

                if(match) 
                    return !this.options.hasOwnProperty(match[0]); 

                // name <email@address.com>
                regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'); 
                match = input.match(regex); 

                if(match) 
                    return !this.options.hasOwnProperty(match[2]); 

                return false; 
            }, render: { 
                item: function(item, escape) { 
                    return '<div>' + 
                        (item.firstname ? '<span class="name">' + escape(item.firstname+' , ') + '</span>' : '') + 
                        (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') + 
                        '</div>'; 
                }, option: function(item, escape) { 
                    var label = item.firstname || item.email; 
                    var caption = item.firstname ? item.email : null; 
                    return '<div>' + 
                        '<span class="label">' + escape(label+' , ') + '</span>' + 
                        (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') + 
                        '</div>'; 
                } 
            }, onInitialize: function(selectize) { 
                // Funciones para actualizar la lista al iniciar 
                vm.miListaUsuariosSelectize = selectize; 
            }, onItemRemove: function(value) { 
                // Al remover un elemento 
                vm.miListaUsuarios.splice(0, 0, value); 
                vm.miListaUsuariosSelectize.selectize.refreshItems(); 
            } 
        }; 
        // Fin datos usuarios candidatos y participantes
		
        // Inicio datos mensaje
		vm.miMensaje = []; 
		vm.miMensajeIntercalar = true; 
		vm.miMensajeRespuesta = ""; 
        vm.miMensajeSeleccionado = []; 
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
            }, onDropdownOpen: function(dropdown) { 
                vm.miMensajeSelectize.clear(); 
                vm.miMensajeSelectize.refreshItems(); 
            }, onItemRemove: function(value) { 
                vm.miMensajeTipoDialogo.splice(0, 0, value); 
                vm.miMensajeTipoSeleccionado = ""; 
                vm.miMensajeSelectize.refreshItems(); 
            }, onItemAdd: function(value, item) { 
                vm.miMensajeTipoSeleccionado = value; 
            } 
        }; 
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
        // Fin datos mensaje

        // Inicio datos kanban
        vm.miKanbanListaTareas = [];
		vm.miKanbanLogitud = []; 
        vm.miKanbanResponsable; 
        vm.miKanbanSelectedTask = ""; 
        vm.miKanbanSelectedUsuarioTask = { }; 
		vm.miKanbanTareaNueva = []; 
        vm.miKanbanTipoTarea = ["new", "doing", "testing", "done"]; 
        vm.filtro1;
        vm.filtro2;
        vm.filtro3;
        vm.filtro4;
		vm.list1 = [];
		vm.list2 = [];
		vm.list3 = [];
		vm.list4 = [];
        // Fin datos kanban

        // Inicio datos proyecto
        vm.miProyecto = []; 
        vm.miProyectoEditar = { nombre: '', fechaLimite: '' }; 
        vm.miProyectoId = proyectoIdAux; 
        // Fin datos proyecto

        // Inicio date picker en editar proyecto 
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
        // Fin date picker en editar proyecto

		initialize();

        /**
        * @method :: initialize 
        * @description :: Función para iniciar los controles
        **/
		function initialize() {

			// Obtener el token de csrf 
			$http.get("/csrfToken").success(function(token) { 
				vm.csrfToken = token._csrf; 
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
                        if(bandera === 0) { 
                            vm.miListaUsuarios.push(usuarios.data.arr[i]); 
                        } 
                    } 
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
                
                dibujarDialogo(vm.miMensaje);
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

            	// Si no existe error 
            	for(var i = 0; i< resultado.data.tarea.length; i++) { 
            		// Separar cada panel del Kanban por el tipo de tarea 
            		// Nuevas tareas
            		if(resultado.data.tarea[i].tipo == vm.miKanbanTipoTarea[0]) { 
            			vm.list1.splice(0, 0, resultado.data.tarea[i]); 
            		} 

            		// Haciendo
            		if(resultado.data.tarea[i].tipo == vm.miKanbanTipoTarea[1]) { 
            			vm.list2.splice(0, 0, resultado.data.tarea[i]); 
            		} 

            		// En pruebas
            		if(resultado.data.tarea[i].tipo == vm.miKanbanTipoTarea[2]) { 
            			vm.list3.splice(0, 0, resultado.data.tarea[i]); 
                 	}  

                 	// Terminada
                 	if(resultado.data.tarea[i].tipo == vm.miKanbanTipoTarea[3]) { 
                 		vm.list4.splice(0, 0, resultado.data.tarea[i]); 
                 	} 
                 } 

                 //Guarda los largos de las listas del kanban 
                 vm.miKanbanLogitud[0] = vm.list1.length; 
                 vm.miKanbanLogitud[1] = vm.list2.length; 
                 vm.miKanbanLogitud[2] = vm.list3.length; 
                 vm.miKanbanLogitud[3] = vm.list4.length; 
            }); 
		};
        
        /**
        * @method :: onBtnActualizarProyectoClick 
        * @description :: Función para mandar POST que actualiza los datos del proyecto
        **/
        vm.onBtnActualizarProyectoClick = function() { 

            // Verificar que los datos estén correctos
            if(vm.miProyectoEditar.nombre == "" && 
                (vm.miProyectoEditar.fechaLimite == "" || 
                vm.miProyectoEditar.fechaLimite == null)) { 
                return; 
            } else { 

                // Actualizar el nombre del proyecto para la vista
                if(vm.miProyectoEditar.nombre == "") 
                    vm.miProyectoEditar.nombre = vm.miProyecto.name;

                // Actualizar la fecha para la vista
                if((vm.miProyectoEditar.fechaLimite == "" || 
                    vm.miProyectoEditar.fechaLimite == null)) 
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
                }).success(function(datanew) { 

                    // Si el servidor devuelve un valor false 
                    // se manda mensaje de que no fue posible actualizarlo en el servidor
                    if(datanew.project == "false") { 
                        Materialize.toast($mensaje5, 2000); 
                    } else { 
                        // En caso de actualizar los datos
                        Materialize.toast($mensaje4, 1000); 

                        // Se actualizan los datos en el cliente y se limpian los datos
                        vm.miProyecto.name = vm.miProyectoEditar.nombre; 
                        vm.miProyecto.finish_date = vm.miProyectoEditar.fechaLimite; 
                        vm.miProyectoEditar = {nombre: "", fechaLimite: ""}; 
                    } 
                }); 
            }
        };

        /**
        * @method :: onBtnAgregarParticipanteClick 
        * @description :: Función para agregar un usuario participante
        **/
        vm.onBtnAgregarParticipanteClick = function() { 
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
            .success(function(data) { 
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
                if(vm.miListaUsuariosSeleccionado.length == 1){ 
                    Materialize.toast($mensaje1, 500); 
                } else if(vm.miListaUsuariosSeleccionado.length >= 2) { 
                    Materialize.toast($mensaje2, 2000); 
                } 

                //Se actualizan y refrescan los valores de Selectize 
                vm.miListaUsuariosSelectize.clear(); 
                vm.miListaUsuariosSelectize.refreshItems(); 
            });
        };


		/**
		* @method :: onBtnMensajeEnviarClick 
		* @description ::  Funcion para mandar POST que crea un nuevo mensaje
		**/
		vm.onBtnMensajeEnviarClick = function() { 

			// Arrego que almacena la posición del nuevo mensaje
			var mensajePosicion = []; 

			for(var i = 0; i < vm.miMensajeSeleccionado.position.length; i++) { 
				// Por cada valor de 'position' del mensaje seleccionado a responder se copia 
				mensajePosicion.push(vm.miMensajeSeleccionado.position[i]); 
			} 

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
            .success(function(data) { 
                var mensajeTemporal = data.mensaje;
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
                        idunion: data.mensaje.id 
                    } 
                }).success(function(datamensaje) {
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
                    .success(function(datadialogoupdate) { 
                        vm.miMensajeRespuesta = ""; 
                        var $select = $('#mensajeSelectize').selectize();
                        var control = $select[0].selectize;
                        control.clear();
                        $("#modalMensaje").closeModal();
                    }); 
                });
            });
        }; 

        /**
        * @method :: onBtnTareaCrearClick 
        * @description :: Función para mandar POST y crear una tarea
        */
        vm.onBtnTareaCrearClick = function(conMensaje) { 

            // Para identificar el usuario seleccionado de Selectize 
            for(var i = 0; i < vm.miListaParticipantes.length; i++) { 
                if(vm.miListaParticipantes[i].id == vm.miKanbanSelectedTask) { 
                    vm.miKanbanSelectedUsuarioTask = vm.miListaParticipantes;
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
            .success(function(dataTarea) { 
                // Se reciben los valores del post 
                vm.miKanbanTareaNueva = ""; 

                // Verificar si la respuesta desde el servidor es error 
                if(dataTarea.tarea == "false") 
                    Materialize.toast($mensaje5, 2000); 
                else { 
                    // Si no hay error 
                    //dataTarea.tarea["usuario"] = vm.miKanbanSelectedUsuarioTask; 
                    //vm.list1.splice(0, 0, dataTarea.tarea); 
                    //Materialize.toast($mensaje6, 2000); 
                } 
            }); 
        }; 

        /**
        * @method :: onDrop 
        * @description :: Función de la API DRAG&DROP que se encarga de manejar los eventos luego de dropear una tarea del kanban
        */
        vm.onDrop = function(evt,ui) { 

            // Elemento que se tiene en el cursor 
            var obj = ui.draggable.scope().dndDragItem; 
            var dragged =-1; 
            var dropped =-1; 

            // Determinar cual participó en el drag y cual en el drop 
            // como largos tiene el valor de los tamaños de las tareas por columna 
            // se determina cual fue drageado (quien tiene menos elementos) y cual fue dropeado (quien aumento en 1 elemento) 
            // IFS DE CONSULTA: 
            if(vm.miKanbanLogitud[0] != vm.list1.length) { 
                if(vm.miKanbanLogitud[0] < vm.list1.length) 
                    dragged = 0;  
                else 
                    dropped = 0; 
            } 

            if(vm.miKanbanLogitud[1] != vm.list2.length) { 
                if(vm.miKanbanLogitud[1] < vm.list2.length) 
                    dragged = 1; 
                else 
                    dropped = 1; 
            } 

            if(vm.miKanbanLogitud[2] != vm.list3.length) { 
                if(vm.miKanbanLogitud[2] < vm.list3.length) 
                    dragged = 2; 
                else
                    dropped = 2; 
            } 

            if(vm.miKanbanLogitud[3] != vm.list4.length) { 
                if(vm.miKanbanLogitud[3] < vm.list4.length) 
                    dragged = 3; 
                else
                    dropped = 3; 
            } 

            // Se manda el post para actualizar el tipo 
            $http({ 
                method: "POST", 
                url: "/tarea/updateTipo", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    project_id: vm.miProyecto.id, 
                    nuevotipo: vm.miKanbanTipoTarea[dragged], 
                    id: obj.id 
                } 
            })
            .success(function(dataKanbanUpdate) { 

                // Bloque para manejar el error y limpiar filtros 
                if(dataKanbanUpdate.tarea === "false") { 
                    Materialize.toast($mensaje5, 2000); 
                    vm.filtro1 = ""; 
                    vm.filtro2 = ""; 
                    vm.filtro3 = ""; 
                    vm.filtro4 = ""; 
                } 
            }); 
        }; 

        /**
        * @method :: onMensajeAnclarClick 
        * @description :: Establecer el 'nodo anclado' 
        **/
        vm.onMensajeAnclarClick = function(nodoId) {
            if($anclar) {
                $.each(vm.miMensaje, function(key, value) { 
                    if(parseInt(value.nodoId) === nodoId) { 
                        vm.miMensajeAnclado = value; 
                        return false; 
                    } 
                });
            } else 
                vm.miMensajeAnclado = "";

            vm.miMensajeAncladoNavegar = "";
        };

        /**
        * @method :: onMensajeModalShow 
        * @description :: Desplegar el modal para enviar un mensaje 
        **/
        vm.onMensajeModalShow = function(nodoId, modal) { 
            $.each(vm.miMensaje, function(key, value) { 
                if(parseInt(value.nodoId) === nodoId) { 
                    vm.miMensajeSeleccionado = value; 
                    return false; 
                } 
            });

            if(modal === 1) 
                $('#modalMensaje').openModal(); 
            else if(modal === 2) 
                $('#modalMensajeKanban').openModal(); 
        };

        /**
        * @method :: iniciarMensajeAnclado 
        * @description :: Iniciar el 'nodo anclado'  
        **/
        vm.iniciarMensajeAnclado = function() { 
            if($anclar && vm.miMensajeAnclado !== "") { 
                var c = $("[data-nodo-id=" + vm.miMensajeAnclado.nodoId + "]");
                c.attr("stroke", "#000"); 
                c.attr("stroke-width", "5"); 
            } 
        };

        /**
        * @method :: iniciarMensajeNavegar 
        * @description :: Iniciar el 'nodo navegar' 
        **/
        vm.iniciarMensajeNavegar = function(iniciar) {
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
                n.attr("data-line-navigate", ""); 
            }

            // Si el mensaje 'nodo navegar' existe 
            // marcar el borde y el color al nuevo 'nodo navegar' 
            if(vm.miMensajeAncladoNavegar !== "") {
                n = $("[data-nodo-id=" + vm.miMensajeAncladoNavegar.nodoId + "]");
                n.attr("stroke", "#18ffff"); 
                n.attr("stroke-width", "4"); 
                n.attr("data-circle-navigate", "ok"); 
                n = $("[data-line-nodo-id=" + vm.miMensajeAncladoNavegar.nodoId + "]"); 
                n.attr("stroke", "#18ffff"); 
                n.attr("data-line-navigate", "ok"); 
            }

            $scope.$apply(); 
        };

        /**
        * @method :: onSocketMensajeNuevo 
        * @description :: Actualizar el mensaje enviado desde el socket 
        **/
        vm.onSocketMensajeNuevo = function(data) {            
            // Almacenar el nuevo mensaje
            var nuevoMensaje = data.obj; 
            var revisarSession = data.revisarSession; 

            // Si un nuevo usuario creo el mensaje, actualizar mi sesión
            if(vm.miUsuario.id !== nuevoMensaje.usuario.id) 
                vm.miSessionId = nuevoMensaje.sessionId + 1; 

            // Actualizar el número de hijos del mensaje padre
        	for(var i = 0; i< vm.miMensaje.length; i++) { 
        		if(vm.miMensaje[i].id === nuevoMensaje.parent) 
        			vm.miMensaje[i].numero_hijos++; 

                if(revisarSession && 
                    nuevoMensaje.sessionId === vm.miMensaje[i].sessionId && 
                    nuevoMensaje.nodoPadreId !== vm.miMensaje[i].nodoPadreId && 
                    nuevoMensaje.nodoNivel <= vm.miMensaje[i].nodoNivel) 
                    vm.miMensaje[i].nodoNivel++; 
        	} 

        	// A los mensajes se le añade el nuevo elemento creado en la parte del cliente
            nuevoMensaje["cssvalue"] = !vm.miMensajeIntercalar; 
            vm.miMensajeIntercalar = !vm.miMensajeIntercalar; 
        	vm.miMensaje.push(nuevoMensaje);

            // Dibujar el diálogo
            dibujarDialogo(vm.miMensaje); 

            // Revisar si los mensajes en las sesiones no están sobrepuestos
            //if(data.revisarSession) 
              //  sortSession(data.revisarSessionId, vm.miMensaje, nuevoMensaje); 

            vm.iniciarMensajeAnclado(); 
            vm.iniciarMensajeNavegar(false); 

            // Actualizar el controlador
            $scope.$apply();
            Materialize.toast($mensaje8, 2000); 
        }; 

        /**
        * @method :: onSocketTareaNueva 
        * @description :: Recibe las tareas creadas que envía el servidor a través del socket 
        **/
        vm.onSocketTareaNueva = function(data) { 
            // Obtener la tarea creada 
            var nuevaTarea = data.obj; 

            // Asignar el usuario responsable 
            nuevaTarea["usuario"] = data.selectedUsuarioTask; 
            vm.miKanbanListaTareas.push(nuevaTarea); 

            // Agregar en la columna 'NUEVA' del Kanban 
            vm.list1.splice(0, 0, nuevaTarea); 

            // Actualizar el 'scope' 
            $scope.$apply(); 
            Materialize.toast($mensaje6, 2000);
        }; 

        /**
        * @method :: onSocketTareaActualizar 
        * @description :: Recibe la tarea actualizada en el Kanban 
        **/
        vm.onSocketTareaActualizar = function(data) { 
            // Iniciar la lista de columnas en el Kanban
            vm.list1 = []; 
            vm.list2 = []; 
            vm.list3 = []; 
            vm.list4 = []; 

            // Actualizar la lista de tareas
            var tareaActualizada = data.obj; 

            if(vm.miKanbanListaTareas.length === 0)
                vm.miKanbanListaTareas.push(tareaActualizada); 

            $.each(vm.miKanbanListaTareas, function(key, value) { 
                // Si el 'id' corresponde a la tarea actualizada
                // modificar el 'tipo' de tarea
                if(value.id === tareaActualizada.id) 
                    value.tipo = tareaActualizada.tipo; 

                // La tarea equivale a 'new'
                if(value.tipo === vm.miKanbanTipoTarea[0]) 
                    vm.list1.splice(0, 0, value); 

                // La tarea equivale a 'doing'
                if(value.tipo === vm.miKanbanTipoTarea[1]) 
                    vm.list2.splice(0, 0, value); 

                // La tarea equivale a 'testing'
                if(value.tipo === vm.miKanbanTipoTarea[2])
                    vm.list3.splice(0, 0, value); 

                // La tarea equivale a 'done'
                if(value.tipo === vm.miKanbanTipoTarea[3]) 
                    vm.list4.splice(0, 0, value); 
            }); 
            
            //Guardar la longitud de las listas del kanban 
            vm.miKanbanLogitud[0] = vm.list1.length; 
            vm.miKanbanLogitud[1] = vm.list2.length; 
            vm.miKanbanLogitud[2] = vm.list3.length; 
            vm.miKanbanLogitud[3] = vm.list4.length; 

            // Actualizar el 'scope' 
            $scope.$apply(); 
            Materialize.toast($mensaje7, 2000); 
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
                        if(vm.miMensajeAncladoNavegar.nodoPadreId === vm.miMensajeAnclado.nodoId) 
                            vm.miMensajeAncladoNavegar = ""; 
                        else {

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
                vm.iniciarMensajeNavegar(iniciarControles); 
            }
        }
	};

})(); 