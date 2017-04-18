(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp") 
        .controller("ForgotPassController", ForgotPassController); 
    
    ForgotPassController.$inject = ["$http", "$scope"]; 

    function ForgotPassController($http, $scope) { 
        var vm = this; 
        vm.onBtnEnviarClick = onBtnEnviarClick; 
        vm.setMensaje = setMensaje; 

        init(); 

        function init() { 
            // Inicio obtener el token csrf
            $http.get("/csrfToken").then(function(token) { 
                vm.csrfToken = token.data._csrf; 
            }).catch(function(err) { 
                setMensaje("Se produjo un error en el procedimiento '/csrfToken'"); 
                console.log(err); 
            }); 
            // Fin obtener el token csrf

            $("#logInMessage").fadeIn(100);
        }; 

        function onBtnEnviarClick() { 
            $http.defaults.withCredentials = true; 

            // Inicio enviar el mail ingresado
            $http({ 
                method: "POST", 
                url: "/session/sendEmail", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: { 
                    email: vm.email 
                } 
            }).then(function(respuesta) { 
                var d = respuesta.data; 
                
                if(d.procedimiento) { 
                    vm.mostrarPost = true; 
                    vm.esconderFormulario = true; 
                    vm.mostrarPost = true; 
                } 
                
                setMensaje(d.mensaje); 
            });
        }; 

        function setMensaje(mensaje) { 
            Materialize.toast("<span>" + mensaje + "</span>", 5000); 
        }; 

    }; 
})(); 