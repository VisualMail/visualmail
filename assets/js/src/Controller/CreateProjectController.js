   angular.module('app.createProjectCtrl',['ngMessages','gp.rutValidator','selectize'])
   .controller('createProjectCtrl',["$scope", "$http", "$timeout", function($scope,$http,$timeout){

	$scope.mi_id = new String(id);
	$scope.mi_email=new String(email);
	$scope.finishdate;
	$scope.name_project='';
  $scope.jsonuser;
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
  		//console.log('imprimo mi usuario');
      //console.log(result.data.user);
      //delete result.data.user.projects;
      $scope.jsonuser=result.data.user;
      delete $scope.jsonuser.projects;
      //delete $scope.jsonuser.projects;
      console.log($scope.jsonuser);
  	});

/*
NO OLVIDAR ARREGLAR ESTA FUNCION DEACUERDO A FALLAS EN LOS POST
*/
  	$scope.crearProyecto= function(){
  		//se revisa si el nombre existe
  		$scope.bandera=false;
  		for(var i=0;i<$scope.miusuario.length;i++){
  			if($scope.miusuario[i].name.toLowerCase()==$scope.name_project.toLowerCase() && $scope.miusuario[i].owner_email==$scope.mi_email){
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
	          finish_date:$scope.finish_date,
            roles: []
	        }

	    }).success(function (data) {
			//aqui que llegue el array
			if(data.project=='false'){
 				Materialize.toast($mensaje3, 5000);
			}
			else{
	     //entonces se crea primero el mensaje
        $http({
            method: 'POST',
            url: '/mensaje/create/',
            headers: {'Content-Type': 'application/json',
              'X-CSRF-TOKEN': $scope.csrfToken 
          },
          data: {
           name: 'inicio del nuevo proyecto '+data.project.name,
           project_id:data.project.id,
           tipo: 'nuevo',
           position: [0],
           numero_hijos:0,
           session:0,
           parent:'',
           root:true,
           usuario: $scope.mi_id 
          }

      }).success(function (data_mensaje) {
        //aca van if si falla
        if(data_mensaje.mensaje=='false'){
          Materialize.toast($mensaje3, 5000);
        }
        else{
         $http({
            method: 'POST',
            url: '/dialogo/create/',
            headers: {'Content-Type': 'application/json',
              'X-CSRF-TOKEN': $scope.csrfToken 
          },
          data: {
            project: data.project.id,
            name: 'inicio del nuevo proyecto '+data.project.name,
            root: true,
            children:[],
            session:0,
            numero_hijos:0,
            session_actual:0,
            ultimo_session_email:$scope.jsonuser.email,
            usuario: $scope.jsonuser,
            idmensaje:data_mensaje.mensaje.id,
            parent_ultimo_respondido:data_mensaje.mensaje.id,
          }

      }).success(function (data_dialogo) {
        console.log('mande ya mi post');
        if(data_dialogo.dialogo=='false'){
          console.log('fallo comunicación con el servidor');
          Materialize.toast($mensaje3, 5000);
        }
        else{
          $http({
            method: 'POST',
            url: '/kanban/create/',
            headers: {'Content-Type': 'application/json',
              'X-CSRF-TOKEN': $scope.csrfToken 
          },
          data: {
           project_id:data.project.id,
           project: data.project.id,
           name: 'kanban: '+data.project.name,
          }

      }).success(function (datakanban) {
        if(datakanban.kanban=='false'){
 Materialize.toast($mensaje3, 5000);
        }
        else{
          $scope.miusuario.splice(0,0,data.project);
          Materialize.toast($mensaje1, 5000); 
        }
      });


       
        }
        });
        }
        
      });

			}//fin else
		
	    });

  		}
  		else{//entonces el nombre existe y se manda un mensaje de error
  			Materialize.toast($mensaje2, 5000);
  		}
  		

  	}



   }]);



        