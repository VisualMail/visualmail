(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("IndexController", IndexController); 
    
    IndexController.$inject = ["$http", "$scope"]; 

    function IndexController($http, $scope) { 
        var vm = this; 
        vm.miProjectLista = []; 
        vm.miUser = {}; 
        vm.projectName = ""; 
        vm.projectDateEnd = ""; 
        vm.projectDescription = ""; 

        vm.getUserProjects = getUserProjects; 
        vm.onBtnGuardarProjectClick = onBtnGuardarProjectClick; 
        vm.onProjectClick = onProjectClick; 
        vm.setMessage = setMessage; 

        init(); 

        function init() { 
            // Inicio obtener el token csrf
            $http.get("/csrfToken").then(function(token) { 
                vm.csrfToken = token.data._csrf;  
                getUserProjects(); 
            }).catch(function(err) { 
                setMessage(false, "Se produjo un error en el procedimiento '/csrfToken'", err); 
            }); 
            // Fin obtener el token csrf 

            $(".input-group.date").datepicker({ 
                autoclose: true, 
                format: "yyyy-mm-dd", 
                language: "es", 
                todayBtn: "linked", 
                todayHighlight: true
            }); 
        }; 

        function getUserProjects() { 
            // Inicio obtener los proyectos
            $http.defaults.withCredentials = true; 
            $http({ 
                url: "/project/getUserProjects", 
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }
            }).then(function(res) { 
                vm.miUser = res.data.user; 
                vm.miProjectLista = vm.miUser.projects; 
            }).catch(function(err) { 
                setMessage(false, "Se produjo un error en el procedimiento '/project/getAllProjects'", err); 
            }); 
            // Fin obtener los proyectos
        }; 

        function onBtnGuardarProjectClick() { 
            if(vm.procesando) 
                return; 

            vm.procesando = true; 

            // Inicio guardar el proyecto 
            $http.defaults.withCredentials = true; 
            $http({ 
                url: "/project/create", 
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    owner_email: vm.miUser.email, // Email del usuario que crea el proyecto 
                    participants: vm.miUser.id, // El id del usuario 
                    name: vm.projectName, // El nombre del proyecto
                    finish_date: vm.projectDateEnd, // La fecha de término 
                    roles: [], //roles no implementado 
                    description: vm.projectDescription 
                } 
            }).then(function(res) { 
                var d = res.data; 

                if(!d.proc) { 
                    vm.procesando = false;
                    setMessage(d.proc, d.msg, undefined, "warning"); 
                    return; 
                }

                var project = d.project; 
                
                // Inicio POST para la creacion del Mensaje 
                // Si el servidor ejecuta correctamente el procedimiento 
                // entonces se crea un post para crear el mensaje inicial 
                $http({ 
                    method: "POST", 
                    url: "/mensaje/create", 
                    headers: { 
                        "Content-Type": "application/json", 
                        "X-CSRF-TOKEN": vm.csrfToken 
                    }, 
                    data: { 
                        name: project.description, // La descripción es el mensaje inicial 
                        namePlain: project.description, // La descripción es el mensaje inicial 
                        nodoNivel: 0, 
                        nodoPadreId: 0, 
                        nodoPadreNivel: 0, 
                        nodoPadreSessionId: 0, 
                        numero_hijos: 0, // Su numero de hijos 
                        parent: "", // El padre por defecto = vacio 
                        position: [0], // La posicion del mensaje en Dialog 
                        project_id: project.id, // El id del proyecto 
                        root: true, // La raiz 
                        session: 0, // El valor de sesion inicial 
                        sessionId: 0, 
                        tipo: "Mensaje Inicial", // El tipo del mensaje inicial ya que no es un elemento dialogico 
                        usuario: vm.miUser.id, //el id del usuario 
                    }
                }).then(function(resMensaje) { 
                    d = resMensaje.data; 
                    
                    // En caso de error mostrar el mensaje 
                    if(!d.proc) { 
                        vm.procesando = false;
                        setMessage(d.proc, d.msg, undefined, "warning"); 
                        return; 
                    }

                    var mensaje = d.mensaje; 
                    
                    // Inicio POST para la creacion del Diálogo 
                    // Se repiten los valores del mensaje para el inicio de Dialog ya que es un JSON con formato d3.js  
                    $http({ 
                        method: "POST", 
                        url: "/dialogo/create", 
                        headers: { 
                            "Content-Type": "application/json", 
                            "X-CSRF-TOKEN": vm.csrfToken 
                        }, 
                        data: { 
                            //Se repiten los valores del mensaje para el inicio de Dialog ya que es un JSON con formato d3.js 
                            project: project.id, 
                            name: project.description, 
                            root: true, 
                            children: [], // Aquí van, en un futuro, los mensajes hijos 
                            session: 0, 
                            numero_hijos: 0, 
                            session_actual: 0, 
                            ultimo_session_email: vm.miUser.email, // El último usuario que realizo un mensaje 
                            usuario: vm.miUser, // El objeto usuario 
                            idmensaje: mensaje.id, // El 'id' del mensaje creado 
                            parent_ultimo_respondido: mensaje.id, // El padre 'id' del mensaje (es el mismo para el primer caso) 
                        } 
                    }).then(function(resDialogo) { 
                        d = resDialogo.data; 
                        
                        // En caso de error mostrar el mensaje 
                        if(!d.proc) { 
                            vm.procesando = false;
                            setMessage(d.proc, d.msg, undefined, "warning"); 
                            return; 
                        }
                        
                        // Inicio POST para la creacion del kanban 
                        $http({ 
                            method: "POST", 
                            url: "/kanban/create", 
                            headers: { 
                                "Content-Type": "application/json", 
                                "X-CSRF-TOKEN": vm.csrfToken 
                            }, 
                            data: { 
                                project_id: project.id, // Id del proyecto 
                                project: project.id, // Id del proyecto 
                                name: "kanban: " + project.name, // Nombre del proyecto 
                            } 
                        }).then(function(resKanban) { 
                            d = resKanban.data; 

                            // En caso de error mostrar el mensaje 
                            if(!d.proc) { 
                                vm.procesando = false;
                                setMessage(d.proc, d.msg, undefined, "warning"); 
                                return; 
                            } 
                            
                            // Se agrega a la lista de proyectos en la primera posicion, 
                            // el proyecto recién creado 
                            vm.procesando = false;
                            vm.miProjectLista.splice(0, 0, project); 
                            vm.projectName = ""; 
                            vm.projectDateEnd = ""; 
                            vm.projectDescription = "";
                            vm.formProject.projectName.$pristine = true; 
                            vm.formProject.projectDescription.$pristine = true; 
                            setMessage(true, "¡Nuevo proyecto registrado!"); 
                            $("#modalProject").modal("hide"); 
                        }).catch(function(err) { 
                            vm.procesando = false;
                            setMessage(false, "Se produjo un error en el procedimiento '/kanban/create'", err); 
                        }); 
                    }).catch(function(err) { 
                        vm.procesando = false;
                        setMessage(false, "Se produjo un error en el procedimiento '/dialog/create'", err); 
                    }); 
                }).catch(function(err) { 
                    vm.procesando = false;
                    setMessage(false, "Se produjo un error en el procedimiento '/mensaje/create'", err); 
                }); 
            }).catch(function(err) { 
                vm.procesando = false;
                setMessage(false, "Se produjo un error en el procedimiento '/project/create'", err); 
            }); 
            // Fin obtener los proyectos

        }; 
        
        function onProjectClick(id) { 
            window.location = "/project/index/?id=" + id;
        }; 

        /**
        * @method :: setMessage 
        * @description :: Despliega un mensaje  
        * @param :: {boolean} proc, procedimiento correcto o incorrecto 
        * @param :: {string} msg, contenido del mensaje  
        * @param :: {Object} err, error del proceso 
        * @param :: {string} state, estado del mensaje 
        **/
        function setMessage(proc, msg, err, state) { 
            swal(proc ? "¡Datos registrados!" : "¡No se completó la operación!", msg, state ? state : (proc ? "success" : "error")); 

            if (err !== undefined) { 
                console.debug("Error: " + msg); 
                console.debug(err); 
                console.log(err); 
            } 
        }; 
    }; 
})(); 