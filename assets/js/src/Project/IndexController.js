(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp") 
        .controller("IndexController", IndexController); 
    
    IndexController.$inject = ["$http", "$scope"]; 

    function IndexController($http, $scope) { 
        var vm = this; 
        
    }; 
})(); 