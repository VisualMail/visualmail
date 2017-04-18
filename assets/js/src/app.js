(function() { 
    "use strict"; 

    angular
        .module("VisualMailApp", [
            "ngMessages", 
            "ui.materialize"
        ])
        .directive("capitalize", function() { 
        return { 
            require: "ngModel", 
            link: function(scope, element, attrs, modelCtrl) { 
                var capitalize = function(inputValue) { 

                    if (inputValue === undefined) 
                        inputValue = ""; 

                    var capitalized = inputValue.toUpperCase(); 

                    if (capitalized !== inputValue) { 
                        modelCtrl.$setViewValue(capitalized); 
                        modelCtrl.$render(); 
                    } 

                    return capitalized; 
                } 

                modelCtrl.$parsers.push(capitalize); 

                // capitalize initial value
                capitalize(scope[attrs.ngModel]); 
            } 
        }; 
    })
    .directive("compareTo", compareTo); 
})(); 