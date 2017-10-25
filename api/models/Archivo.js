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

        // Contiene el nombre del archivo 
        name: { 
            type: "string" 
        }, 

        // Contiene el nombre en el disco 
        nameOnDisk: { 
            type: "string" 
        }, 

        // Guarda el 'id' del proyecto (para no hacer populate) 
        project_id: { 
            type: "string" 
        }, 
    }
}; 