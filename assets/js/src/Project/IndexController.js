(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp") 
        .controller("IndexController", IndexController); 
    
    IndexController.$inject = ["$http", "$scope"]; 

    function IndexController($http, $scope) { 
        var vm = this; 
        vm.activeTab = 2; 
        vm.csrfToken = null; 

        vm.miProject = { }; 
        vm.miProjectId = ""; 
        vm.miUser = ""; 
        vm.miUserLista = []; 
        vm.miUserListaParticipantes = []; 

        vm.projectUserId = ""; 
        

        vm.getQueryString = getQueryString; 
        vm.onProjectUserInit = onProjectUserInit; 

        init(); 

        function init() { 
            $(document).ready(function() { 
            $(".js-example-basic-multiple").select2();
        });
            // Obtener el 'id' del proyecto 
            vm.miProjectId = getQueryString("id"); 

			// Obtener el token de csrf 
			$http.get("/csrfToken").then(function(d) { 
				vm.csrfToken = d.data._csrf;  
            });
            
            // Obtener el usuario que inició sesión
			$http.get("/session/getUser").then(function(d) {  
				vm.miUser = d.data.user;
            });
            
            // Iniciar select2 de la lista de usuarios 'project' 
            $("#projectUser").select2();
			$("#projectUser").on("change", function() { 
                var userId = $(this).val(); 
				vm.projectUserId = userId !== null ? userId : "-1"; 
            });
            
            // Obtener los usuarios de VisualMail menos mi usuario 
            $http.get("/user/getAllEmail").then(function(users) { 
                
                // Obtener la información del proyecto 
                $http({ 
                    url: "/project/getOne", 
                    method: "GET", 
                    params: { id: vm.miProjectId } 
                }).then(function(project) { 
                    
                    // Obtener el proyecto y la lista de participantes 
                    vm.miProject = project.data.project; 
                    vm.miUserListaParticipantes = vm.miProject.participants; 
    
                    // Obtener cada usuario de la lista obtenida 'usuarios' 
                    for(var i in users.data.users) { 
                        // Iniciar la bandera que permitira almacenar los usuarios candidatos
                        var bandera = 0; 
                        
                        // Verificar cada participante 
                        for(var j in vm.miUserListaParticipantes) { 
                            // Si el usuario ya es participante del proyecto, omitir 'bandera = 1' 
                            if(users.data.users[i].email === vm.miUserListaParticipantes[j].email) { 
                                bandera = 1; 
                                break; 
                            } 
                        } 
                        
                        // Si la bandera permanece en 0, añadir usuario a la lista de candidatos 
                        if(bandera === 0) 
                            vm.miUserLista.push(users.data.users[i]); 
                    } 

                    //onProjectUserInit(); 
                    
                    

                    /*$.each(vm.miListaParticipantes, function(key, value) { 
                        $("#selectFiltrarUsuario").append("<option value=\"" + value.id + "\" data-icon=\"" + value.imgurl + "\" class=\"left circle\">" + value.firstname + " " + value.lastname + "</option>"); 
                    });  
                    $("select").material_select(); */
                }); 
            });
        }; 

        /**
        * @method :: getQueryString 
        * @description :: Obtiene una variable desde el 'queryString' 
        * @param :: {string} name, nombre de la variable 
        * @param :: {string} url, ruta del 'querySring' 
        **/
        function getQueryString(name, url) {
            if (!url)
                url = window.location.href;

            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);

            if (!results)
                return null;

            if (!results[2])
                return "";

            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }; 

        function onProjectUserInit() { 
            var s = $("#projectUser"); 
            s.select2("data", null); 
            s.html(""); 
            var list = []; 
            
            $.each(vm.miUserLista, function(key, value) { 
                list.push({ 
                    id: value.id, 
                    text: value.firstname 
                }); 
            }); 

            console.log(list); 

            s.select2({ 
                cache: false, 
                data: list, 
                placeholder: "Seleccionar una sección", 
                allowClear: true, 
                multiple: true, 
            });  
        }; 
        
    }; 
})(); 