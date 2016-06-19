angular.module('app.projectedit',['ngMessages','gp.rutValidator','selectize','ngDragDrop','luegg.directives','ui.materialize'])
.controller('projectedit',function($scope,$http,$timeout){
var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                  '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';
$scope.usuarios = [];
$scope.project_id = new String(id);
$scope.owner_email = new String(own_email);
$scope.misparticipantes;
$scope.todos=[];
$scope.mensajes_proyectos;
$scope.miproyecto;
$scope.mesajes;
$scope.miusuario;
$scope.userid = miid;
$scope.getselectedtask='';
$scope.inputdatos2;
$scope.selectedusuariotask={};
$scope.tipokanban=['new','doing','testing','done'];
$scope.largos=[];
$scope.list4 = [];
$scope.list1 = [];
$scope.list3 = [];  
$scope.list2 = [];
$scope.filtro1;
$scope.filtro2;
$scope.filtro3;
$scope.filtro4;
$scope.nuevatarea;
$scope.booleanocss=false;
  $scope.select = {
            value: "Option1",
            choices: ["Option1", "I'm an option", "This is materialize", "No, this is Patrick."]
        };
$scope.creartarea= function(){
    
  //$scope.list1.splice(0,0,{'title':$scope.nuevatarea,'drag':true});
  for(var i=0;i<$scope.misparticipantes.length;i++){
    if($scope.misparticipantes[i].id==$scope.getselectedtask){
      $scope.selectedusuariotask= $scope.misparticipantes[i];
      break;
    }
  }
  //console.log('aca');
  //console.log($scope.selectedusuariotask);
  
  //$scope.json.push($scope.selectedusuariotask);
  delete $scope.selectedusuariotask.$$hashKey;
  delete $scope.selectedusuariotask.$order;
  delete $scope.selectedusuariotask.password;

        $http({
        method: 'POST',
        url: '/tarea/create',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },
        data: {
          drag:true,
          tipo:'new',
          kanban: $scope.miproyecto.kanban[0].id,
          usuario:$scope.selectedusuariotask.id,
          title:$scope.nuevatarea,
          project_id:$scope.miproyecto.id
        }

        }).success(function (datatarea){
           if(datatarea.tarea=='false'){
             Materialize.toast($mensaje5, 2000);
            }
          else{
            
            datatarea.tarea["usuario"]=$scope.selectedusuariotask;
            $scope.list1.splice(0,0,datatarea.tarea);
            Materialize.toast($mensaje6, 2000);
           }
          
        });


}
$scope.onDrop= function(evt,ui){
  //console.log('he aqui el drop manda el post');
    //console.log($scope.list1);
    var obj = ui.draggable.scope().dndDragItem;

    //console.log(obj);
    //determinar cual cambio
    var dragged=-1;
    var dropped=-1;
    //detrminar cual fue draggeado y cual dropped
    if($scope.largos[0]!=$scope.list1.length){
      if($scope.largos[0]<$scope.list1.length){
        dragged=0;
      }
      if($scope.largos[0]>$scope.list1.length){
        dropped=0;
      }
    }
  if($scope.largos[1]!=$scope.list2.length){
      if($scope.largos[1]<$scope.list2.length){
        dragged=1;
      }
      if($scope.largos[1]>$scope.list2.length){
        dropped=1;
      }
    }
    if($scope.largos[2]!=$scope.list3.length){
      if($scope.largos[2]<$scope.list3.length){
        dragged=2;
      }
      if($scope.largos[2]>$scope.list3.length){
        dropped=2;
      }
    }
    if($scope.largos[3]!=$scope.list4.length){
      if($scope.largos[3]<$scope.list4.length){
        dragged=3;
      }
      if($scope.largos[3]>$scope.list4.length){
        dropped=3;
      }
    }
    //console.log(dropped);
    //console.log(dragged);
    //console.log($scope.tipokanban[dragged]);

    //console.log(obj);
    $http({
        method: 'POST',
        url: '/tarea/updateTipo',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },

        data: {
          nuevotipo: $scope.tipokanban[dragged],
          id: obj.id
        }

    }).success(function (datakanbanupdate){
      if(datakanbanupdate.tarea=='false'){
         Materialize.toast($mensaje5, 2000);
         $scope.filtro1='';
         c
         $scope.filtro2='';
         $scope.filtro3='';
         $scope.filtro4='';
      }
      else{
         //Materialize.toast($mensaje4, 2000);
      }
    });


    //es 1 post 
    
}
//aqui lelgan las tareas del kanban


    $http.get('/csrfToken')
      .success(function (token) {
        $scope.csrfToken = token._csrf;
    });

