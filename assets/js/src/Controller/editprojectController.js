angular
   .module('app.projectedit', [
      'ngMessages', 
      'gp.rutValidator', 
      'selectize', 
      'ngDragDrop', 
      'luegg.directives', 
      'ui.materialize'
   ])
   .controller('projectedit', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
      $scope.tempAdd = tempAdd;
      /*
      *
      * Declaracion de variables
      *
      **/
      // Expresion regular para el mail
      var REGEX_EMAIL = 
         '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +  
         '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)'; 

      $scope.usuarios = []; 
      $scope.project_id = new String(id);//id del proyecto
      $scope.owner_email = new String(own_email);//email del dueño del proyecto
      $scope.misparticipantes;//usuarios del proyecto menos el del que inicia sesion
      $scope.todos=[];
      $scope.mensajes_proyectos;//datos de los mensajes
      $scope.miproyecto;//datos del proyecto
      $scope.mesajes = [];
      $scope.miusuario;//variable con el objeto del usuario
      $scope.userid = miid; //id del usuario
      $scope.getselectedtask='';//tarea seleccionada
      $scope.inputdatos2;//valores de arreglo para api selectize
      $scope.selectedusuariotask={};
      $scope.tipokanban=['new','doing','testing','done'];//valor de los tipos de kanban
      $scope.largos=[]; //contiene los largos 
      $scope.list4 = []; //contiene mensajes de new
      $scope.list1 = []; //contiene mensajes de doing
      $scope.list3 = []; //contiene mensajes de testing
      $scope.list2 = []; //contiene mensajes de done
      $scope.filtro1;
      $scope.filtro2;
      $scope.filtro3;
      $scope.filtro4;
      $scope.nuevatarea;
      $scope.booleanocss=false;//variable para dar efecto intercalado a los mensajes
      $scope.inputdialogo='';
      $scope.isDisabled=false;
      $scope.finish_date_project='';//variable fecha de termino del proyecto
      $scope.name_project='';//nombre del proyecto


      /**
      *
      * FUNCIONES GET
      *
      **/
      //Adquiere el token de csrf 
      $http.get('/csrfToken') 
         .success(function (token) { 
            $scope.csrfToken = token._csrf; 
         });
      //pide los datos de usuario 
      $http({ 
         url: '/user/findUserOnly/', 
         method: 'GET', 
         params: { 
            id: $scope.userid 
         }
      })
      .then(function(result) { 
         $scope.miusuario = result.data.user; 
      });
   
      //pide todos los datos de los usuarios 
      $http({ 
         url: '/user/getAllEmail/', 
         method: 'GET', 
         params: { id: id } 
      }) 
      .then(function(result) { //obtiene los datos de un proyecto y los usuarios asociados 
         $http({ 
            url: '/project/getOne/', 
            method: 'GET', 
            params: { id: id } 
         })
         .then(function(getOne) { //luego del post 
            $scope.todos=result.data.arr;//variable temporal para copiar los resultados de getallemail 
            $scope.usuarios = [];//se inicializa los usuarios 
            $scope.miproyecto= getOne.data.project;//el dato del proyecto  
            $scope.misparticipantes = getOne.data.project.participants;//el dato de los participantes 

            //Para la API selectize y que solo aparezcan los mail de los usuarios distintos al del usuario que inicio sesion 
            for(i in result.data.arr) { //de todos los valores de getallemail 
               var bandera = 0;//bandera 

               for(j in $scope.misparticipantes) { //para cada participante 
                  if(result.data.arr[i].email == $scope.misparticipantes[j].email) { //si el email del arreglo es igual al email de la persona que inicio sesion 
                     bandera=1; 
                     break; 
                  } 
               } 

               if(bandera == 0) { //si bandera no fue cambiado agrego los usuarios 
                  $scope.usuarios.push(result.data.arr[i]); 
               } 
            } 
         })
         .then(function(getMessages) { 
            $http({ //get para obtener los mensajes 
               url: '/mensaje/getMessages/', 
               method: 'GET', 
               params: { id: $scope.miproyecto.id } 
            })
            .then(function(resultado) { 
               $scope.mensajes = resultado.data.mensaje; 
               //AL cargar los mensajes, se intercala el valor de los mensajes entre true y false para darle un valor intercalado y presentarlos en formato whatsapp 
               for(var i = 0; i < $scope.mensajes.length; i++) { 
                  $scope.mensajes[i]["cssvalue"]= !$scope.booleanocss; 
                  $scope.booleanocss=!$scope.booleanocss; 
               } 
            });
          })
          .then(function(getKanban) { //get para obtener el kanban 
            $http({ 
               url: '/tarea/getTareas/', 
               method: 'GET', 
               params: { id: $scope.miproyecto.id } 
            })
            .then(function(datatarea) { 
               if(datatarea.data.tarea == 'false') { //si hay error 
               
               } 

               //en caso de no haber error 
               for(var i=0;i<datatarea.data.tarea.length;i++) { 

                  //se separa por cada panel del kanban por el tipo de tarea 
                  if(datatarea.data.tarea[i].tipo==$scope.tipokanban[0]){//New 
                     $scope.list1.splice(0,0,datatarea.data.tarea[i]); 
                  }
                  if(datatarea.data.tarea[i].tipo==$scope.tipokanban[1]){//haciendo 
                     $scope.list2.splice(0,0,datatarea.data.tarea[i]); 
                  } 
                  if(datatarea.data.tarea[i].tipo==$scope.tipokanban[2]){//en pruebas 
                     $scope.list3.splice(0,0,datatarea.data.tarea[i]); 
                  } 
                  if(datatarea.data.tarea[i].tipo==$scope.tipokanban[3]){//terminada 
                     $scope.list4.splice(0,0,datatarea.data.tarea[i]); 
                  } 
               } 

               //Guarda los largos de las listas del kanban 
               $scope.largos[0]= $scope.list1.length; 
               $scope.largos[1]=$scope.list2.length; 
               $scope.largos[2]=$scope.list3.length; 
               $scope.largos[3]=$scope.list4.length; 
            }); 
         }); 
      });




      /*FUNCIONES*/


      /**
      * @method :: editproject 
      * @description ::  Funcion para mandar POST con valores nuevos del proyecto
      */
      $scope.editproject = function(){

      if($scope.name_project=='' && ( $scope.finish_date_project=='' || $scope.finish_date_project==null)){//en caso de ser un valor nulo
        
      } else{//en caso de ser un valor distinto de nulo para el nombre o la fecha
         if($scope.name_project=='')
            $scope.name_project= $scope.miproyecto.name;//se actualiza el nombre del proyecto para la vista
  
         if(( $scope.finish_date_project=='' ||$scope.finish_date_project==null))//Se actualiza la fecha para la vista
            $scope.finish_date_project=$scope.miproyecto.finish_date;
         //
         $http({
            method: 'POST',
            url: '/project/editarproyecto',
            headers: {
               'Content-Type': 'application/json', 
               'X-CSRF-TOKEN': $scope.csrfToken  
            }, 
            data: {
               id:$scope.miproyecto.id,
               name:  $scope.name_project,
               finish_date: $scope.finish_date_project
            }
         })
         .success(function (datanew){//en caso de que el post sea realizado 
            if(datanew.project=='false'){//si el servidor devuelve un valor false 
               Materialize.toast($mensaje5, 2000);//se manda mensaje de que no fue posible actualizarlo en el servidor
            } else { //en caso de actualizar los datos
               Materialize.toast($mensaje4, 1000);
               //se actualizan los datos en el cliente y se limpian los datos
               $scope.miproyecto.name= datanew.project.name;
               $scope.miproyecto.finish_date=datanew.project.finish_date;
               $scope.name_project='';
               $scope.finish_date_project=''; 
            } 
         }); 
      }
   }


   /**
   * @method :: creartareaconmensaje 
   * @description ::  Funcion para mandar POST y crear tarea a partir del mensaje
   */
   $scope.creartareaconmensaje= function(){ 

      for(var i=0;i<$scope.misparticipantes.length;i++){ 
         if($scope.misparticipantes[i].id==$scope.getselectedtask){//para identificar cual fue el usuario asociado al mensaje para posterior 
            //unirlo a un mensaje, el usuario seleccionado es el elegido por API selectize 
            $scope.selectedusuariotask= $scope.misparticipantes[i]; 
            break; 
         } 
      } 

      //se eliminan valores que no se utilizan de usuario 
      delete $scope.selectedusuariotask.$$hashKey; 
      delete $scope.selectedusuariotask.$order; 
      delete $scope.selectedusuariotask.password; 
      $scope.associated; 
      $scope.element=$scope.seleccionado.tipo;//el tipo del mensaje (duda, acuerdo,norma ) 

      $http({  
         method: 'POST', 
         url: '/tarea/create', 
         headers: { 
            'Content-Type': 'application/json', 
            'X-CSRF-TOKEN': $scope.csrfToken 
         }, 
         data: {//se mandan las entradas  
            drag:true, 
            tipo:'new', 
            kanban: $scope.miproyecto.kanban[0].id, 
            usuario:$scope.selectedusuariotask.id, 
            title:$scope.nuevatarea, 
            project_id:$scope.miproyecto.id, 
            associated:true, 
            element: $scope.element, 
            mensaje: $scope.seleccionado.id 
         } 
      })
      .success(function (datatarea){//se reciben los valores del post 
         $scope.nuevatarea=''; 
         
         if(datatarea.tarea=='false'){//si hay error en el servidor 
            Materialize.toast($mensaje5, 2000); 
         } else { //si no hay error 
            datatarea.tarea["usuario"]=$scope.selectedusuariotask; 
            $scope.list1.splice(0,0,datatarea.tarea); 
            Materialize.toast($mensaje6, 2000); 
         } 
      }); 
   }

   /**
   * @method :: creartarea 
   * @description ::  Funcion para mandar POST y crear una tarea
   */
   $scope.creartarea= function() { 

      //Para identificar el usuario seleccionado de Selectize 
      for(var i=0;i<$scope.misparticipantes.length;i++) { 
         if($scope.misparticipantes[i].id==$scope.getselectedtask) { 
            $scope.selectedusuariotask= $scope.misparticipantes[i]; 
            break; 
         } 
      } 

      //se eliminan los valores indeseados 
      delete $scope.selectedusuariotask.$$hashKey; 
      delete $scope.selectedusuariotask.$order; 
      delete $scope.selectedusuariotask.password; 

      //se ejecuta el post para crear la tarea 
      $http({ 
         method: 'POST', 
         url: '/tarea/create', 
         headers: { 
            'Content-Type': 'application/json', 
            'X-CSRF-TOKEN': $scope.csrfToken 
         }, 
         data: { //las entradas  
            drag: true, 
            tipo: 'new', 
            kanban: $scope.miproyecto.kanban[0].id, 
            usuario: $scope.selectedusuariotask.id, 
            title: $scope.nuevatarea, 
            project_id: $scope.miproyecto.id, 
            associated: false, 
            element: '' 
         }
      })
      .success(function(datatarea) { 
         //se mandan mensajes para manejar el error 
         $scope.nuevatarea=''; 

         if(datatarea.tarea=='false') { 
            Materialize.toast($mensaje5, 2000); 
         } else { 
            datatarea.tarea["usuario"] = $scope.selectedusuariotask; 
            $scope.list1.splice(0,0,datatarea.tarea); 
            Materialize.toast($mensaje6, 2000); 
         } 
      });
   }

   /**
   * @method :: onDrop 
   * @description ::  Funcion de la API DRAG&DROP que se encarga de manejar los eventos luego de dropear una tarea del kanban
   */
   $scope.onDrop= function(evt,ui) { 
      var obj = ui.draggable.scope().dndDragItem; //elemento que se tiene en el cursor 
      var dragged =-1; 
      var dropped =-1; 

      //detrminar cual fue draggeado y cual dropped 
      //como largos tiene el valor de los tamaños de las tareas por columna 
      //se determina cual fue drageado (quien tiene menos elementos) y cual fue dropeado (quien aumento en 1 elemento) 
      //IFS DE CONSULTA  : 
      if($scope.largos[0] != $scope.list1.length) { 
         if($scope.largos[0] < $scope.list1.length) { 
            dragged=0; 
         } 
         if($scope.largos[0]>$scope.list1.length) { 
            dropped=0; 
         } 
      } 

      if($scope.largos[1]!=$scope.list2.length) { 
         if($scope.largos[1]<$scope.list2.length) { 
            dragged=1; 
         } 
         if($scope.largos[1]>$scope.list2.length) { 
            dropped=1; 
         } 
      } 

      if($scope.largos[2]!=$scope.list3.length) { 
         if($scope.largos[2]<$scope.list3.length) { 
            dragged=2; 
         } 

         if($scope.largos[2]>$scope.list3.length) { 
            dropped=2; 
         } 
      } 
      if($scope.largos[3]!=$scope.list4.length) { 
         if($scope.largos[3]<$scope.list4.length) { 
            dragged=3; 
         } 
         if($scope.largos[3]>$scope.list4.length) { 
            dropped=3; 
         } 
      }

      //Se manda el post para actualizar el tipo 
      $http({ 
         method: 'POST', 
         url: '/tarea/updateTipo', 
         headers: { 
            'Content-Type': 'application/json', 
            'X-CSRF-TOKEN': $scope.csrfToken 
         }, 
         data: { 
            nuevotipo: $scope.tipokanban[dragged], 
            id: obj.id 
         } 
      })
      .success(function(datakanbanupdate) { //bloque para manejar el error y limpiar filtros 
         if(datakanbanupdate.tarea == 'false') { 
            Materialize.toast($mensaje5, 2000); 
            $scope.filtro1=''; 
            $scope.filtro2=''; 
            $scope.filtro3=''; 
            $scope.filtro4=''; 
         } else {  

         } 
      }); 
   } 

   //contiene una lista de todos los id seleccionados en selectize 
   $scope.inputdatos = ''; //variable de selectize, al seleccionar un valor se llena con el valor del usuario

   /**
   * @method :: sendData 
   * @description ::  Funcion para mandar POST que agrega usuarios a un proyecto
   */ 
   $scope.sendData = function() { 

      $http.defaults.withCredentials = true; 
      $http({ 
         method: 'POST', 
         url: '/project/add_user', 
         headers: { 
            'Content-Type': 'application/json', 
            'X-CSRF-TOKEN': $scope.csrfToken 
         }, 
         data: { 
            email: $scope.inputdatos, 
            id: $scope.project_id 
         } 
      })
      .success(function(data) { //en caso de ser un exito el POST  

         //es necesario actualizar de parte del cliente el valor de usuarios para que estos no sean seleccionados en selectize 
         for(var i=0;i<$scope.inputdatos.length;i++){//primero para cada usuario ingresado al proyecto 
            var bandera =0; 
            var position=0; 

            for(var j=0;j<$scope.usuarios.length;j++){//Busca la posicion de cada usuario seleccionado por selectize en usuario  
               if($scope.inputdatos[i]==$scope.usuarios[j].id){ 
                  bandera=1; 
                  position=j; 
                  break; 
               } 
            } 

            if(bandera==1){//si el elemento es encontrado se actualizan los arreglos  
               $scope.misparticipantes.splice(0,0,$scope.usuarios[position]);//participantes lo agrega en la primera posicion 
               $scope.usuarios.splice(position,1);//y agrega el elemento a usuarios 
            } 
         } 

         //Se manda mensaje al usuario 
         if($scope.inputdatos.length==1){ 
            Materialize.toast($mensaje1, 500); 
         } else if($scope.inputdatos.length>=2) { 
            Materialize.toast($mensaje2, 2000); 
         } 

         //Se actualizan y refrescan los valores de Selectize 
         $scope.selectize.clear(); 
         $scope.selectize.refreshItems(); 
      });
   }

   //VARIABLES UTILIZADAS EN FUNCION SENDMESSAGE:
   $scope.respuesta; //debe ser quien guarda el modelo de mi respuesta
   $scope.tiposeleccionado;//indica cual es el tipo seleccionado del mensaje
   $scope.idmensajepadre;//corresponde al id del mensaje que se va a responder
   $scope.tiposeleccionado=''; //CAMBIAR

   //Se enumeran los tipos de dialogo
   $scope.tiposdialogo = [
      { id: 0, title: 'Duda o Alternativa' }, 
      { id: 1, title: 'Normas comunes' }, 
      { id: 2, title: 'Compromiso individual' }, 
      { id: 3, title: 'Acuerdos de Coordinación' }, 
      { id: 4, title: 'Desacuerdo o Brecha' }
   ];

   /**
   * @method :: sendMessage 
   * @description ::  Funcion para mandar POST que crea un nuevo mensaje
   **/
   $scope.sendMessage = function(){ 
      //$scope.isDisabled = true;//variable para mostrar en html 
      $http.defaults.withCredentials = true;//para post de csrf 
      $scope.position=[];//arreglo position a enviar 

      for(var i = 0; i < $scope.seleccionado.position.length; i++) {
         //por cada valor de position del mensaje seleccionado a responder se copia 
         $scope.position.push($scope.seleccionado.position[i]); 
      } 

      //ingresa el valor que le corresponde al nuevo mensaje en position
      $scope.position.push($scope.seleccionado.numero_hijos); 

      $http({//envia post 
         method: 'POST', 
         url: '/mensaje/create', 
         headers: {
            'Content-Type': 'application/json', 
            'X-CSRF-TOKEN': $scope.csrfToken 
         },
         data: { //entradas 
            dialogos: $scope.miproyecto.dialogos[0].id, 
            usuario: $scope.miusuario.id, 
            project_id: $scope.miproyecto.id, 
            name: $scope.respuesta, 
            tipo: $scope.tiposeleccionado, 
            position: $scope.position, 
            root: false, 
            numero_hijos: 0, 
            parent: $scope.seleccionado.id, 
         }
      })
      .success(function (data) { 
         //data retorna el mensaje recien creado en caso de que el post sea creado
         if(data.mensaje=='false') {

         } else { 
            //si la primera operacion fue realizada con exito
            data.mensaje.cssvalue = !$scope.booleanocss;

            $scope.temporaldata=data.mensaje;//mensaje temporal 
            
            //Se manda el POST para unir el mensaje nuevo con el anterior 
            $http({ 
               method: 'POST', 
               url: '/mensaje/unir', 
               headers: {
                  'Content-Type': 'application/json', 
                  'X-CSRF-TOKEN': $scope.csrfToken  
               }, 
               data: { 
                  id: $scope.seleccionado.id, 
                  idunion: data.mensaje.id 
               }
            })
            .success(function(datamensaje) { //se hizo correctamente la union 

               //se actualiza el dato de numero de hijos para el mensaje seleccionado 
               for(var i = 0; i< $scope.mensajes.length; i++) { 
                  if($scope.mensajes[i].id == datamensaje.mensaje.id) { 
                     $scope.mensajes[i].numero_hijos=datamensaje.mensaje.numero_hijos; 
                     break; 
                  } 
               }

               $scope.temporaldata["usuario"]=$scope.miusuario;//se añade el objeto con los valores de usuario
               $scope.mensajes.push($scope.temporaldata);//a los mensajes se le añade el nuevo elemento creado en la parte del cliente
               //buscar padremensaje y añadir hijos

               if(datamensaje.mensaje=='false'){

               }
               else{//ahora se agrega el mensaje creado en el dialogo 
                  //Manda el POST para añadirlo al dialogo 
                  $http({ 
                     method: 'POST', 
                     url: '/dialogo/update_dialogo', 
                     headers: {
                        'Content-Type': 'application/json', 
                        'X-CSRF-TOKEN': $scope.csrfToken  
                     }, 
                     data: { 
                        id:$scope.miproyecto.dialogos[0].id,//corresponde al id del dialogo a buscar 
                        mensaje:$scope.temporaldata, 
                     } 
                  })
                  .success(function (datadialogoupdate) { 
                     $scope.respuesta=''; 
                     //location.reload(true); 
                  }); 
               }//fin else 2 
            }); 
         }//fin else 1 
      });
   }

/**
* @method :: seleccionar 
* @description ::  Le da el valor de seleccionado a un elemento
*/
$scope.seleccionar = function(value){
$scope.seleccionado =value;
}

/** SELECTIZE**/
/**
CONFIGURACIONES DE SELECTIZE
*/
$scope.myConfig = {
  create: false,
  persist:false,
  valueField: 'id',
  labelField: 'firstname',
  delimiter: '|',
  placeholder: 'Seleccione un participante por nombre, rut o correo',
  searchField: ['firstname','email','rut'],

    createFilter: function(input) {
        var match, regex;

        // email@address.com
        regex = new RegExp('^' + REGEX_EMAIL + '$', 'i');
        match = input.match(regex);
        if (match) return !this.options.hasOwnProperty(match[0]);

        // name <email@address.com>
        regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
        match = input.match(regex);
        if (match) return !this.options.hasOwnProperty(match[2]);

        return false;
    },
  render: {
        item: function(item, escape) {
            return '<div>' +
                (item.firstname ? '<span class="name">' + escape(item.firstname+' , ') + '</span>' : '') +
                (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
            '</div>';
        },
        option: function(item, escape) {
            var label = item.firstname || item.email;
            var caption = item.firstname ? item.email : null;
            return '<div>' +
                '<span class="label">' + escape(label+' , ') + '</span>' +
                (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
            '</div>';
        }
    },


  //Funciones para actualizar la lista
  onInitialize: function(selectize){//Al iniciar
    $scope.selectize=selectize;
  },
  onItemRemove: function(value){//Al remover un elemento
    $scope.usuarios.splice(0,0,value);
    $scope.selectize.refreshItems();
  }
};


/**
CONFIGURACIONES DE SELECTIZE PARA TAREA DEL KANBAN 
*/
$scope.myConfig2 = {
  create: false,
  persist:false,
  maxItems:1,
  valueField: 'id',
  labelField: 'firstname',
  delimiter: '|',
  placeholder: 'Hacer responsable',
  searchField: ['firstname','email','rut'],

    createFilter: function(input) {
        var match, regex;

        // email@address.com
        regex = new RegExp('^' + REGEX_EMAIL + '$', 'i');
        match = input.match(regex);
        if (match) return !this.options.hasOwnProperty(match[0]);

        // name <email@address.com>
        regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
        match = input.match(regex);
        if (match) return !this.options.hasOwnProperty(match[2]);

        return false;
    },
  render: {
        item: function(item, escape) {
            return '<div>' +
                (item.firstname ? '<span class="name">' + escape(item.firstname+' , ') + '</span>' : '') +
                (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
            '</div>';
        },
        option: function(item, escape) {
            var label = item.firstname || item.email;
            var caption = item.firstname ? item.email : null;
            return '<div>' +
                '<span class="label">' + escape(label+' , ') + '</span>' +
                (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
            '</div>';
        }
    },

  //Funciones para actualizar la lista
  onInitialize: function(selectize){
    $scope.selectize=selectize;
  },
  onItemRemove: function(value){
    $scope.misparticipantes.splice(0,0,value);
    $scope.getselectedtask='';
    $scope.selectedusuariotask={};
    $scope.selectize.refreshItems();
  },
  onItemAdd: function(value,item){
    $scope.getselectedtask=value;

  },
  onDropdownOpen: function(dropdown){
    $scope.selectize.clear();
    $scope.selectize.refreshItems();

  }
  }



/**
CONFIGURACIONES DE SELECTIZE PARA ELEMENTOS DEL DIALOGO 
*/

$scope.myConfig3 = {
  create: false,
  persist:false,
  maxItems:1,
  valueField: 'title',
  labelField: 'title',
  delimiter: '|',
  placeholder: 'Tipo de elemento del diálogo',
  searchField: ['title'],
  //Funciones de Actualizacion y de eventos de SELECTIZE
  onInitialize: function(selectize){
    $scope.selectize=selectize;
  },
  onDropdownOpen: function(dropdown){
    $scope.selectize.clear();
    $scope.selectize.refreshItems();

  },
  onItemRemove: function(value){
    $scope.tiposdialogo.splice(0,0,value);
    $scope.tiposeleccionado='';
    $scope.selectize.refreshItems();
  },
  onItemAdd: function(value,item){
    $scope.tiposeleccionado=value;
    console.log($scope.tiposeleccionado);
  },

  }

  //VALORES DE CONFIGURACION DE CALENDAR
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
  var days = 365;
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



   function tempAdd() {
   var addMsj = 
        /*{
          "usuario": {
            "firstname": "Jack",
            "lastname": "Bauer",
            "imgurl": "https://upload.wikimedia.org/wikipedia/en/b/b9/Jack_Bauer.jpg",
            "email": "jbauer@ctu.gov",
            "initials": "CTU",
            "rut": "145895707",
            "password": "$2a$10$Fb/KE1cOLcyAiOJpLHAsbeX1guKNXKzf/PZx93YU2GUaampB.XUtq",
            "id": "57fad7426729d9f00207cb5d"
          },
          "name": "Este valor se añade como ejemplo",
          "project_id": "57fad7da6729d9f00207cb5e",
          "tipo": "Mensaje Inicial",
          "position": [
            0,
            2
          ],
          "numero_hijos": 0,
          "parent": "57fad7db6729d9f00207cb60",
          "root": false,
          "createdAt": "2016-10-09T23:50:51.115Z",
          "updatedAt": "2016-10-10T14:03:17.679Z",
          "id": "57fad7db6729d9f00207c999",
          "cssvalue": true
        };*/

 {
    "usuario": {
      "firstname": "Jack",
      "lastname": "Bauer",
      "imgurl": "https://upload.wikimedia.org/wikipedia/en/b/b9/Jack_Bauer.jpg",
      "email": "jbauer@ctu.gov",
      "initials": "CTU",
      "rut": "145895707",
      "id": "57fad7426729d9f00207cb5d"
    },
    "project_id": "57fad7da6729d9f00207cb5e",
    "name": "Este Es Un Mensaje de Prueba",
    "tipo": "Desacuerdo o Brecha",
    "position": [
      0,
      0,
      1,
      1
    ],
    "root": false,
    "numero_hijos": 0,
    "parent": "57fba83a7b97ed540333c9c3",
    "createdAt": "2016-10-10T14:41:56.959Z",
    "updatedAt": "2016-10-10T14:41:56.959Z",
    "id": "57fba8b47b97ed540333c9c5"
  };


      $scope.mensajes.push(addMsj);
  };


   /*
   * Inicio Web Sockets
   */
   io.socket.on("conectar_socket", function gotSocketConectado(data) { 
      var notificacion = $('#tempNotification');
      notificacion.html(notificacion.html() + '<br />' + "El servidor envió: '" + data.message + "''.");
      console.log("El servidor envió: '" + data.message + "''."); 
   }); 

   io.socket.get('/project/conectar_socket', { project_id: $scope.project_id }, function gotResponse(body, response) { 
      console.log('El servidor respondió con código ' + response.statusCode + ' y datos: ', body); 
   });
}]);