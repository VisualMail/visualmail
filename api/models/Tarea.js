/**
* Tarea.js
*
* @description :: TODO: Representa las tareas de un tablero Kanban
* @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
**/
module.exports = {
    schema: true, 
    autoCreatedAt: true, 
    autoUpdatedAt: true, 
    attributes: { 
        // Valor para api 
        associated: { 
            type: "boolean" 
        }, 

        // Descripción/Alcance de la tarea 
        description: { 
            type: "string" 
        }, 

        // Valor para api drag and drop (true) por defecto 
        drag: { 
            type: "boolean" 
        }, 

        // Valor para api 
        element: { 
            type: "string" 
        }, 

        // Estado de la tarea "por hacer, etc."
        estado: { 
            type: "string" 
        }, 

        // Índice de la tarea en la columna 
        index: {
            type: "integer"
        }, 

        // Relación con el tablero kanban 
        kanban: { 
            model: "kanban" 
        }, 

        // Relación con el mensaje 
        mensaje: { 
            model: "mensaje" 
        }, 

        // 'id' del proyecto 
        project_id: { 
            type: "string" 
        }, 
        
        // Representa el tipo del mensaje: duda, compromiso, acuerdo, etc 
        tipo: { 
            type: "string" 
        }, 

        // Identificador del tipo del mensaje: duda, compromiso, acuerdo, etc 
        tipoId: { 
            type: "string" 
        }, 

        // Texto con la marca a la que responde el mensaje 
        tipoName: { 
            type: "string", 
        }, 

        // Marca del texto a la que responde el mensaje 
        tipoNameMarca: { 
            type: "string", 
        }, 

        // Título de la tarea 
        title: { 
            type: "string" 
        }, 

        // Relación con el usuario que realizó la tarea 
        usuario: { 
            model: "User" 
        }, 
    }, 

    /**
    * @method :: beforeCreate 
    * @description :: Antes de crear la tarea, obtener el índice en la columna 
    * @param :: {Object} obj, contiene la información de la tarea  
    * @param :: {Objetct} next, para continuar en caso de error 
    **/
    beforeCreate: function(obj, next) { 
        // Buscar el total de tareas que contiene el proyecto en el tipo especificado 
        Tarea.count({ project_id: obj.project_id, tipo: obj.tipo }).exec(function(err, cnt) { 
            // Si existe un error, continuar 
            if(err) 
                return next(err); 
            else { 
                // Actualizar el índice de la nueva tarea 
                obj.index = cnt + 1; 
                next(null); 
            }
        });
    },
}; 