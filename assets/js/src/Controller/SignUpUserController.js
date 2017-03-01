angular
    .module("app.SignUpUserController", [
        "ngMessages",
		"selectize"
    ])
    .controller("SignUpUserController", [
        "$scope", 
        function($scope) {  
            $scope.color = "4D87C6";
   	    }
    ]);
