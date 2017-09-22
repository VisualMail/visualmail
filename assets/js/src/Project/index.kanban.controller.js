(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("IndexKanbanController", IndexKanbanController); 
    
        IndexKanbanController.$inject = ["$http", "$scope"]; 

    function IndexKanbanController($http, $scope) { 
        var vm = this; 
        var parent = $scope.$parent; 
        
        
        init(); 

        function init() { 
           
            
        }; 
    }; 

})(); 