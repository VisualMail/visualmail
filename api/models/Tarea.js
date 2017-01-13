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

        // Relación con el usuario que realizó la tarea 
        usuario: { 
            model: "User" 
        }, 

        // 'id' del proyecto 
        project_id: { 
            type: "string" 
        }, 

        // Valor para api 
        associated: { 
            type: "boolean" 
        }, 

        // Valor para api 
        element: { 
            type: "string" 
        }, 

        // Título de la tarea 
        title: { 
            type: "string" 
        }, 

        // Estado de la tarea de acuerdo al Kanban: doing, done, testing, new 
        tipo: { 
            type: "string" 
        }, 

        // Relación con el tablero kanban 
        kanban: { 
            model: "kanban" 
        }, 

        // Relación con el mensaje 
        mensaje: { 
            model: "mensaje" 
        }, 

        // Valor para api drag and drop (true) por defecto 
        drag: { 
            type: "boolean" 
        }, 
    } 
}; 