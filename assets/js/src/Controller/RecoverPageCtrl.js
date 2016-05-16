angular.module('app.RecoverPageCtrl',['ngMessages','gp.rutValidator','selectize'])
.controller('RecoverPageCtrl',function($scope,$http,$timeout){
	$scope.clave='';
	$scope.mostrar=true;
	$scope.mostrarpost=false;
    $scope.confirmacion=false;

	    $http.get('/csrfToken')
      .success(function (token) {
        $scope.csrfToken = token._csrf;
    });

	$scope.sendData = function(){
  console.log('sending post');
		$http.defaults.withCredentials = true;
$http({
        method: 'POST',
        url: '/session/verficar_clave',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },

        data: {
          clave: $scope.clave
        }

    }).success(function (data) {
        if(data.opcion=='true'){
        Materialize.toast($mensaje1, 5000);
        $scope.mostrar=false;
        $scope.mostrarpost=true;
        }
        else{
            //error
        Materialize.toast($mensaje2, 5000);
        }
    });
}

$scope.actualizar_pass = function(){
    $http.defaults.withCredentials = true;
$http({
        method: 'POST',
        url: '/session/actualizarpass',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },

        data: {
          password: $scope.password,
          id: $scope.clave,
        }

    }).success(function (data) {
       console.log('fin');
      
       if(data.opcion=='true'){
        Materialize.toast($mensaje3, 5000);
        $scope.confirmacion=true;
       $scope.mostrarpost=false;
       $scope.mostrar = false;
        }
        else{
            //error
        Materialize.toast($mensaje4, 5000);
        }


    });
}

});