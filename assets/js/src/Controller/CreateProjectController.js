   angular.module('app.createProjectCtrl',['ngMessages','gp.rutValidator','selectize'])
   .controller('createProjectCtrl',["$scope", "$http", "$timeout", function($scope,$http,$timeout){

	$scope.mi_id = new String(id); //id del usuario
	$scope.mi_email=new String(email);//email del usuario
	$scope.finishdate;//fecha de termino
	$scope.name_project='';//fecha del nombre del proyecto
  $scope.jsonuser;


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
  //get para obtener todos los proyectos
  $http({
    url:'/user/getAllProjects/',
    method: 'GET',
    params: {id: id}
  	}).then(function(result) {
  		$scope.miusuario= result.data.user.projects;
      $scope.jsonuser=result.data.user;
      delete $scope.jsonuser.projects;
  	});

  
/**
* @method :: crearProyecto 
* @description ::  POST para crear proyecto
*/
  	$scope.crearProyecto= function(){
  		//se revisa si el nombre existe
  		$scope.bandera=false;
  		for(var i=0;i<$scope.miusuario.length;i++){//revisa todos los proyectos existente de un usuario
  			//si el nombre del proyecto es igual al ingresado
        if($scope.miusuario[i].name.toLowerCase()==$scope.name_project.toLowerCase() && $scope.miusuario[i].owner_email==$scope.mi_email){
  				$scope.bandera=true;//la bandera es verdadera, etonces no se manda el post
  				break;
  			}	
  		}
  		if($scope.bandera==false){//si el nombre no se repite
			$http.defaults.withCredentials = true;

			$http({
	        	method: 'POST',
	        	url: '/project/create',
	        	headers: {'Content-Type': 'application/json',
	            'X-CSRF-TOKEN': $scope.csrfToken 
	        },
	        data: {
	          owner_email: $scope.mi_email, //email del usuario que crea el proyecto
	          participants: $scope.mi_id,//el id del usuario
	          name: $scope.name_project,//el nombre del proyecto
	          finish_date:$scope.finish_date,//la fecha de termino
            roles: [] //roles no implementado
	        }

	    }).success(function (data) {//si el POST es valido
			//si retorna del servidor un false entonces manda mensaje
			if(data.project=='false'){
 				Materialize.toast($mensaje3, 5000);
			}
			else{//si el servidor correctamente el json
	       //Entonces se crea un post para crear el mensaje inicial
        $http({
            method: 'POST',
            url: '/mensaje/create/',
            headers: {'Content-Type': 'application/json',
              'X-CSRF-TOKEN': $scope.csrfToken 
          },
          data: {
           name: 'inicio del nuevo proyecto '+data.project.name,//el texto del mensaje + nombre del proyecto
           project_id:data.project.id,//el id del proyecto
           tipo: 'Mensaje Inicial',//el tipo del mensaje inicial ya que no es un elemento dialogico
           position: [0],//la posicion del mensaje en Dialog
           numero_hijos:0,//su numero de hijos
           session:0,//el valor de sesion inicial
           parent:'',//el padre por defecto = vacio
           root:true,//la raiz
           usuario: $scope.mi_id //el id del usuario
          }

      }).success(function (data_mensaje) {//si el POST es valifo
        
        if(data_mensaje.mensaje=='false'){//Si hay error manda mensaje
          Materialize.toast($mensaje3, 5000);
        }
        else{
        //En caso de realizar el post correctamente, realiza un nuevo POST ara crear el dialogo
         $http({
            method: 'POST',
            url: '/dialogo/create/',
            headers: {'Content-Type': 'application/json',
              'X-CSRF-TOKEN': $scope.csrfToken 
          },
          data: {
            //Se repiten los valores del mensaje para el inicio de Dialog ya que es un JSON con formato d3.js
            project: data.project.id,
            name: 'inicio del nuevo proyecto '+data.project.name,
            root: true,
            children:[], //aqui van en un futuro los mensajes hijos
            session:0,
            numero_hijos:0,
            session_actual:0,
            ultimo_session_email:$scope.jsonuser.email, //el ultimo usuario que realizo un mensaje
            usuario: $scope.jsonuser,//el objeto usuario
            idmensaje:data_mensaje.mensaje.id, //el id del mensaje que se realizo
            parent_ultimo_respondido:data_mensaje.mensaje.id,//el padre id del mensaje (es el mismo para el primer caso)
            tipo:'Mensaje inicial'
          }

      }).success(function (data_dialogo) {
        //Nuevamente manda otro post para crear el Kanban del proyecto
        if(data_dialogo.dialogo=='false'){//en caso de error manda mensaje
          console.log('fallo comunicación con el servidor');
          Materialize.toast($mensaje3, 5000);
        }
        else{
          //Se manda el POST para la creacion del kanban
          $http({
            method: 'POST',
            url: '/kanban/create/',
            headers: {'Content-Type': 'application/json',
              'X-CSRF-TOKEN': $scope.csrfToken 
          },
          data: {
           project_id:data.project.id, //id del proyecto
           project: data.project.id,//id del proyecto
           name: 'kanban: '+data.project.name,//nombre del proyecto
          }

      }).success(function (datakanban) {//en caos de existir algun error se deplega mensaje
        if(datakanban.kanban=='false'){
          Materialize.toast($mensaje3, 5000);
        }
        else{//en caso de no haber error
          $scope.miusuario.splice(0,0,data.project); //se agrega a la lista de proyectos en la primera posicion, el proyecto recien creado
          Materialize.toast($mensaje1, 5000); //se manda mensaje
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

  //VARIABLES DEL CALENDARIO MATERIALIZE-ANGULAR

    var currentTime = new Date();
    $scope.currentTime = currentTime;
    $scope.month = [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ];
    $scope.monthShort = [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic' ];
    $scope.weekdaysFull = [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ];
    $scope.weekdaysLetter = [ 'D', 'L', 'M', 'X', 'J', 'V', 'S' ];
    $scope.disable = [false, 1, 7];
    $scope.today = 'Hoy';
    $scope.clear = 'Limpiar';
    $scope.close = 'Cerrar';
    var days = 365; //muestra 365 posteriores y anteriores
    $scope.minDate = (new Date($scope.currentTime.getTime() - ( 1000 * 60 * 60 *24 * days ))).toISOString();
    $scope.maxDate = (new Date($scope.currentTime.getTime() + ( 1000 * 60 * 60 *24 * days ))).toISOString();
    $scope.onStart = function () {
        
    };
    $scope.onRender = function () {
        
    };
    $scope.onOpen = function () {
        
    };
    $scope.onClose = function () {
        
    };
    $scope.onSet = function () {
       
    };
    $scope.onStop = function () {
       
    };


   }]);



        