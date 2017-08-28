(function() { 
    "use strict"; 
    angular.module("VisualMailApp").requires.push("ngTable"); 
    angular
        .module('VisualMailApp') 
        .run(['$templateCache', function($templateCache) { 
            $templateCache.put(
                'ng-table/filters/text.html', 
                '<input class="form-control" placeholder="Buscar por" type="text" name="{{name}}" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" ng-if="filter == \'text\'" />'); 
            }]);

    angular
        .module("VisualMailApp")
        .controller("UserController", UserController); 

    UserController.$inject = ["$http", "$scope", "NgTableParams"]; 

    function UserController($http, $scope, NgTableParams) { 
        var vm = this; 
        vm.cantidadPaginas = [10, 50, 100]; 
        vm.proceso = "Insert"; 
        vm.userColor = ""; 
        vm.userEmail = ""; 
        vm.userFirstName = ""; 
        vm.userId = ""; 
        vm.userImgUrl = ""; 
        vm.userInitials = ""; 
        vm.userLastName = ""; 
        vm.userRol = "-1"; 

        vm.getDatos = getDatos; 
        vm.onBtnModalUserClick = onBtnModalUserClick; 
        vm.onBtnPasswordGuardarClick = onBtnPasswordGuardarClick; 
        vm.onBtnUserGuardarClick = onBtnUserGuardarClick; 
        vm.onBtnUserPasswordClick = onBtnUserPasswordClick; 
        vm.setMessage = setMessage; 

        init(); 

        function init() { 
            // Inicio obtener el token csrf
            $http.get("/csrfToken").then(function(res) { 
                // Obtener el token 'csrf'
                vm.csrfToken = res.data._csrf; 

                // Cargar la lisa de datos 
                getDatos(); 
            }).catch(function(err) { 
                setMessage(false, "Se produjo un error en el procedimiento '/csrfToken'", err); 
            }); 
            // Fin obtener el token csrf

            $('[data-toggle="tooltip"]').tooltip();             
        }; 

        function getDatos() { 
            // Establecer los parámetros iniciales de la lista de resultados 
            var paramIniciales = { 
                count: vm.cantidadPaginas[0] 
            }; 

            // Establecer los parámetros de configuración 
            var paramConfig = { 
                counts: vm.cantidadPaginas, 
                getData: function(params) { 
                    // Inicio obtener los datos de los usuarios 
                    return $http({ 
                        method: "POST", 
                        url: "/admin/userGetDatos", 
                        headers: { 
                            "Content-Type": "application/json", 
                            "X-CSRF-TOKEN": vm.csrfToken 
                        }, 
                        data: { 
                            count: params.count(), 
                            filter: params.filter(), 
                            page: params.page(), 
                            sorting: params.sorting() 
                         } 
                    }).then(function(res) { 
                        var d = res.data; 

                        if(d.proc) { 
                            params.total(d.total); 
                            return d.list; 
                        }

                        setMessage(d.proc, d.msg, undefined, "warning"); 
                        return []; 
                    }).catch(function(err) {
                        setMessage(false, "Se produjo un error en el procedimiento '/admin/userGetDatos'", err); 
                        return []; 
                    }); 
                    // Fin obtener los datos de los usuarios 
                }
            }; 

            // Iniciar la lista de resultados 
            vm.tableParams = new NgTableParams(paramIniciales, paramConfig); 
            $("#viewMain").fadeIn(200); 
        }; 

        /**
        * @method :: onBtnModalUserClick 
        * @description :: Muestra el formulario del usuario  
        **/
        function onBtnModalUserClick(proc, item) { 
            vm.proceso = proc; 
            vm.userPassword = ""; 

            if(proc === "Insert") { 
                vm.userColor = ""; 
                vm.userEmail = ""; 
                vm.userFirstName = ""; 
                vm.userId = ""; 
                vm.userImgUrl = ""; 
                vm.userInitials = ""; 
                vm.userLastName = ""; 
                vm.userRol = "-1"; 

                vm.formUser.userColor.$pristine = true; 
                vm.formUser.userEmail.$pristine = true; 
                vm.formUser.userFirstName.$pristine = true; 
                vm.formUser.userInitials.$pristine = true; 
                vm.formUser.userLastName.$pristine = true; 
                vm.formUser.userPassword.$pristine = true; 
                vm.formUser.userRol.$pristine = true; 
            } else {
                vm.userColor = item.color; 
                vm.userEmail = item.email; 
                vm.userFirstName = item.firstname; 
                vm.userId = item.id; 
                vm.userImgUrl = item.imgurl; 
                vm.userInitials = item.initials; 
                vm.userLastName = item.lastname; 
                vm.userRol = (item.rol ? item.rol.toString() : "2"); 
            }
            
            $("#modalUser").modal("show"); 
        }; 

        /**
        * @method :: onBtnPasswordGuardarClick 
        * @description :: Guarda la contraseña del usuario seleccionado 
        **/
        function onBtnPasswordGuardarClick() { 
            if(vm.procesando) 
                return; 

            vm.procesando = true; 

            $http({ 
                method: "POST", 
                url: "/admin/userUpdatePassword", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    id: vm.userId, 
                    userPasswordNew: vm.passwordUser 
                } 
            }).then(function(res) { 
                $("#modalPassword").modal("hide"); 
                var d = res.data; 
                setMessage(d.proc, d.msg, undefined, d.proc ? "success" : "warning"); 
                vm.procesando = false; 
                vm.passwordUser = ""; 
                vm.passwordUserConfirm = ""; 
            }).catch(function(err) { 
                vm.procesando = false; 
                setMessage(false, "Se produjo un error en el procedimiento '/admin/userUpdatePassword'", err); 
            }); 
        }; 

        /**
        * @method :: onBtnUserGuardarClick 
        * @description :: Guarda los datos de un usuario 
        **/
        function onBtnUserGuardarClick() { 
            if(vm.procesando) 
                return; 

            vm.procesando = true; 
            $http.defaults.withCredentials = true; 
            
            $http({ 
                method: "POST", 
                url: vm.proceso === "Insert" ? "/admin/userInsert" : "/admin/userUpdate", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    id: vm.userId, 
                    firstname: vm.userFirstName, 
                    lastname: vm.userLastName, 
                    email: vm.userEmail, 
                    imgurl: vm.userImgUrl, 
                    initials: vm.userInitials, 
                    color: vm.userColor, 
                    rol: parseInt(vm.userRol), 
                    password: vm.userPassword 
                } 
            }).then(function(res) { 
                var d = res.data; 
                setMessage(d.proc, d.msg, undefined, d.proc ? "success" : "warning"); 
                vm.procesando = false; 

                if(d.proc) { 
                    $("#modalUser").modal("hide"); 
                    getDatos(); 
                    return; 
                } 
            }).catch(function(err) { 
                vm.procesando = false; 
                setMessage(false, "Se produjo un error en el procedimiento '" + vm.proceso === "Insert" ? "/admin/userInsert" : "/admin/userUpdate" + "'", err); 
            }); 
        }; 

        /*
        * @method :: onBtnUserPasswordClick 
        * @description :: Mustra el modal pop-up para modificar la contraseña 
        **/
        function onBtnUserPasswordClick() { 
            vm.passwordUser = ""; 
            vm.passwordUserConfirm = ""; 
            vm.formPassword.passwordUser.$pristine = true; 
            vm.formPassword.passwordUserConfirm.$pristine = true; 
            $("#modalPassword").modal("show"); 
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