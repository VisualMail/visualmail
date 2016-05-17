angular.module('app.editUserCtrl',['ngMessages','gp.rutValidator','selectize'])
.controller('editUserCtrl',function($scope,$http,$timeout){

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
});