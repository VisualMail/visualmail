(function() { 
    "use strict"; 
    angular.module("VisualMailApp").requires.push("ngTable"); 
    angular
        .module('VisualMailApp') 
        .run(['$templateCache', function($templateCache) { 
            $templateCache.put(
                'ng-table/filters/text.html', 
                '<input placeholder="Buscar por" type="text" name="{{name}}" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" ng-if="filter == \'text\'" />'); 
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
        vm.onBtnUserGuardarClick = onBtnUserGuardarClick; 
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
            
             $('.modal').modal();
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

            if(proceso === "Insert") { 
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
                vm.userRol = (item.rol ? item.rol : "2"); 
            }
            
            $("#modalUser").modal("open"); 
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
                    rol: parseInt(vm.userRol) 
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