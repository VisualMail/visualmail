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
        .controller("AdminController", AdminController); 

    AdminController.$inject = ["$http", "$scope", "NgTableParams"]; 

    function AdminController($http, $scope, NgTableParams) { 
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
        vm.onBtnPasswordCerrarClick = onBtnPasswordCerrarClick; 
        vm.onBtnPasswordGuardarClick = onBtnPasswordGuardarClick; 
        vm.onBtnUserGuardarClick = onBtnUserGuardarClick; 
        vm.onBtnUserPasswordClick = onBtnUserPasswordClick; 
        vm.setMensaje = setMensaje; 

        init(); 

        function init() { 
            // Inicio obtener el token csrf
            $http.get("/csrfToken").then(function(res) { 
                // Obtener el token 'csrf'
                vm.csrfToken = res.data._csrf; 

                // Cargar la lisa de datos 
                getDatos(); 
            }).catch(function(err) { 
                setMensaje("Se produjo un error en el procedimiento '/csrfToken'"); 
                console.log(err); 
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
                        url: "/user/adminGetDatos", 
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

                        if(d.procedimiento) { 
                            params.total(d.total); 
                            return d.lista; 
                        }

                        setMensaje(d.mensaje); 
                        return []; 
                    }).catch(function(err) {
                        setMensaje("Se produjo un error en el procedimiento '/user/getUsuarioActual'"); 
                        console.log(err); 
                        return []; 
                    }); 
                    // Fin obtener los datos de los usuarios 
                }
            }; 

            // Iniciar la lista de resultados 
            vm.tableParams = new NgTableParams(paramIniciales, paramConfig); 
        }; 

        /**
        * @method :: onBtnModalUserClick 
        * @description :: Muestra el formulario del usuario  
        **/
        function onBtnModalUserClick(proceso, item) { 
            vm.proceso = proceso; 
            vm.userPassword = ""; 

            if(proceso === "Insert") { 
                vm.formUser.userColor.$pristine = true; 
                vm.formUser.userEmail.$pristine = true; 
                vm.formUser.userFirstName.$pristine = true; 
                vm.formUser.userInitials.$pristine = true; 
                vm.formUser.userLastName.$pristine = true; 
                vm.formUser.userRol.$pristine = true; 

                vm.userColor = ""; 
                vm.userEmail = ""; 
                vm.userFirstName = ""; 
                vm.userId = ""; 
                vm.userImgUrl = ""; 
                vm.userInitials = ""; 
                vm.userLastName = ""; 
                vm.userRol = "-1"; 
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
        * @method :: onBtnPasswordCerrarClick 
        * @description :: Cierra el modal para modificar la contraseña 
        **/
        function onBtnPasswordCerrarClick() { 
            $("#modalUser").modal("open"); 
            $("#modalPassword").modal("close"); 
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
                url: "passwordActualizarUsuario", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    id: vm.userId, 
                    userPasswordNew: vm.passwordUser 
                } 
            }).then(function(res) { 
                var d = res.data; 
                setMensaje(d.mensaje); 
                vm.procesando = false; 
                vm.passwordUser = ""; 
                vm.passwordUserConfirm = ""; 
            }).catch(function(err) { 
                vm.procesando = false; 
                setMensaje("Se produjo un error en el procedimiento '/csrfToken'"); 
                console.log(err); 
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

            $http({ 
                method: "POST", 
                url: vm.proceso === "Insert" ? "/user/guardar" : "/user/actualizar", 
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
                setMensaje(d.mensaje); 
                vm.procesando = false; 

                if(d.procedimiento) { 
                    $("#modalUser").modal("close"); 
                    getDatos(); 
                    return; 
                } 
            }).catch(function(err) { 
                vm.procesando = false; 
                setMensaje("Se produjo un error en el procedimiento '/csrfToken'"); 
                console.log(err); 
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

            //$("#modalUser").modal("close"); 
            $("#modalPassword").modal("show"); 
        }; 

        /**
        * @method :: setMensaje 
        * @description :: Despliega un mensaje  
        * @param :: {string} mensaje, contenido del mensaje  
        **/
        function setMensaje(mensaje) { 
            Materialize.toast("<span>" + mensaje + "</span>", 2000); 
        }; 
    }; 
})(); 