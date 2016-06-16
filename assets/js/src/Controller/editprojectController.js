angular.module('app.projectedit',['ngMessages','gp.rutValidator','selectize','ngDragDrop'])
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
$scope.getselectedtask;


  $scope.list4 = [];
  $scope.list1 = [{ 'title': 'Item 1', 'drag': true }];
  $scope.list3 = [];  
  $scope.list2 = [
    { 'title': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'drag': true },
    { 'title': 'Item 2', 'drag': true },
    { 'title': 'Item 3', 'drag': true },
    { 'title': 'Item 4', 'drag': true },
    { 'title': 'Item 5', 'drag': true },
    { 'title': 'Item 6', 'drag': true },
    { 'title': 'Item 7', 'drag': true },
    { 'title': 'Item 8', 'drag': true }
  ];


$scope.creartarea= function(){
  $scope.list1.splice(0,0,{'title':$scope.nuevatarea,'drag':true});
}

//aqui lelgan las tareas del kanban
$scope.tipokanban=['new','doing','testing','done'];

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
    console.log($scope.miproyecto);

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
        
      });


      }).then(function(getKanban){//Se obtiene el kanban
          $http({
              url:'/kanban/getKanban/',
              method: 'GET',
              params: {id:$scope.miproyecto.kanban[0].id}
            }).then(function(datakanban){
              if(datakanban.data.kanban=='false'){
              }
              for(var i=0;i<datakanban.data.kanban.tareas.length;i++){
                if(datakanban.data.kanban.tareas[i].tipo==$scope.tipokanban[0]){
                  $scope.list1.splice=(0,0,datakanban.data.kanban.tareas[i]);
                }
                if(datakanban.data.kanban.tareas[i].tipo==$scope.tipokanban[1]){
                  $scope.list2.splice=(0,0,datakanban.data.kanban.tareas[i]);
                }
                if(datakanban.data.kanban.tareas[i].tipo==$scope.tipokanban[2]){
                  $scope.list3.splice=(0,0,datakanban.data.kanban.tareas[i]);
                }
                if(datakanban.data.kanban.tareas[i].tipo==$scope.tipokanban[3]){
                  $scope.list4.splice=(0,0,datakanban.data.kanban.tareas[i]);
                }
              }
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
          Materialize.toast($mensaje1, 5000);
        }
        else if($scope.inputdatos.length>=2){
          Materialize.toast($mensaje2, 5000);
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
    console.log(value.name);
    $scope.selectize.refreshItems();
  }
};


$scope.inputdatos2;
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
    $scope.getselectedtask={};
    $scope.selectize.refreshItems();
  },
  onItemAdd: function(value,item){
    $scope.getselectedtask=item;
    console.log(value);
  },
  onDropdownOpen: function(dropdown){
    $scope.selectize.clear();
    $scope.selectize.refreshItems();

  }
  }



});