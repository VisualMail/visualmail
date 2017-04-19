(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("IndexController", IndexController); 
    
    IndexController.$inject = ["$http", "$scope"]; 

    function IndexController($http, $scope) { 
        var vm = this; 

        // DatePicker Angular-Materialize 
        var currentTime = new Date(); 
        var days = 365; //muestra 365 posteriores y anteriores 
        vm.dateDisable = [false, 1, 7]; 
        vm.dateMaxDate = (new Date(currentTime.getTime() + ( 1000 * 60 * 60 *24 * days ))).toISOString(); 
        vm.dateMinDate = (new Date(currentTime.getTime() - ( 1000 * 60 * 60 *24 * days ))).toISOString(); 
        vm.dateMonth = [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ]; 
        vm.dateMonthShort = [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic' ]; 
        vm.dateWeekdaysFull = [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ]; 
        vm.dateWeekdaysLetter = [ 'D', 'L', 'M', 'X', 'J', 'V', 'S' ]; 
        vm.onDateClose = function () { 
        };
        vm.onDateOpen = function () { 
        };
        vm.onDateRender = function () { 
        };
        vm.onDateSet = function () { 
        };
        vm.onDateStart = function () {
        };
        vm.onDateStop = function () { 
        };
        vm.buscar = ""; 
        vm.buscarParticipo = ""; 
        vm.projectDate; 
        vm.projectName = ""; 
        vm.misProyectos = []; 
        vm.miUsuario = ""; 

        vm.getUsuarioProyectos = getUsuarioProyectos; 
        vm.onBtnCrearProyectoClick = onBtnCrearProyectoClick; 
        vm.setMensaje = setMensaje; 
        
        init(); 

        function init() { 
            
            // Inicio obtener el token csrf
            $http.get("/csrfToken").then(function(token) { 
                vm.csrfToken = token.data._csrf;  
                getUsuarioProyectos(); 
            }).catch(function(err) { 
                setMensaje("Se produjo un error en el procedimiento '/csrfToken'"); 
                console.log(err); 
            }); 
            // Fin obtener el token csrf
                
            // Iniciar los controles web
            $(document).ready(function(){ 
                // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered 
                //$('.modal-trigger').leanModal('modal_nuevo_proyecto'); 
                $(".datepicker").pickadate({ 
                    selectMonths: true, // Creates a dropdown to control month 
                    selectYears: 15 // Creates a dropdown of 15 years to control year 
                }); 

                $("#IndexControllerMain").fadeIn(200); 
            }); 
        }; 

        function getUsuarioProyectos() { 
            // Inicio obtener el usuario actual 
            $http({ 
                method: "POST", 
                url: "/session/getUser", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                } 
            }).then(function(respuesta) { 
                vm.miUsuario = respuesta.data.user; 
                
                // Inicio obtener los proyectos
                $http({ 
                    url: "/user/getAllProjects", 
                    method: "GET", 
                    params: { id: vm.miUsuario.id } 
                }).then(function(result) { 
                    vm.misProyectos = result.data.user.projects; 
                }).catch(function(err) { 
                    setMensaje("Se produjo un error en el procedimiento '/user/getAllProjects'"); 
                    console.log(err); 
                }); 
                // Fin obtener los proyectos

            }).catch(function(err) {
                setMensaje("Se produjo un error en el procedimiento '/user/getUsuarioActual'"); 
                console.log(err); 
            }); 
            // Fin obtener el usuario actual 
        }; 

        function onBtnCrearProyectoClick(){ 

            if(!vm.guardando) { 
                $http.defaults.withCredentials = true; 
                vm.guardando = true; 

                // Inicio POST para la creacion del Proyecto  
                $http({ 
                    method: "POST", 
                    url: "/project/create", 
                    headers: { 
                        "Content-Type": "application/json", 
                        "X-CSRF-TOKEN": vm.csrfToken 
                    }, 
                    data: { 
                        owner_email: vm.miUsuario.email, // Email del usuario que crea el proyecto 
                        participants: vm.miUsuario.id, // El id del usuario 
                        name: vm.projectName, // El nombre del proyecto
                        finish_date: vm.projectDate, // La fecha de término 
                        roles: [] //roles no implementado 
                    } 
                }).then(function(respuestaProject) { 
                    var rp = respuestaProject.data; 

                    // En caso de error mostrar el mensaje 
                    if(!rp.procedimiento) { 
                        setMensaje(rp.mensaje); 
                        vm.guardando = false; 
                        return; 
                    } 
                    
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
                            name: "Inicio del nuevo proyecto " + rp.project.name, // El texto del mensaje + nombre del proyecto 
                            project_id: rp.project.id, // El id del proyecto 
                            tipo: "Mensaje Inicial", // El tipo del mensaje inicial ya que no es un elemento dialogico 
                            position: [0], // La posicion del mensaje en Dialog 
                            numero_hijos: 0, // Su numero de hijos 
                            session: 0, // El valor de sesion inicial 
                            parent: "", // El padre por defecto = vacio 
                            root: true, // La raiz 
                            usuario: vm.miUsuario.id, //el id del usuario 
                            nodoPadreId: 0, 
                            sessionId: 0, 
                            nodoNivel: 0, 
                            nodoPadreNivel: 0, 
                            nodoPadreSessionId: 0
                        }
                    }).then(function(respuestaMensaje) { 
                        var rm = respuestaMensaje.data; 
                        
                        // En caso de error mostrar el mensaje 
                        if(rm.mensaje === false) { 
                            setMensaje(rm.mensajeError); 
                            vm.guardando = false; 
                            return; 
                        } 
                        
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
                                project: rp.project.id, 
                                name: "Inicio del nuevo proyecto " + rp.project.name, 
                                root: true, 
                                children: [], // Aquí van, en un futuro, los mensajes hijos 
                                session: 0, 
                                numero_hijos: 0, 
                                session_actual: 0, 
                                ultimo_session_email: vm.miUsuario.email, // El último usuario que realizo un mensaje 
                                usuario: vm.miUsuario, // El objeto usuario 
                                idmensaje: rm.mensaje.id, // El 'id' del mensaje creado 
                                parent_ultimo_respondido: rm.mensaje.id, // El padre 'id' del mensaje (es el mismo para el primer caso) 
                            } 
                        }).then(function(respuestaDialogo) { 
                            var rd = respuestaDialogo.data; 
                            
                            // En caso de error mostrar el mensaje 
                            if(rd.dialogo === false) { 
                                setMensaje(rd.mensaje); 
                                vm.guardando = false; 
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
                                    project_id: rp.project.id, // Id del proyecto 
                                    project: rp.project.id, // Id del proyecto 
                                    name: "kanban: " + rp.project.name, // Nombre del proyecto 
                                } 
                            }).then(function(respuestaKanban) {
                                var rk = respuestaKanban.data; 
                                
                                // En caso de error mostrar el mensaje 
                                if(rk.kanban === false){ 
                                    setMensaje(rk.mensaje); 
                                    vm.guardando = false; 
                                    return; 
                                } 

                                // Se agrega a la lista de proyectos en la primera posicion, 
                                // el proyecto recién creado 
                                vm.misProyectos.splice(0, 0, rp.project); 

                                // Mostrar el mensaje 
                                vm.guardando = false; 
                                setMensaje(rp.mensaje); 
                            }); 
                            // Fin POST para la creacion del kanban 

                        }); 
                        // Fin POST para la creacion del Diálogo 

                    }); 
                    // Fin POST para la creacion del Mensaje 

                }); 
                // Fin POST para la creacion del Proyecto 

            }

        }; 

        function setMensaje(mensaje) { 
            Materialize.toast("<span>" + mensaje + "</span>", 5000); 
        }; 
    }; 
})(); 