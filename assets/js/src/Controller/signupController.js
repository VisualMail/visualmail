angular
    .module("app.SignUpController", [
        "ngMessages",
		"selectize"
    ])
    .controller("SignUpController", [
        "$scope", 
        function($scope) {  
            $scope.color = "FFFFFF";
   	    }
    ]);
