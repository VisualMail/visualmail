/* El código está basado en los ejemplos proporcionados por Jason Diamond 
*
* Web de contacto: http://jason.diamond.name/weblog
* Usuario de GitHub: jason@diamond.name
* Página de GitHub: https://github.com/jdiamond/html5-examples
*/

// Variable auxiliar para almacenar la tarea que se modifica 
var hideMe = null; 

// Variable auxiliar para verificar lo último que ingresó 
var lastEntered = null; 
/**
* @method :: kanbanBoardInit 
* @description :: Inicia la funcionalidad del tablero Kanban 
**/
function kanbanBoardInit() { 
    if (navigator.userAgent.search("MSIE") >= 0) {
        kanbanBoardInitWebKit(); 
    } else if (navigator.userAgent.search("Chrome") >= 0) {
        kanbanBoardInitWebKit(); 
    } else if (navigator.userAgent.search("Firefox") >= 0) {
        kanbanBoardInitGecko(); 
    } else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
        kanbanBoardInitWebKit(); 
    } else if (navigator.userAgent.search("Opera") >= 0) {
        //code goes here
    }
} 

function onKanbanBoardDragstart(e, type) { 
    // Almacenar el elemento HTML que contiene a la tarea 
    if($(e.target).is("img"))
        hideMe = $(e.target).closest(".kanbanBoardTask")[0]; 
    else 
        hideMe = e.target; 

    if($(hideMe).attr("data-border")) { 
        $("[data-border='ok']").attr("style", "border-color: #FFEB3B;"); 
        $(hideMe).attr("style", "border-color: #28a745; border-width: 5px;"); 
        //$(hideMe).attr("style", "border: 5px solid #28a745;"); 
        var scope = angular.element(document.getElementById("kanbanBoard")).scope(); 
        scope.ik.kanbanTareaIdFocus = $(hideMe).attr("id"); 
    } 

    if(type === "Gecko") { 
        // Almacenar el "id" del elemento HTML que contiene a la tarea para enviarlo a través de los eventos 
        e.originalEvent.dataTransfer.setData("kanbanBoardTask", e.target.id); 
        
        // Almacenar el "id" de la celda que contiene al elemento HTML de la tarea para enviarlo a través de los eventos 
        e.originalEvent.dataTransfer.setData("kanbanBoardCell", e.target.parentNode.id); 
        
        // Agregar el efecto de mover la tarea 
        e.originalEvent.dataTransfer.effectAllowed = "move"; 
    }
} 

function onKanbanBoardDragEnter(e) { 
    // Seleccionar la posible celda que contendrá a la tarea 
    var sectionTask = $(e.target).closest(".kanbanBoardCell")[0]; 
    lastEntered = sectionTask; 

    // Si existe la celda 
    if(sectionTask) { 
        // Si no es la misma celda del drag & drop 
        // cambiar el estilo de la celda y gestionar los eventos manualmente 
        if($(hideMe).parent().attr("id") !== $(sectionTask).attr("id"))
            $(sectionTask).addClass("droppable"); 
            //sectionTask.classList.add("droppable"); 
        
        e.preventDefault(); 
        return false; 
    } 

    // Seleccionar la posible columna que contendrá a la tarea 
    lastEntered = $(e.target).closest(".kanbanBoardColumn")[0]; 

    if(lastEntered)
        $(lastEntered).addClass("droppable"); 
        //lastEntered.classList.add("droppable"); 
    
    e.preventDefault(); 
    return false; 
} 

    // Al finalizar el "drag"
function onKanbanBoardDragend(e) { 
    // Eliminar la variable auxiliar 
    if(hideMe) 
        hideMe = null;  
} 

function onKanbanBoardDragover(e) { 
    // Si el destino fue una celda o una columna, manejar los eventos por código 
    if($(e.target).closest(".kanbanBoardCell")[0]) 
        e.preventDefault(); 
    else if ($(e.target).closest(".kanbanBoardColumn")[0]) 
        e.preventDefault(); 
} 

function onKanbanBoardDragleave(e) { 
    // Se inicia este evento en los nodos texto, verificar el elemento 
    if (e.target.nodeType === 1 && lastEntered) { 
        // El "dragleave" para los elementos externos pueden gatillar el "dragenter" para los elementos internos 
        // se debe tomar en cuenta que en realidad se hizo el "dragleave" revisando que es lo que ingresó 
        // el "relatedTarget" no se lo ubica en WebKit: https://bugs.webkit.org/show_bug.cgi?id=66547 
        var sectionTask = $(e.target).closest(".kanbanBoardCell")[0]; 

        if(sectionTask) { 
            var lastEnteredId = ""; 
            var le = $(lastEntered); 

            if(!le.hasClass("kanbanBoardCell")) { 
                le = $($(lastEntered).closest(".kanbanBoardCell")[0]); 
            }

            lastEnteredId = le.attr("id"); 

            if(lastEnteredId !== $(sectionTask).attr("id")) 
                $(sectionTask).removeClass("droppable"); 

        } else {
            var sectionColumn = $(e.target).closest(".kanbanBoardColumn")[0]; 

            if(sectionColumn) { 
                $(sectionColumn).removeClass("droppable"); 
            } 
        }

        return false; 
    } 

    // Eliminar el estilo en caso de que no sea una columna o celda 
    $(".kanbanBoardColumn").removeClass("droppable");
    $(".kanbanBoardCell").removeClass("droppable");
}

