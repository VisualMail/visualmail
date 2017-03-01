angular
    .module("app", [
        "ngMessages", 
        "gp.rutValidator", 
        "selectize", 
        "app.LoginCtrl", 
        "app.RecoverPassCtrl", 
        "app.RecoverPageCtrl", 
        "ui.materialize", 
        "app.editUserCtrl", 
        "app.createProjectCtrl",
        "app.SignUpUserController", 
        "app.ProjectController" 
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