$http({
    url:'/user/findUserOnly/',
    method: 'GET',
    params: {id: $scope.userid}
  }).then(function(result){
    $scope.miusuario = result.data.user;
  });


$http({
    url:'/user/getAllEmail/',
    method: 'GET',
    params: {id: id}
  })

  .then(function(result) {
    $http({
    url:'/project/getOne/',
    method: 'GET',
    params: {id: id}
  }).then(function(getOne){
    $scope.todos=result.data.arr;
    //console.log(value);
    $scope.usuarios = [];
    $scope.miproyecto= getOne.data.project;
    $scope.misparticipantes = getOne.data.project.participants;
    //console.log($scope.miproyecto);

    for(i in result.data.arr){
      var bandera=0;
      for(j in $scope.misparticipantes){
        //console.log($scope.copy[j].email);
        if(result.data.arr[i].email==$scope.misparticipantes[j].email){
          bandera=1;
          break;
        }
      }
    if(bandera==0){
      $scope.usuarios.push(result.data.arr[i]);
    }
    }

  }).then(function(getMessages){
    //console.log($scope.miproyecto.dialogos[0].id);

    $http({
        url:'/mensaje/getMessages/',
        method: 'GET',
        params: {id: $scope.miproyecto.id}
      }).then(function(resultado){
        //console.log(resultado.data.mensaje);
        $scope.mensajes = resultado.data.mensaje;
        console.log($scope.mensajes);
        for(var i=0;i<$scope.mensajes.length;i++){
          $scope.mensajes[i]["cssvalue"]= !$scope.booleanocss;
          $scope.booleanocss=!$scope.booleanocss;
        }
      });


      }).then(function(getKanban){//Se obtiene el kanban
          $http({
              url:'/tarea/getTareas/',
              method: 'GET',
              params: {id:$scope.miproyecto.id}
            }).then(function(datatarea){
              console.log('tarea');
              console.log(datatarea);
              if(datatarea.data.tarea=='false'){
               
              }

              for(var i=0;i<datatarea.data.tarea.length;i++){

                if(datatarea.data.tarea[i].tipo==$scope.tipokanban[0]){
                  $scope.list1.splice(0,0,datatarea.data.tarea[i]);
                }
                if(datatarea.data.tarea[i].tipo==$scope.tipokanban[1]){
                  $scope.list2.splice(0,0,datatarea.data.tarea[i]);
                }
                if(datatarea.data.tarea[i].tipo==$scope.tipokanban[2]){
                  $scope.list3.splice(0,0,datatarea.data.tarea[i]);
                }
                if(datatarea.data.tarea[i].tipo==$scope.tipokanban[3]){
                  $scope.list4.splice(0,0,datatarea.data.tarea[i]);
                }
              }
              $scope.largos[0]= $scope.list1.length;
              $scope.largos[1]=$scope.list2.length;
              $scope.largos[2]=$scope.list3.length;
              $scope.largos[3]=$scope.list4.length;
            });

      });
    });





$scope.inputdatos = '';
$scope.sendData = function(){

$http.defaults.withCredentials = true;
$http({
        method: 'POST',
        url: '/project/add_user',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },

        data: {
          email: $scope.inputdatos,
          id: $scope.project_id
        }

    }).success(function (data) {      
        for(var i=0;i<$scope.inputdatos.length;i++){
          var bandera =0;
          var position=0;

          for(var j=0;j<$scope.usuarios.length;j++){
            if($scope.inputdatos[i]==$scope.usuarios[j].id){
              bandera=1;
              position=j;
            
              break;
            }
          }
          if(bandera==1){
            //console.log(position);
            //console.log($scope.usuarios);
            $scope.misparticipantes.splice(0,0,$scope.usuarios[position]);
            $scope.usuarios.splice(position,1);


          }
        }

        //aqui mensaje
        if($scope.inputdatos.length==1){
          Materialize.toast($mensaje1, 500);
        }
        else if($scope.inputdatos.length>=2){
          Materialize.toast($mensaje2, 2000);
        }
        $scope.selectize.clear();
        $scope.selectize.refreshItems();
    });


}

