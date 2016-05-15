angular.module('app.projectedit',['ngMessages','gp.rutValidator','selectize'])
.controller('projectedit',function($scope,$http,$timeout){
var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                  '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';
$scope.usuarios = [];
var id= '<%=project.id%>';
$scope.project_id = new String(id);

$http({
    url:'/user/getAllEmail/',
    method: 'GET',
    params: {id: $scope.project_id}
  })

  .then(function(result) {
    $scope.usuarios = [];
    $scope.copy =  JSON.stringify('<%=project.participants%>');

    for(i in result.data.arr){
      var bandera=0;
      for(j in $scope.copy){
        //console.log($scope.copy[j].email);
        if(result.data.arr[i].email==$scope.copy[j].email){
          bandera=1;
          break;
        }
      }
    if(bandera==0){
      $scope.usuarios.push(result.data.arr[i]);
    }
    }



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
        location.reload();
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
  }
};


});