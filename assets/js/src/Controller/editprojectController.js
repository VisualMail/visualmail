angular.module('app.projectedit',['ngMessages','gp.rutValidator','selectize'])
.controller('projectedit',function($scope,$http,$timeout){
var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                  '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';
$scope.usuarios = [];
$scope.project_id = new String(id);
$scope.owner_email = new String(own_email);
$scope.misparticipantes;
$scope.todos=[];

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
    $scope.misparticipantes = getOne.data.project.participants;
    //console.log(value);

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

  });




    });


    $http.get('/csrfToken')
      .success(function (token) {
        $scope.csrfToken = token._csrf;
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
        //location.reload();
        
        //console.log($scope.todos);
        //console.log('siguiente');
        //console.log($scope.inputdatos);
        
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


$scope.myConfig = {
  create: false,
  persist:false,
  valueField: 'id',
  labelField: 'firstname',
  delimiter: '|',
  placeholder: 'Seleccione un correo',
  searchField: ['firstname','email'],

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
  }
};


});