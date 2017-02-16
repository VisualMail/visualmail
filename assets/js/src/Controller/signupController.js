angular
    .module("app.SignUpController", [
        "ngMessages",
		"selectize"
    ])
    .controller("SignUpController", [
        "$scope", 
        function($scope) {  
            $scope.color = "4D87C6";
   	    }
    ]);
