/**
 * Kanban.js
 *
 * @description :: TODO: Representa los tableros Kanban 
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = { 
    schema: true, 
    autoCreatedAt: true, 
    autoUpdatedAt: true, 
    attributes: { 

        // Recibe la 'pk' de proyectos 
        project: { 
            model: "project" 
        }, 

        // Guarda el 'id' del proyecto (para no hacer populate) 
        project_id: { 
            type: "string" 
        }, 

        // Hacer la conexión para hacer populate de tareas 
        tareas: { 
            collection: "tarea", 
            via: "kanban" 
        }, 

        // Contiene un nombre (por defecto no utilizado este atributo) 
        name: { 
            type: "string" 
        }, 
    }
}; 