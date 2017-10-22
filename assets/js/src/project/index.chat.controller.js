(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp")
        .controller("IndexChatController", IndexChatController); 

    IndexChatController.$inject = ["$http", "$scope", "$sce"]; 

    function IndexChatController($http, $scope, $sce) { 
        var vm = this; 
        var parent = $scope.$parent; 
        vm.miMensajeLista = []; 
        vm.miUser = { }; 

        vm.onBtnVerMensajeClick = onBtnVerMensajeClick; 
        vm.setMessage = parent.vm.setMessage; 
        vm.setMessageToast = parent.vm.setMessageToast; 

        init(); 

        function init() { 
            vm.trustAsHtml = $sce.trustAsHtml; 
            parent.vm.scopeChat = $scope; 
        }; 

        function onBtnVerMensajeClick(nodoId) { 
            parent.vm.onActiveTabChanged(2, nodoId); 
        }; 
    }; 
})(); 