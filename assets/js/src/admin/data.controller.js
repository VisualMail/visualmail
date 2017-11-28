(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("DataController", DataController); 

    DataController.$inject = ["$http", "$scope"]; 

    function DataController($http, $scope) {
        var vm = this; 
        vm.mensajeList = []; 
        vm.projectList = []; 
        vm.project = { 
            
         }; 
        vm.getProjectList = getProjectList;
        vm.onProjectClick = onProjectClick;  
        vm.setMessage = setMessage; 

        init(); 

        function init() { 
            $http.get("/csrfToken").then(function(res) { 
                // Obtener el token 'csrf'
                vm.csrfToken = res.data._csrf; 

                // Cargar la lisa de datos 
                getProjectList(); 
                
            }).catch(function(err) { 
                setMessage(false, "Se produjo un error en el procedimiento '/csrfToken'", err); 
            }); 
        }; 

        function getProjectList() { 
            $http({ 
                method: "POST", 
                url: "/admin/dataGetProjectList", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                } 
            }).then(function(res) { 
                var d = res.data; 

                if(!d.proc) { 
                    setMessage(d.proc, d.msg, undefined, "warning"); 
                    return; 
                }

                vm.projectList = d.list; 
            }).catch(function(err) {
                setMessage(false, "Se produjo un error en el procedimiento '/admin/userGetDatos'", err); 
            }); 
        }; 

        function onProjectClick() { 
            $http({ 
                method: "POST", 
                url: "/mensaje/getAllProjectId", 
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRF-TOKEN": vm.csrfToken 
                }, 
                data: {
                    id: vm.project.id 
                }
            }).then(function(res) { 
                var d = res.data; 

                if(!d.proc) { 
                    setMessage(d.proc, d.msg, undefined, "warning"); 
                    return; 
                }

                vm.mensajeList = d.mensaje;
            }).catch(function(err) {
                setMessage(false, "Se produjo un error en el procedimiento '/admin/userGetDatos'", err); 
            }); 
        }

        function setMessage(proc, msg, err, state) { 
            swal(proc ? "¡Datos registrados!" : "¡No se completó la operación!", msg, state ? state : (proc ? "success" : "error")); 

            if (err !== undefined) { 
                console.debug("Error: " + msg); 
                console.debug(err); 
                console.log(err); 
            } 
        }; 
    }
})(); 