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
        url: '/session/actualizarpass',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },

        data: {
          email: $scope.email
        }

    }).success(function (data) {
    	$scope.mensaje1 = $('<span class="color_acentuado-text"> Se ha enviado un correo a '+$scope.email+' </span>');
    	 Materialize.toast($scope.mensaje1, 5000);
    	 $scope.mostrar=false;
    	 $scope.mostrarpost=true;
    });

	}//fin senddata


  });