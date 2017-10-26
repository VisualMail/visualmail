(function() { 
    "use strict"; 
    
    angular.module("VisualMailApp").requires.push("ngTable"); 

    angular
        .module("VisualMailApp")
        .controller("IndexProjectController", IndexProjectController); 
    
    IndexProjectController.$inject = ["$http", "$scope", "NgTableParams", "Upload"]; 

    function IndexProjectController($http, $scope, NgTableParams, Upload) { 
        var vm = this; 
        var parent = $scope.$parent; 
        vm.projectUserId = []; 
        vm.projectName = ""; 
        vm.projectDateEnd = ""; 

        vm.onBtnProjectAddUserClick = onBtnProjectAddUserClick; 
        vm.onBtnProjectArchivoGuardarClick = onBtnProjectArchivoGuardarClick; 
        vm.onBtnProjectGuardarClick = onBtnProjectGuardarClick; 
        vm.onBtnProjectModalClick = onBtnProjectModalClick; 
        vm.onProjectUserInit = onProjectUserInit; 
        vm.onProjectUserParticipanteFormatState = onProjectUserParticipanteFormatState; 
        vm.onProjectUserParticipanteInit = onProjectUserParticipanteInit; 
        vm.setMessage = parent.vm.setMessage; 

        init(); 

        function init() { 
            // Iniciar select2 de la lista de usuarios 'project' 
            $("#projectUser").select2(); 
			$("#projectUser").on("change", function() { 
                var userId = $(this).val(); 
				vm.projectUserId = userId !== null ? userId : []; 
            }); 

            // Obtener los usuarios de VisualMail menos mi usuario 
            $http.get("/user/getAllEmail").then(function(resUsers) { 
                var du = resUsers.data; 

                // Verificar si no existe un error 
                if(!du.proc) { 
                    vm.setMessage(du.proc, du.msg, undefined, "warning"); 
                    return; 
                }
                
                // Obtener la información del proyecto 
                $http({ 
                    url: "/project/getOne", 
                    method: "GET", 
                    params: { id: parent.vm.miProjectId } 
                }).then(function(resProject) { 
                    var dp = resProject.data; 

                    // Verificar si no existe un error 
                    if(!dp.proc) { 
                        vm.setMessage(dp.proc, dp.msg, undefined, "warning"); 
                        return; 
                    }
                    
                    // Obtener el proyecto y la lista de participantes 
                    parent.vm.miProject = dp.project; 
                    parent.vm.miUserListaParticipantes = parent.vm.miProject.participants; 
    
                    // Obtener cada usuario de la lista obtenida 'usuarios' 
                    for(var i in du.users) { 
                        // Iniciar la bandera que permitira almacenar los usuarios candidatos
                        var bandera = 0; 
                        
                        // Verificar cada participante 
                        for(var j in parent.vm.miUserListaParticipantes) { 
                            // Si el usuario ya es participante del proyecto, omitir 'bandera = 1' 
                            if(du.users[i].email === parent.vm.miUserListaParticipantes[j].email) { 
                                bandera = 1; 
                                break; 
                            } 
                        } 
                        
                        // Si la bandera permanece en 0, añadir usuario a la lista de candidatos 
                        if(bandera === 0) 
                            parent.vm.miUserLista.push(du.users[i]); 
                    } 

                    // Iniciar lista de usuarios participantes y potenciales participantes 
                    onProjectUserInit(); 
                    onProjectUserParticipanteInit(); 
                    //vm.child.vm.tableParams = new NgTableParams({}, { dataset: vm.miUserListaParticipantes });
                    vm.tableParams = new NgTableParams({}, { dataset: parent.vm.miUserListaParticipantes });
                    $("#filtrarUsuario").fadeIn(200);
                }).catch(function(err) { 
                    vm.setMessage(false, "¡Se produjo un error en el procedimiento '/project/getOne'!", null, err); 
                }); 
            }).catch(function(err) { 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/user/getAllEmail'!", null, err); 
            }); 
        }; 

        /** 
        * @method :: onBtnProjectAddUserClick 
        * @description :: Función para mandar POST que actualiza los datos del proyecto 
        **/ 
        function onBtnProjectAddUserClick() { 
            // Verificar si no se ha seleccionado un usuario 
            if(vm.projectUserId.length === 0) {
                vm.setMessage(false, "¡Seleccionar un usuario!", "warning"); 
                return; 
            } 

            // Verificar si está procesando 
            if(vm.procesando) 
                return; 
        
            vm.procesando = true; 

            // Realizar el post 
            $http.defaults.withCredentials = true; 
            $http({ 
                method: "POST", 
                url: "/project/addUser", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": parent.vm.csrfToken 
                }, 
                data: { 
                    usuarioId: vm.projectUserId, 
                    id: parent.vm.miProjectId 
                } 
            }).then(function(res) { 
                var d = res.data;
                vm.procesando = false; 
                vm.setMessage(d.proc, d.msg, d.proc ? "success" : "warning"); 

                if(!d.proc) 
                    return; 

                // Es necesario actualizar de parte del cliente el valor de usuarios 
                // primero para cada usuario ingresado al proyecto 
                for(var i = 0; i < vm.projectUserId.length; i++) {
                    var bandera = 0; 
                    var position = 0; 

                    // Buscar la posición de cada usuario seleccionado 
                    for(var j = 0; j < parent.vm.miUserLista.length; j++) { 
                        if(vm.projectUserId[i] == parent.vm.miUserLista[j].id) { 
                            bandera = 1; 
                            position = j; 
                            break; 
                        } 
                    } 

                    // Si el elemento es encontrado se actualizan los arreglos  
                    if(bandera == 1) { 
                        // 'miUserListaParticipantes' lo agrega en la primera posicion 
                        parent.vm.miUserListaParticipantes.splice(0, 0, parent.vm.miUserLista[position]);

                        // y agrega el elemento a usuarios 
                        parent.vm.miUserLista.splice(position, 1);
                    }
                }

                $("#projectUser").val("").trigger("change"); 
                vm.projectUserId = []; 
                vm.onProjectUserInit(); 
                vm.onProjectUserParticipanteInit(); 
                vm.tableParams = new NgTableParams({}, { dataset: parent.vm.miUserListaParticipantes });
            }).catch(function(err) { 
                vm.procesando = false; 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/project/addUser'!", null, err); 
            }); 

        }; 

        function onBtnProjectArchivoGuardarClick() { 
            if(vm.procesando) 
                return; 

            vm.procesando = true; 

            Upload.upload({
                method: "POST", 
                url: "/archivo/create",
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": parent.vm.csrfToken 
                }, 
                data: { 
                    files: vm.projectArchivo 
                }
            }).then(function(res) {
                var d = res.data;
                console.log(d); 
                vm.procesando = false; 
            }).catch(function(err) { 
                vm.procesando = false; 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/archivo/create'!")
            }); 
        }; 
    
        /**
        * @method :: onBtnProjectGuardarClick 
        * @description :: Función para mandar POST que actualiza los datos del proyecto
        **/
        function onBtnProjectGuardarClick() { 
            // Verificar si está procesando 
            if(vm.procesando) 
                return; 
            
            vm.procesando = true; 

            // Actualizar proyecto 
            $http.defaults.withCredentials = true; 
            $http({ 
                method: "POST", 
                url: "/project/update", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": parent.vm.csrfToken 
                }, 
                data: { 
                    description: "", 
                    finish_date: vm.projectDateEnd, 
                    id: parent.vm.miProject.id, 
                    name: vm.projectName 
                } 
            }).then(function(res) { 
                // Se obtiene el resultado 'res' 
                var d = res.data; 
                vm.setMessage(d.proc, d.msg, d.proc ? "success" : "warning"); 
                vm.procesando = false; 
                
                // Si existe un error retornar 
                if(!d.proc) 
                    return; 
                
                // Se actualizan los datos en el cliente y se limpian los datos
                parent.vm.miProject.name = vm.projectName; 
                parent.vm.miProject.finish_date = vm.projectDateEnd; 
                $("#modalProject").modal("hide"); 
            }).catch(function(err) { 
                vm.procesando = false; 
                vm.setMessage(false, "¡Se produjo un error en el procedimiento '/project/update'!", "error", err); 
            }); 
        }; 

        /**
        * @method :: onBtnProjectModalClick 
        * @description :: Muestra el modal pop-up con los datos del proyecto 
        **/
        function onBtnProjectModalClick() { 
            vm.projectName = parent.vm.miProject.name; 
            vm.projectDateEnd = parent.vm.miProject.projectDateEnd; 
            $("#modalProject").modal("show"); 
        }; 

        /** 
        * @method :: onProjectUserInit 
        * @description :: Inicia la lista de usuarios de visualmail 
        **/ 
        function onProjectUserInit() { 
            var s = $("#projectUser"); 
            s.select2("data", null); 
            s.html(""); 
            var list = []; 
            
            $.each(parent.vm.miUserLista, function(key, value) { 
                list.push({ 
                    id: value.id, 
                    text: value.firstname + ", " + value.email
                }); 
            }); 

            s.select2({ 
                cache: false, 
                data: list, 
                placeholder: "Seleccionar un usuario", 
                allowClear: true, 
                multiple: true, 
            });  
        }; 

        /** 
        * @method :: onProjectUserParticipanteFormatState 
        * @description :: Inicia la lista de usuarios en un proyecto con la imagen de cada uno  
        **/ 
        function onProjectUserParticipanteFormatState(opt) { 
            if(!opt.id || !opt.imgurl) 
                return opt.text; 
            
            var optimage = opt.imgurl; 
            
            if(!optimage) 
                return opt.text; 
            else { 
                var $opt = $( 
                    '<span><img src="' + optimage + '" style="height: 20px; width: 20px;" class="rounded-circle" /> ' + $(opt.element).text() + '</span>' 
                ); 
                return $opt; 
            } 
        }; 

        /** 
        * @method :: onProjectUserParticipanteInit 
        * @description :: Inicia la lista de usuarios en un proyecto 
        **/ 
        function onProjectUserParticipanteInit() { 
            var s = $("#selectFiltrarUsuario"); 
            s.select2("data", null); 
            s.html(""); 
            var list = []; 
            
            $.each(parent.vm.miUserListaParticipantes, function(key, value) { 
                list.push({ 
                    id: value.id, 
                    text: value.firstname + ", " + value.email, 
                    imgurl: value.imgurl 
                }); 
            }); 

            list.unshift({ id: "", text: "", imgurl: ""}); 

            s.select2({
                cache: false, 
                data: list, 
                placeholder: "Seleccionar un responsable", 
                allowClear: true, 
                multiple: false, 
                templateResult: onProjectUserParticipanteFormatState, 
                templateSelection: onProjectUserParticipanteFormatState 
            });
        }; 
    }; 

})(); 