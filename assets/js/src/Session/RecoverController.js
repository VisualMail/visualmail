(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("RecoverController", RecoverController); 

    RecoverController.$inject = ["$http", "$scope"]; 

    function RecoverController($http, $scope) { 
        var vm = this; 

        vm.formularioVerificarMostrar = true; 
        vm.formularioRecuperarMostrar = false; 
        vm.confirmado = false; 

        vm.onBtnActualizarClaveClick = onBtnActualizarClaveClick; 
        vm.onBtnVerificarClaveClick = onBtnVerificarClaveClick; 
        vm.setMensaje = setMensaje; 

        init(); 

        function init() { 
            $http.get("/csrfToken")
                .then(function(token) { 
                    vm.csrfToken = token.data._csrf; 
                });
            $("#mainView").fadeIn(200);
        }; 

        function onBtnActualizarClaveClick() { 
            $http.defaults.withCredentials = true;
            $http({
                method: "POST", 
                url: "/session/actualizarpass", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    password: vm.claveNueva, 
                    id: vm.claveVerificar, 
                }
            }).then(function (respuesta) { 
                var d = respuesta.data; 

                setMensaje(d.mensaje); 

                if(!d.procedimiento) 
                    return; 
                
                vm.formularioVerificarMostrar = false; 
                vm.formularioRecuperarMostrar = false; 
                vm.confirmado = true; 
            });
        }; 

        function onBtnVerificarClaveClick() { 
            console.log(vm.claveVerificar); 
            $http({ 
                method: "POST", 
                url: "/session/verficar_clave", 
                headers: {
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    clave: vm.claveVerificar 
                } 
            }).then(function(respuesta) { 
                var d = respuesta.data; 
                setMensaje(d.mensaje); 

                if(!d.procedimiento) 
                    return; 
                
                vm.formularioVerificarMostrar = false; 
                vm.formularioRecuperarMostrar = true; 
            });
        }; 
    
        function setMensaje(mensaje) { 
            Materialize.toast("<span>" + mensaje + "</span>", 5000); 
        }; 

    }; 
})(); 