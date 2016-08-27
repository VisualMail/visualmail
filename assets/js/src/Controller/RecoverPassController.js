angular.module('app.RecoverPassCtrl',['ngMessages','gp.rutValidator','selectize'])
.controller('RecoverPassCtrl',["$scope", "$http", "$timeout", function($scope,$http,$timeout){
	

	$scope.email=''; //email
	//variables para mostrar en html
  $scope.mostrar=true; 
	$scope.mostrarpost=false;
/*
*
* FUNCIONES GET
*
*/
  //get para el csrf
	    $http.get('/csrfToken')
      .success(function (token) {
        $scope.csrfToken = token._csrf;
    });

/**
* @method :: sendData 
* @description ::  Se encarga del POST para mandar correo
*/
	$scope.sendData = function(){

  	$http.defaults.withCredentials = true;
    $http({
          method: 'POST',
          url: '/session/sendEmail',
          headers: {'Content-Type': 'application/json',
                  'X-CSRF-TOKEN': $scope.csrfToken 
          },
          data: {
            email: $scope.email //manda el mail ingresado
          }
      }).success(function (data) {//en caso de existir el correo manda mensaje
      	   if(data.opcion=='true'){
                $scope.mensaje1 = $('<span class="color_acentuado-text"> Se ha enviado un correo a '+$scope.email+' </span>');
               Materialize.toast($scope.mensaje1, 5000);
               $scope.mostrar=false;
               $scope.mostrarpost=true;
             }
             else{//en caso de error
                $scope.mensaje2 = $('<span class="color_acentuado-text"> Ocurrió un error, correo no existe </span>');
                Materialize.toast($scope.mensaje2, 5000);
             }   
      	
      	
      });

	}//fin senddata


  }]);