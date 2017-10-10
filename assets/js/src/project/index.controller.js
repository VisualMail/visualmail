(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp") 
        .controller("IndexController", IndexController); 
    
    IndexController.$inject = ["$http", "$scope", "$filter", "$sce"]; 

    function IndexController($http, $scope, $filter, $sce) { 
        var vm = this; 
        vm.activeTab = 2; 
        vm.csrfToken = null; 
        vm.messageToast = ""; 
        vm.miProject = { }; 
        vm.miProjectId = ""; 
        vm.miSessionId = 0; 
        vm.miUser = ""; 
        vm.miUserLista = []; 
        vm.miUserListaParticipantes = []; 
        vm.scopeMensaje = {}; 
        vm.scopeTarea = {}; 
    
        vm.getQueryString = getQueryString; 
        vm.iniciarTiempoDialogo = iniciarTiempoDialogo; 
        vm.onActiveTabChanged = onActiveTabChanged; 
        vm.onScopeMensajeActualizarTarea = onScopeMensajeActualizarTarea; 
        vm.setMessage = setMessage; 
        vm.setMessageToast = setMessageToast; 
        
        init(); 

        function init() { 
            // Iniciar select2 filtrar por usuario 
            $("#selectFiltrarUsuario").select2(); 

            // Iniciar datetime 
            $(".input-group.date").datepicker({ 
                autoclose: true, 
                format: "yyyy-mm-dd", 
                language: "es", 
                todayBtn: "linked", 
                todayHighlight: true 
            }); 

            // Obtener el 'id' del proyecto 
            vm.miProjectId = getQueryString("id"); 

			// Obtener el token de csrf 
			$http.get("/csrfToken").then(function(res) { 
				vm.csrfToken = res.data._csrf;  
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error en el procedimiento '/csrfToken'!", null, err); 
            }); 
            
            // Obtener el usuario que inició sesión
			$http.get("/session/getUser").then(function(res) {  
				vm.miUser = res.data.user;
            }).catch(function(err) { 
                setMessage(false, "¡Se produjo un error en el procedimiento '/session/getUser'!", null, err); 
            }); 

            // Expresión regular para el E-mail
            //var REGEX_EMAIL = 
                //'([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' + 
                //'(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)'; 
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
        
        /** 
        * @method :: iniciarTiempoDialogo 
        * @description :: Presenta el tiempo del diálogo 
        **/
        function iniciarTiempoDialogo() { 
            var date2 = new Date(vm.miMensajeLista[vm.miMensajeLista.length - 1].createdAt); 
            var date1 = new Date(vm.miMensajeLista[0].createdAt); 
            var timeDiff = Math.abs(date2.getTime() - date1.getTime()); 
            vm.tiempoDialogo = Math.ceil(timeDiff / (1000 * 60)); 
            /*var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            console.log(diffDays); 
            console.log(diffDays);*/
        }; 
        
        function onActiveTabChanged(tabId, nodoId) { 
            vm.scopeTarea.ik.kanbanTareaIdFocus = ""; 
            $("#tab1, #dialogo-main, #tab4").attr("style", "display: none;"); 
            
            var active = "";

            if(tabId === 1)
                active = "tab1"; 
            else if(tabId === 2)
                active = "dialogo-main"; 
            else if(tabId === 4)
                active = "tab4";

            if(!nodoId) { 
                vm.activeTab = tabId; 
                $("#" + active).attr("style", "display: visible;");
                return; 
            } 

            if(tabId === 2) { 
                if(nodoId !== vm.scopeMensaje.im.miMensajeAnclado.nodoId) { 
                    $anclar = true; 
                    $("[data-circle=dialogo]").attr("stroke", ""); 
                    $("[data-circle=dialogo]").attr("stroke-width", ""); 
                    var n = $("[data-circle-navigate=ok]"); 
                    n.attr("stroke", ""); 
                    n.attr("stroke-width", ""); 
                    n.attr("data-circle-navigate", ""); 
                    n = $("[data-line-navigate=ok]"); 
                    n.attr("stroke", "#797979"); 
                    n.attr("stroke-width", "1"); 
                    n.attr("data-line-navigate", ""); 

                    vm.scopeMensaje.im.onMensajeAnclarClick(nodoId); 
                    vm.scopeMensaje.im.iniciarMensajeAnclado(); 
                    vm.scopeMensaje.im.mensajeResponder = false; 
                    vm.miMapaSvgFocus = true; 
                    $(".svg-mapa").focus(); 
                }  

                var x = $("[data-nodo-id=" + nodoId + "]").attr("cx"); 
                var y = $("[data-nodo-id=" + nodoId + "]").attr("cx"); 

                $("#" + active).show(0, function() { 
                    $('#dialogo-svg').animate({
                        scrollTop: $("[data-nodo-id=" + nodoId + "]").offset().top / 2, 
                        scrollLeft: $("[data-nodo-id=" + nodoId + "]").offset().left
                    }, 0);
                }); 
            } else if(tabId === 4) { 
                $.each(vm.scopeMensaje.im.miMensajeLista, function(key, value) { 
                    if(value.nodoId !== nodoId)
                        return true; 
                    
                    vm.scopeTarea.ik.kanbanTareaIdFocus = value.tareaId; 
                    return false; 
                }); 

                var cell = $("#" + vm.scopeTarea.ik.kanbanTareaIdFocus).parent(); 

                $("#" + active).show(0, function() { 
                    cell.parent().animate({
                        scrollTop: cell.offset().top 
                    }, 0);
                });
            }

            vm.activeTab = tabId; 
        }; 

        /** 
        * @method :: onScopeMensajeActualizarTarea 
        * @description :: Actualizar el mensaje con el id de la tarea. 
        * @param :: {string} mensajeId, el 'id' del mensaje. 
        * @param :: {string} tareaId, el 'id' de la tarea. 
        **/
        function onScopeMensajeActualizarTarea(mensajeId, tareaId) { 
            $.each(vm.scopeMensaje.im.miMensajeLista, function(key, value) { 
                if(value.id !== mensajeId) 
                    return true; 

                value.tareaId = tareaId; 
                return false; 
            }); 
        }; 

        /**
        * @method :: setMessage 
        * @description :: Despliega un mensaje  
        * @param :: {boolean} proc, procedimiento correcto o incorrecto 
        * @param :: {string} msg, contenido del mensaje  
        * @param :: {string} state, estado del mensaje 
        * @param :: {Object} err, error del proceso 
        **/
        function setMessage(proc, msg, state, err) { 
            swal(proc ? "¡Datos registrados!" : "¡No se completó la operación!", msg, state ? state : (proc ? "success" : "error")); 

            if (err !== undefined) { 
                console.debug("Error: " + msg); 
                console.debug(err); 
                console.log(err); 
            } 
        }; 

        /** 
        * @method :: setMessageToast 
        * @description :: Despliega un mensaje 
        * @param :: {string} message, contenido del mensaje 
        **/
        function setMessageToast(message) { 
            vm.messageToast = message; 
            // Get the snackbar DIV 
            var x = document.getElementById("snackbar"); 
        
            // Add the "show" class to DIV 
            x.className = "show"; 
        
            // After 3 seconds, remove the show class from DIV 
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000); 
        } 
    }; 
})(); 