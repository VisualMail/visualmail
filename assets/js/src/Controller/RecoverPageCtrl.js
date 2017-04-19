angular.module('app.RecoverPageCtrl',['ngMessages','gp.rutValidator','selectize'])
.controller('RecoverPageCtrl',["$scope", "$http", "$timeout", function($scope,$http,$timeout){
	
    $scope.clave='';//clave
    //Variables para mostrar en el html
	$scope.mostrar=true;
	$scope.mostrarpost=false;
    $scope.confirmacion=false;

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
* @description ::  POST para verificar si la clave es aceptada
*/
	$scope.sendData = function(){
  
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
        }).success(function (data) {//si el post es correcto
            if(data.opcion=='true'){//manda mensaje y cambia a true el mostrarpost
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
/**
* @method :: actualizar_pass 
* @description ::  POST para actualizar la pass de un usuario
*/
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
           if(data.opcion=='true'){//en caso de no haber error se manda mensaje y actualiza variables para mostrar en html
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

}]);