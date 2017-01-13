angular
   .module('app.editUserCtrl', [ 
      'ngMessages', 
      'gp.rutValidator', 
      'selectize'
   ]) 
   .controller('editUserCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) { 
      $http.get('/csrfToken')
         .success(function (token) { 
            $scope.csrfToken = token._csrf; 
         }); 

      $scope.id = id;
      $scope.firstname =''; 
      $scope.lastname =''; 
      $scope.imgurl =''; 
      $scope.initials =''; 
      $scope.password =''; 
      $scope.confirmpassword =''; 

      /**
      * @method :: actualizar_campos 
      * @description ::  POST paraa editar datos de usuario
      **/
      $scope.actualizar_campos= function() { 
         $http.defaults.withCredentials = true; 

         // Se genera post con cabeceras y datos
         $http({ 
            method: 'POST', 
            url: '/user/actualizardatos/', 
            headers: {
               'Content-Type': 'application/json', 
               'X-CSRF-TOKEN': $scope.csrfToken 
            }, 
            data: { 
               id: $scope.id, 
               firstname: $scope.firstname, 
               lastname: $scope.lastname, 
               imgurl: $scope.imgurl, 
               initials: $scope.initials 
            }
         })
         .success(function (data) {
            //al finalizar el post 
            //si en el servidor los datos fueron correctos, se recarga la pagina y la variable flash manda la notificacion
            if(data.opcion == 'true') { 
               location.reload(true); 
               //Materialize.toast($mensaje1, 5000); 
            } else {
               //si hay un error 
               Materialize.toast($mensaje2, 5000); 
            } 
         });
      } 

      /**
      * @method :: actualizar_password 
      * @description ::  POST para actualizar la password de un usuario
      **/
      $scope.actualizar_password = function() { 

         //Se mandan las cabeceras y datos de entrada del post 
         $http.defaults.withCredentials = true; 
         $http({ 
            method: 'POST', 
            url: '/session/actualizarpass', 
            headers: {
               'Content-Type': 'application/json', 
               'X-CSRF-TOKEN': $scope.csrfToken 
            }, 
            data: { 
               password: $scope.password, 
               id: $scope.id, 
            } 
         }).success(function (data) {

            //luego del retorno del servidor 
            //se manda mensaje si fue correcto
            if(data.opcion == 'true') { 
               Materialize.toast($mensaje3, 5000); 
            } else {
               //en caso de haber error 
               Materialize.toast($mensaje4, 5000); 
            } 
         });
      }
   }]);