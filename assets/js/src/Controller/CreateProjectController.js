   angular.module('app.createProjectCtrl',['ngMessages','gp.rutValidator','selectize'])
   .controller('createProjectCtrl',function($scope,$http,$timeout){

	$scope.mi_id = new String(id);
	$scope.mi_email=new String(email);
	$scope.finishdate;
	$scope.name_project='';

	$http.get('/csrfToken')
    .success(function (token) {
    	$scope.csrfToken = token._csrf;
    });
    $http({
    url:'/user/getAllProjects/',
    method: 'GET',
    params: {id: id}
  	}).then(function(result) {
  		$scope.miusuario= result.data.user.projects;
  		console.log($scope.miusuario);
  	});



  	$scope.crearProyecto= function(){
  		//se revisa si el nombre existe
  		$scope.bandera=false;
  		for(var i=0;i<$scope.miusuario.length;i++){
  			if($scope.miusuario[i].name==$scope.name_project && $scope.miusuario[i].owner_email==$scope.mi_email){
  				$scope.bandera=true;
  				break;
  			}	
  		}
  		if($scope.bandera==false){
			$http.defaults.withCredentials = true;
			$http({
	        	method: 'POST',
	        	url: '/project/create',
	        	headers: {'Content-Type': 'application/json',
	            'X-CSRF-TOKEN': $scope.csrfToken 
	        },
	        data: {
	          owner_email: $scope.mi_email,
	          participants: $scope.mi_id,
	          name: $scope.name_project,
	          finish_date:$scope.finish_date
	        }

	    }).success(function (data) {
			//aqui que llegue el array
			if(data.project=='false'){
 				Materialize.toast($mensaje3, 5000);
			}
			else{
	
				$scope.miusuario.splice(0,0,data.project);
			 	Materialize.toast($mensaje1, 5000);
			}
		
	    });

  		}
  		else{
  			Materialize.toast($mensaje2, 5000);
  		}
  		

  	}



   });
