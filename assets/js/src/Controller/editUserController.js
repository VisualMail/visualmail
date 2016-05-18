angular.module('app.editUserCtrl',['ngMessages','gp.rutValidator','selectize'])
.controller('editUserCtrl',function($scope,$http,$timeout){
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
if($scope.lastname==null)
	console.log('si es nulo');
if($scope.lastname=='')
	console.log('largo cero');



$scope.actualizar_campos= function(){
console.log($scope.firstname);
console.log($scope.lastname);
console.log($scope.imgurl);
console.log($scope.initials);

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
       console.log('fin');
      
       if(data.opcion=='true'){
        Materialize.toast($mensaje1, 5000);
        }
        else{
        Materialize.toast($mensaje2, 5000);
        }


    });
}

$scope.actualizar_password = function(){
	
	console.log($scope.password);
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
       console.log('fin');
      
       if(data.opcion=='true'){
        Materialize.toast($mensaje3, 5000);
        }
        else{
        Materialize.toast($mensaje4, 5000);
        }


    });


	
}
});