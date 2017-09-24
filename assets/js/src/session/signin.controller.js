(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("SignUpController", SignUpController); 

    SignUpController.$inject = ["$http", "$scope"]; 

    function SignUpController($http, $scope) { 
        init(); 

        function init() { 
            
        }; 
    }; 
})(); 