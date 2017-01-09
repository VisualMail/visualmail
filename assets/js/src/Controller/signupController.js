angular
    .module('app.signupctrl', [
        'ngMessages',
		'gp.rutValidator',
		'selectize'])
    .controller('signupctrl', [
        '$scope', 
        function($scope) {  
            $scope.color = "FFFFFF";
   	    }
    ]);