angular.module('app.RecoverPassCtrl',['ngMessages','gp.rutValidator','selectize'])
.controller('RecoverPassCtrl',function($scope,$http,$timeout){
	

	$scope.email='';
	$scope.mostrar=true;
	$scope.mostrarpost=false;
	    $http.get('/csrfToken')
      .success(function (token) {
        $scope.csrfToken = token._csrf;
    });

	$scope.sendData = function(){

		$http.defaults.withCredentials = true;
$http({
        method: 'POST',
        url: '/session/sendEmail',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },

        data: {
          email: $scope.email
        }

    }).success(function (data) {
    	   if(data.opcion=='true'){
              $scope.mensaje1 = $('<span class="color_acentuado-text"> Se ha enviado un correo a '+$scope.email+' </span>');
             Materialize.toast($scope.mensaje1, 5000);
             $scope.mostrar=false;
             $scope.mostrarpost=true;
           }
           else{
              $scope.mensaje2 = $('<span class="color_acentuado-text"> Ocurrió un error, correo no existe </span>');
              Materialize.toast($scope.mensaje2, 5000);
           }   
    	
    	
    });

	}//fin senddata


  });