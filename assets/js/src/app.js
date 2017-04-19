 angular.module('app',['ngMessages','gp.rutValidator','selectize','ngDragDrop',
  'app.projectedit','app.signupctrl','app.LoginCtrl','app.RecoverPassCtrl','app.RecoverPageCtrl','ui.materialize',
  'app.editUserCtrl','app.createProjectCtrl'])
 .directive('capitalize', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) inputValue = '';
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
  }).directive("compareTo", compareTo);
   