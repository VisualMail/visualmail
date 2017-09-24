/* El código está basado en los ejemplos proporcionados por Jason Diamond 
*
* Web de contacto: http://jason.diamond.name/weblog
* Usuario de GitHub: jason@diamond.name
* Página de GitHub: https://github.com/jdiamond/html5-examples
*/

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
    var hideMe; 

    // Inicia el "drag" de la tarea 
    kanbanBoard.on("dragstart", function(e) { 
        // Almacenar el elemento HTML que contiene a la tarea 
        hideMe = e.target; 
        
        // Almacenar el "id" del elemento HTML que contiene a la tarea para enviarlo a través de los eventos 
        e.originalEvent.dataTransfer.setData("kanbanBoardTask", e.target.id); 
        
        // Almacenar el "id" de la celda que contiene al elemento HTML de la tarea para enviarlo a través de los eventos 
        e.originalEvent.dataTransfer.setData("kanbanBoardCell", e.target.parentNode.id); 
        
        // Agregar el efecto de mover la tarea 
        e.originalEvent.dataTransfer.effectAllowed = "move"; 
    }); 
    
    // Al finalizar el "drag"
    kanbanBoard.on("dragend", function(e) { 
        // Eliminar la variable auxiliar 
        if(hideMe)
            hideMe = null;  
    }); 
    
    // Variable auxiliar para verificar lo último que ingresó 
    var lastEntered; 
    
    // Al entrar en el elemento HTML que contiene a la tarea al "drag" 
    kanbanBoard.on("dragenter", function(e) { 
        // Si la variable auxiliar está inicializada con el elemento HTML original que contiene a la tarea 
        if (hideMe) { 
            // Ocultar el elemento HTML original que contiene a la tarea 
            hideMe.style.visibility = "hidden"; 
        } 
    
        // Almacenar el elemento HTML de la tarea 
        lastEntered = e.target; 
    
        // Seleccionar la posible celda que contendrá a la tarea 
        var sectionTask = closestWithClass(e.target, "kanbanBoardCell"); 
    
        // Seleccionar la posible columna que contendrá a la tarea 
        var sectionColumn = closestWithClass(e.target, "kanbanBoardColumn"); 
    
        // Si existe la celda 
        if(sectionTask) { 
            // Cambiar el estilo de la celda y gestionar los eventos manualmente 
            sectionTask.classList.add("droppable"); 
            e.preventDefault(); 
            return false; 
        } else if(sectionColumn) { 
            // Cambiar el estilo de la columna y gestionar los eventos manualmente 
            sectionColumn.classList.add("droppable"); 
            e.preventDefault(); 
            return false; 
        } 
    }); 
    
    // Al finalizar completamente el "drag" 
    kanbanBoard.on("dragover", function(e) { 
        // Si el destino fue una celda o una columna, manejar los eventos por código 
        if(closestWithClass(e.target, "kanbanBoardCell")) 
            e.preventDefault(); 
        else if (closestWithClass(e.target, "kanbanBoardColumn")) 
            e.preventDefault(); 
    }); 
    
    // Al momento que el evento del "drag" se va 
    kanbanBoard.on("dragleave", function(e) { 
        // Se inicia este evento en los nodos texto, verificar el elemento 
        if (e.target.nodeType === 1) { 
            // El "dragleave" para los elementos externos pueden gatillar el "dragenter" para los elementos internos 
            // se debe tomar en cuenta que en realidad se hizo el "dragleave" revisando que es lo que ingresó 
            // el "relatedTarget" no se lo ubica en WebKit: https://bugs.webkit.org/show_bug.cgi?id=66547 
            var sectionTask = closestWithClass(e.target, "kanbanBoardCell"); 
            var sectionColumn = closestWithClass(e.target, "kanbanBoardColumn"); 
    
            if(sectionTask) 
                sectionTask.classList.remove("droppable"); 
        
            if(sectionColumn) 
                sectionColumn.classList.remove("droppable"); 

            /*if (sectionTask && !sectionTask.contains(lastEntered)) 
                sectionTask.classList.remove("droppable"); 
            else if (sectionColumn && !sectionColumn.contains(lastEntered))  
                sectionColumn.classList.remove("droppable"); */

            hideMe.style.visibility = "visible"; 
        } 
    
        // Eliminar el valor (último que ingresó) de la variable auxiliar 
        lastEntered = null; 
    });
    
    // Al soltar el elemento HTML que contiene la tarea en el destino  
    kanbanBoard.on("drop", function(e) { 
        // Obtener los destinos (celda o columna) 
        var sectionTask = closestWithClass(e.target, 'kanbanBoardCell'); 
        var sectionColumn = closestWithClass(e.target, 'kanbanBoardColumn'); 
    
        // Obtener el elemento HTML que contiene a la tarea y la celda origen de este elemento 
        var task = $("#" + e.originalEvent.dataTransfer.getData("kanbanBoardTask")); 
        var oldCell = $("#" + e.originalEvent.dataTransfer.getData("kanbanBoardCell")); 
        var tareaId = task.attr("id"); 
    
        // Obtener el "scope" desde angular 
        var scope = angular.element(document.getElementById("kanbanBoard")).scope(); 
        var column = parseInt(oldCell.parent().attr("data-column-index")); 
    
        // Verificar si el destino es una celda o una nueva columna 
        if(sectionTask) { 
            // Si es una celda, verificar que no sea la misma celda 
            if($(sectionTask).attr("id") !== task.parent().attr("id")) { 
                var parentColumn = $(sectionTask).parent(); 
                var newColumn = parseInt(parentColumn.attr("data-column-index")); 
                var newIndex = parseInt($(sectionTask).attr("data-cell-index")); 
                scope.ik.onActualizarTareaIndice(tareaId, newColumn, false, newIndex); 
                $("#" + tareaId).attr("style", "opacity: 0.2"); 
            } else 
                hideMe.style.visibility = "visible"; 
        } else { 
            // Si es una columna, verificar que no sea la misma columna 
            if($(sectionColumn).attr("id") !== oldCell.parent().attr("id")) { 
                var newColumn = parseInt($(sectionColumn).attr("data-column-index")); 
                var newIndex = 1; 
                scope.ik.onActualizarTareaIndice(tareaId, newColumn, true, newIndex); 
                $("#" + tareaId).attr("style", "opacity: 0.2"); 
            } else 
                hideMe.style.visibility = "visible"; 
        }
    
        // Remover la clase modificada de celda o columna destino 
        if(sectionTask) 
            sectionTask.classList.remove("droppable"); 
    
        sectionColumn.classList.remove("droppable"); 
        e.preventDefault(); 
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
    
    // Variable auxiliar para almacenar la tarea que se modifica 
    var hideMe; 
    
    // Inicia el "drag" de la tarea 
    kanbanBoard.on("dragstart", function(e) { 
        // Almacenar el elemento HTML que contiene a la tarea 
        hideMe = e.target; 
    }); 
    
    // Al finalizar el "drag"
    kanbanBoard.on("dragend", function(e) { 
        // Eliminar la variable auxiliar 
        if(hideMe)
            hideMe = null;  
    }); 
    
    // Variable auxiliar para verificar lo último que ingresó 
    var lastEntered; 
    
    // Al entrar en el elemento HTML que contiene a la tarea al "drag" 
    kanbanBoard.on("dragenter", function(e) { 
        // Si la variable auxiliar está inicializada con el elemento HTML original que contiene a la tarea 
        if (hideMe) { 
            // Ocultar el elemento HTML original que contiene a la tarea 
            hideMe.style.visibility = "hidden"; 
    
            // Borrar la variable auxiliar 
            //hideMe = null;  
        } 
    
        // Almacenar el elemento HTML de la tarea 
        lastEntered = e.target; 
    
        // Seleccionar la posible celda que contendrá a la tarea 
        var sectionTask = closestWithClass(e.target, "kanbanBoardCell"); 
    
        // Seleccionar la posible columna que contendrá a la tarea 
        var sectionColumn = closestWithClass(e.target, "kanbanBoardColumn"); 
    
        // Si existe la celda 
        if(sectionTask) { 
            // Cambiar el estilo de la celda y gestionar los eventos manualmente 
            sectionTask.classList.add("droppable"); 
            e.preventDefault(); 
            return false; 
        } else if(sectionColumn) { 
            // Cambiar el estilo de la columna y gestionar los eventos manualmente 
            sectionColumn.classList.add("droppable"); 
            e.preventDefault(); 
            return false; 
        } 
    }); 
    
    // Al finalizar completamente el "drag" 
    kanbanBoard.on("dragover", function(e) { 
        // Si el destino fue una celda o una columna, manejar los eventos por código 
        if(closestWithClass(e.target, "kanbanBoardCell")) 
            e.preventDefault(); 
        else if (closestWithClass(e.target, "kanbanBoardColumn")) 
            e.preventDefault(); 
    }); 
    
    // Al momento que el evento del "drag" se va 
    kanbanBoard.on("dragleave", function(e) { 
        // Se inicia este evento en los nodos texto, verificar el elemento 
        if (e.target.nodeType === 1) { 
            // El "dragleave" para los elementos externos pueden gatillar el "dragenter" para los elementos internos 
            // se debe tomar en cuenta que en realidad se hizo el "dragleave" revisando que es lo que ingresó 
            // el "relatedTarget" no se lo ubica en WebKit: https://bugs.webkit.org/show_bug.cgi?id=66547 
            var sectionTask = closestWithClass(e.target, "kanbanBoardCell"); 
            var sectionColumn = closestWithClass(e.target, "kanbanBoardColumn"); 
    
            if(sectionTask) 
                sectionTask.classList.remove("droppable"); 
        
            if(sectionColumn) 
                sectionColumn.classList.remove("droppable"); 

            /*if (sectionTask && !sectionTask.contains(lastEntered)) 
                sectionTask.classList.remove("droppable"); 
            else if (sectionColumn && !sectionColumn.contains(lastEntered))  
                sectionColumn.classList.remove("droppable"); */

            hideMe.style.visibility = "visible"; 
        } 
    
        // Eliminar el valor (último que ingresó) de la variable auxiliar 
        lastEntered = null; 
    });
    
    // Al soltar el elemento HTML que contiene la tarea en el destino  
    kanbanBoard.on("drop", function(e) { 
        // Obtener los destinos (celda o columna) 
        var sectionTask = closestWithClass(e.target, 'kanbanBoardCell'); 
        var sectionColumn = closestWithClass(e.target, 'kanbanBoardColumn'); 
    
        // Obtener el elemento HTML que contiene a la tarea y la celda origen de este elemento 
        //var task = $("#" + e.originalEvent.dataTransfer.getData("kanbanBoardTask")); 
        //var oldCell = $("#" + e.originalEvent.dataTransfer.getData("kanbanBoardCell")); 
    
        var task = $("#" + hideMe.id); 
        var oldCell = $("#" + hideMe.parentNode.id); 
        var tareaId = task.attr("id"); 
    
        // Obtener el "scope" desde angular 
        var scope = angular.element(document.getElementById("kanbanBoard")).scope(); 
        var column = parseInt(oldCell.parent().attr("data-column-index")); 
    
        // Verificar si el destino es una celda o una nueva columna 
        if(sectionTask) { 
            // Si es una celda, verificar que no sea la misma celda 
            if($(sectionTask).attr("id") !== task.parent().attr("id")) { 
                var parentColumn = $(sectionTask).parent(); 
                var newColumn = parseInt(parentColumn.attr("data-column-index")); 
                var newIndex = parseInt($(sectionTask).attr("data-cell-index")); 
                scope.ik.onActualizarTareaIndice(tareaId, newColumn, false, newIndex); 
                $("#" + tareaId).attr("style", "opacity: 0.2"); 
            } else 
                hideMe.style.visibility = "visible"; 
        } else { 
            // Si es una columna, verificar que no sea la misma columna 
            if($(sectionColumn).attr("id") !== oldCell.parent().attr("id")) { 
                var newColumn = parseInt($(sectionColumn).attr("data-column-index")); 
                var newIndex = 1; 
                scope.ik.onActualizarTareaIndice(tareaId, newColumn, true, newIndex); 
                $("#" + tareaId).attr("style", "opacity: 0.2"); 
            } else 
                hideMe.style.visibility = "visible"; 
        }
    
        // Remover la clase modificada de celda o columna destino 
        if(sectionTask) 
            sectionTask.classList.remove("droppable"); 
    
        sectionColumn.classList.remove("droppable"); 
        e.preventDefault(); 
    });
}