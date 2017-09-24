(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("LogInController", LogInController); 

    LogInController.$inject = ["$http", "$scope"]; 

    function LogInController($http, $scope) { 
        init(); 

        function init() { 
            $("#logInMessage").fadeIn(100); 
        }; 
    }; 
})(); 