(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("ProfileController", ProfileController); 

    ProfileController.$inject = ["$http", "$scope"]; 

    function ProfileController($http, $scope) { 
        var vm = this; 
        vm.miUsuario = {}; 
        vm.userFirstName = ""; 
        vm.userImgUrl = ""; 
        vm.userInitials = ""; 
        vm.userLastName = ""; 
        vm.userColor = ""; 

        vm.getUser = getUser; 
        vm.onBtnCancelarClick = onBtnCancelarClick; 
        vm.onBtnGuardarClick = onBtnGuardarClick;
        vm.setMessage = setMessage; 

        init(); 

        function init() { 
            $(document).ready(function() { 
                $(".tooltipped").tooltip({delay: 50}); 
            }); 
            
            // Inicio obtener el token csrf
            $http.get("/csrfToken").then(function(token) { 
                vm.csrfToken = token.data._csrf; 
                vm.getUser(); 
                $("#formUser").fadeIn(200); 
            }).catch(function(err) { 
                setMessage(false, "Se produjo un error en el procedimiento '/csrfToken'"); 
                console.log(err); 
            }); 
            // Fin obtener el token csrf
        }; 

        function getUser() { 
            // Inicio obtener el usuario actual 
            $http.defaults.withCredentials = true; 

            $http({ 
                method: "POST", 
                url: "/session/getUser", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                } 
            }).then(function(res) { 
                vm.miUsuario = res.data.user; 

                if(vm.miUsuario)
                    onBtnCancelarClick(); 

            }).catch(function(err) {
                setMessage(false, "Se produjo un error en el procedimiento '/session/getUser'"); 
                console.log(err); 
            }); 
            // Fin obtener el usuario actual 
        }; 

        function onBtnCancelarClick() { 
            vm.userFirstName = vm.miUsuario.firstname; 
            vm.userImgUrl = vm.miUsuario.imgurl; 
            vm.userInitials = vm.miUsuario.initials; 
            vm.userLastName = vm.miUsuario.lastname; 
            vm.userColor = vm.miUsuario.color; 
        }; 

        function onBtnGuardarClick() { 
            if(vm.processing) 
                return; 

            vm.processing = true; 
            $http.defaults.withCredentials = true; 
            
            // Inicio POST actualizar datos 
            $http({ 
                method: "POST", 
                url: "/session/profileUpdate", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    id: vm.miUsuario.id, 
                    firstname: vm.userFirstName, 
                    lastname: vm.userLastName, 
                    imgurl: vm.userImgUrl, 
                    initials: vm.userInitials, 
                    color: vm.userColor 
                }
            }).then(function(res) { 
                var d = res.data; 
                vm.processing = false; 
                setMessage(d.proc, d.msg, undefined, d.proc ? "success" : "warning"); 

                if(d.proc) 
                    getUser(); 
            }).catch(function(err) {
                vm.processing = false;
                setMessage(false, "Se produjo un error en el procedimiento '/session/profileUpdate'"); 
                console.log(err); 
            }); 
            // Fin POST actualizar datos 
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