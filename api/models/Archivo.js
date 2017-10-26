/** 
 * Archivo.js 
 * 
 * @description :: TODO: Representa los Archivo(s) 
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models 
 */ 
module.exports = { 
    schema: true, 
    autoCreatedAt: true, 
    autoUpdatedAt: true, 
    attributes: { 

        // Contiene el nombre del archivo en disco 
        fileName: { 
            type: "string" 
        }, 

        // Contiene el tamaño del archivo 
        fileSize: { 
            type: "integer" 
        }, 

        // Contiene el tipo del archivo 
        fileType: { 
            type: "string "
        }, 

        // Contiene el nombre del archivo en la base 
        name: { 
            type: "string" 
        }, 

        // Contiene el estado del archivo 1 = activo, 2 = inactivo (eliminado) 
        estado: { 
            type: "integer" 
        }, 

        // Guarda el 'id' del proyecto (para no hacer populate) 
        project_id: { 
            type: "string" 
        }, 

        // Guarda el 'id' del usuario responsable del archivo 
        usuario: { 
            model: "User" 
        }
    }

}; 