function onKanbanBoardDrop(e, type) { 
    // Obtener los destinos (celda o columna) 
    var sectionTask = closestWithClass(e.target, 'kanbanBoardCell'); 
    var sectionColumn = closestWithClass(e.target, 'kanbanBoardColumn'); 

    // Obtener el elemento HTML que contiene a la tarea y la celda origen de este elemento     
    var task; 
    var oldCell; 

    if(type === "WebKit") { 
        task = $("#" + hideMe.id); 
        oldCell = $("#" + hideMe.parentNode.id); 
    } else if(type === "Gecko") { 
        task = $("#" + e.originalEvent.dataTransfer.getData("kanbanBoardTask")); 
        oldCell = $("#" + e.originalEvent.dataTransfer.getData("kanbanBoardCell")); 
    }

    var tareaId = task.attr("id"); 

    // Obtener el "scope" desde angular 
    var scope = angular.element(document.getElementById("kanbanBoard")).scope(); 
    var column = parseInt(oldCell.parent().attr("data-column-index")); 
    scope.ik.kanbanTareaIdFocus = tareaId; 

    // Verificar si el destino es una celda o una nueva columna 
    if(sectionTask) { 
        // Si es una celda, verificar que no sea la misma celda 
        if($(sectionTask).attr("id") !== task.parent().attr("id")) { 
            var parentColumn = $(sectionTask).parent(); 
            var newColumn = parseInt(parentColumn.attr("data-column-index")); 
            var newIndex = parseInt($(sectionTask).attr("data-cell-index")); 
            scope.ik.onActualizarTareaIndice(tareaId, newColumn, false, newIndex); 
            $("#" + tareaId).attr("style", "opacity: 0.2"); 
        } 
    } else { 
        // Si es una columna, verificar que no sea la misma columna 
        if($(sectionColumn).attr("id") !== oldCell.parent().attr("id")) { 
            var newColumn = parseInt($(sectionColumn).attr("data-column-index")); 
            var newIndex = 1; 
            scope.ik.onActualizarTareaIndice(tareaId, newColumn, true, newIndex); 
            $("#" + tareaId).attr("style", "opacity: 0.2"); 
        } 
    }

    // Remover la clase modificada de celda o columna destino 
    if(sectionTask) 
        sectionTask.classList.remove("droppable"); 
    
    sectionColumn.classList.remove("droppable"); 
    e.preventDefault(); 
} 

/** 
* @method :: closestWithClass 
* @description :: Obtiene el elemento HTML que posee una clase específica  
* @param :: {Object} target, elemento HTML que se va a analizar 
* @param :: {string} className, nombre de la clase 
**/ 
function closestWithClass(target, className) { 
    while (target) { 
        if (target.nodeType === 1 && target.classList.contains(className)) 
            return target; 
        target = target.parentNode; 
    } 
    
    return null; 
}   

/** 
* @method :: kanbanBoardInitGecko 
* @description :: Inicia los controles para Firefox, Opera 
**/ 
function kanbanBoardInitGecko() { 
    // Obtener el Kanban 
    var kanbanBoard = $("#kanbanBoard"); 

    // Manejar los eventos del Kanban a través del código 
    kanbanBoard.on("selectstart", function(e) { 
        e.preventDefault(); 
    }); 
    
    // Variable auxiliar para almacenar la tarea que se modifica 
    

    // Inicia el "drag" de la tarea 
    kanbanBoard.on("dragstart", function(e) { 
        onKanbanBoardDragstart(e, "Gecko"); 
    }); 
    
    // Al finalizar el "drag"
    kanbanBoard.on("dragend", function(e) { 
        onKanbanBoardDragend(e); 
    }); 
    
    // Al entrar en el elemento HTML que contiene a la tarea al "drag" 
    kanbanBoard.on("dragenter", function(e) { 
        onKanbanBoardDragEnter(e); 
    }); 
    
    // Al finalizar completamente el "drag" 
    kanbanBoard.on("dragover", function(e) { 
        onKanbanBoardDragover(e); 
    }); 
    
    // Al momento que el evento del "drag" se va 
    kanbanBoard.on("dragleave", function(e) { 
        onKanbanBoardDragleave(e);
    });
    
    // Al soltar el elemento HTML que contiene la tarea en el destino  
    kanbanBoard.on("drop", function(e) { 
        onKanbanBoardDrop(e, "Gecko"); 
    }); 
}

/** 
* @method :: kanbanBoardInitWebKit 
* @description :: Inicia los controles para Chrome, Safari, Edge 
**/ 
function kanbanBoardInitWebKit() { 
    // Obtener el Kanban 
    var kanbanBoard = $("#kanbanBoard"); 

    // Manejar los eventos del Kanban a través del código 
    kanbanBoard.on("selectstart", function(e) { 
        e.preventDefault(); 
    }); 
    
    // Inicia el "drag" de la tarea 
    kanbanBoard.on("dragstart", function(e) { 
        onKanbanBoardDragstart(e, "WebKit"); 
    }); 
    
    // Al finalizar el "drag"
    kanbanBoard.on("dragend", function(e) { 
        onKanbanBoardDragend(e); 
    }); 
    
    // Al entrar en el elemento HTML que contiene a la tarea al "drag" 
    kanbanBoard.on("dragenter", function(e) { 
        onKanbanBoardDragEnter(e); 
    }); 
    
    // Al finalizar completamente el "drag" 
    kanbanBoard.on("dragover", function(e) { 
        onKanbanBoardDragover(e); 
    }); 
    
    // Al momento que el evento del "drag" se va 
    kanbanBoard.on("dragleave", function(e) { 
        onKanbanBoardDragleave(e);
    });
    
    // Al soltar el elemento HTML que contiene la tarea en el destino  
    kanbanBoard.on("drop", function(e) { 
        onKanbanBoardDrop(e, "WebKit"); 
    }); 
}