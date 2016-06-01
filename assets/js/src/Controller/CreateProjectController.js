   angular.module('app.createProjectCtrl',['ngMessages','gp.rutValidator','selectize'])
   .controller('createProjectCtrl',function($scope,$http,$timeout){


	$http.get('/csrfToken')
    .success(function (token) {
    	$scope.csrfToken = token._csrf;
    });

    $scope.miusuario= JSON.stringify(usuario);
    console.log($scope.miusuario);

   });
