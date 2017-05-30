(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("EditController", EditController); 

    EditController.$inject = ["$http", "$scope"]; 

    function EditController($http, $scope) { 
        var vm = this; 
        vm.miUsuario = {}; 
        vm.firstname = ""; 
        vm.imgurl = ""; 
        vm.initials = ""; 
        vm.lastname = ""; 
        vm.color = ""; 

        vm.getUsuarioProyectos = getUsuarioProyectos; 
        vm.onBtnEditCancelClick = onBtnEditCancelClick; 
        vm.onBtnEditGuardarClick = onBtnEditGuardarClick;
        vm.setMensaje = setMensaje; 

        init(); 

        function init() { 
            $(document).ready(function() { 
                $(".tooltipped").tooltip({delay: 50}); 
            }); 
            
            // Inicio obtener el token csrf
            $http.get("/csrfToken").then(function(token) { 
                vm.csrfToken = token.data._csrf; 
                getUsuarioProyectos(); 
            }).catch(function(err) { 
                setMensaje("Se produjo un error en el procedimiento '/csrfToken'"); 
                console.log(err); 
            }); 
            // Fin obtener el token csrf
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
            }).catch(function(err) {
                setMensaje("Se produjo un error en el procedimiento '/user/getUsuarioActual'"); 
                console.log(err); 
            }); 
            // Fin obtener el usuario actual 
        }; 

        function onBtnEditCancelClick() { 
            vm.firstname = ""; 
            vm.imgurl = ""; 
            vm.initials = ""; 
            vm.lastname = ""; 
            vm.color = ""; 
        }; 

        function onBtnEditGuardarClick() { 
            $http.defaults.withCredentials = true; 
            
            // Inicio POST actualizar datos 
            $http({ 
                method: "POST", 
                url: "/user/actualizardatos", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    id: vm.miUsuario.id, 
                    firstname: vm.firstname, 
                    lastname: vm.lastname, 
                    imgurl: vm.imgurl, 
                    initials: vm.initials, 
                    color: vm.color 
                }
            }).then(function(respuesta) { 
                var d = respuesta.data; 
                setMensaje(d.mensaje); 

                if(d.procedimiento) { 
                    getUsuarioProyectos(); 
                    onBtnEditCancelClick(); 
                }
            });
            // Fin POST actualizar datos 
        }; 

        function setMensaje(mensaje) { 
            Materialize.toast("<span>" + mensaje + "</span>", 5000); 
        }; 
    }; 

})(); 