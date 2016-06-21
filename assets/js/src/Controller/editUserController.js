angular.module('app.editUserCtrl',['ngMessages','gp.rutValidator','selectize'])
.controller('editUserCtrl',["$scope", "$http", "$timeout", function($scope,$http,$timeout){
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



$scope.actualizar_campos= function(){


$http.defaults.withCredentials = true;
	$http({
        method: 'POST',
        url: '/user/actualizardatos/',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },

        data: {
          id: $scope.id,
          firstname:$scope.firstname,
          lastname:$scope.lastname ,
          imgurl:$scope.imgurl,
          initials:$scope.initials,

        }

    }).success(function (data) {
 
      
       if(data.opcion=='true'){
        location.reload(true);
        //Materialize.toast($mensaje1, 5000);

        }
        else{
        Materialize.toast($mensaje2, 5000);
        }


    });
}

$scope.actualizar_password = function(){
	
	//console.log($scope.password);
	$http.defaults.withCredentials = true;
	$http({
        method: 'POST',
        url: '/session/actualizarpass',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },

        data: {
          password: $scope.password,
          id: $scope.id,
        }

    }).success(function (data) {
       //console.log('fin');
      
       if(data.opcion=='true'){
       	
        Materialize.toast($mensaje3, 5000);

        }
        else{
        Materialize.toast($mensaje4, 5000);
        }

    });


	
}
}]);