//primero crear el mensaje
//luego unir los dos mensajes
//recibir como entrada el mensaje y guardarlo en dialogo
$scope.respuesta; //debe ser quien guarda el modelo de mi respuesta
$scope.tiposeleccionado;//indica cual es el tipo seleccionado del mensaje
$scope.idmensajepadre;//corresponde al id del mensaje que se va a responder
$scope.tiposeleccionado='duda'; //CAMBIAR
$scope.sendMessage = function(){
$http.defaults.withCredentials = true;
$scope.position=[];
for(var i=0;i<$scope.seleccionado.position.length;i++){
  $scope.position.push($scope.seleccionado.position[i]);
}
//console.log($scope.seleccionado.numero_hijos);
//nuevo scope position a ingresar
$scope.position.push($scope.seleccionado.numero_hijos);
console.log($scope.position);
$http({
        method: 'POST',
        url: '/mensaje/create',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },
        data: {
          dialogos: $scope.miproyecto.dialogos[0].id,
          usuario: $scope.miusuario.id,
          project_id:$scope.miproyecto.id,
          name:$scope.respuesta,
          tipo:$scope.tiposeleccionado,
          position:$scope.position,
          root:false,
          numero_hijos:0,
        }

    }).success(function (data) {
      //retorna el mensaje recien creado

      if(data.mensaje=='false'){

      }
      else{ //else 1
        //llamar a nuevo post
        $scope.temporaldata=data.mensaje;
        $http({
        method: 'POST',
        url: '/mensaje/unir',
        headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
        },
        data: {
          id:$scope.idmensajepadre,
          idunion:data.mensaje.id
        }

        }).success(function (datamensaje) {
          //se hizo correctamente la union
          //se actualiza el dato
          for(var i=0;i<$scope.mensajes.length;i++){
            if($scope.mensajes[i].id==datamensaje.mensaje.id){
              $scope.mensajes[i].numero_hijos=datamensaje.mensaje.numero_hijos;
              //console.log('nuevo numero de hijos'+$scope.mensajes[i].numero_hijos);
              break;
            }

          }
          //console.log(datamensaje.mensaje);
          //console.log(datamensaje.mensaje);
          
          $scope.temporaldata["usuario"]=$scope.miusuario;
          $scope.mensajes.push($scope.temporaldata);
          //buscar padremensaje y añadir hijos

          if(datamensaje.mensaje=='false'){

          }
          else{//ahora se agrega en el dialogo
            console.log($scope.miproyecto.dialogos[0].id);
            $http({
              method: 'POST',
              url: '/dialogo/update_dialogo',
              headers: {'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $scope.csrfToken 
              },
              data: {
                id:$scope.miproyecto.dialogos[0].id,//corresponde al id del dialogo a buscar
                mensaje:$scope.temporaldata,
              }
            }).success(function (datadialogoupdate) {
                //console.log('termino');
                location.reload(true);
                });
          }//fin else 2
        });

      
      }//fin else 1
    });

}
$scope.seleccionar = function(value){
$scope.seleccionado =value;
}

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


  onInitialize: function(selectize){
    // receives the selectize object as an argument
    //console.log('Initialized',selectize);
    $scope.selectize=selectize;
  },
  onItemRemove: function(value){
    $scope.usuarios.splice(0,0,value);
    $scope.selectize.refreshItems();
  }
};



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
  onInitialize: function(selectize){
    // receives the selectize object as an argument
    //console.log('Initialized',selectize);
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
    console.log($scope.getselectedtask);
  },
  onDropdownOpen: function(dropdown){
    $scope.selectize.clear();
    $scope.selectize.refreshItems();

  }
  }



});