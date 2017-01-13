/**
 * Mensaje.js
 *
 * @description :: TODO: Representa un mensaje realizado por un usuario
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 **/
 module.exports = {
    schema: true,
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: { 

        // Texto del mensaje 
        name: { 
            type: "string" 
        }, 

        // Representa el tipo del mensaje: duda, compromiso, acuerdo, etc 
        tipo: { 
            type: "string" 
        }, 

        // Guardar en un arreglo la posición que le corresponde al mensaje de acuerdo al diálogo ('dialog')
        position: { 
            type: "array"
        }, 

        // 'id' del proyecto al cual está inmerso
        project_id: {
            type: "string"
        },

        // Número de hijos del mensaje
        numero_hijos: {
            type: "integer"
        },

        // Valor booleano si es raíz de los mensajes (todos false menos el primero)
        root: {
            type: "boolean"
        },
    
        // 'id' del mensaje padre
        parent: { 
            type: "string"
        },

        // 'pk' del mensaje al que esta asociado
        children: { 
            collection: 'Mensaje'
        },

        // 'pk' del usuario que realizó el mensaje
        usuario: {
            model: 'User'
        },

        // 'pk' de la tarea asociada al mensaje
        tareas: {
            collection: 'tarea',
            via: 'mensaje'
        },


        // Datos adicionales para dibujar el diálogo
        nodoId: {
            type: "integer"
        }, 
        nodoPadreId: {
            type: "integer"
        },
        sessionId: {
            type: "integer"
        },
        nodoNivel: {
            type: "integer"
        },
        nodoPadreNivel: {
            type: "integer"
        },
        nodoPadreSessionId: {
            type: "integer"
        }
    },

    beforeCreate: function(obj, next) {
        Mensaje.count({ project_id: obj.project_id }).exec(function(err, cnt) {
            if(err) 
                return next(err);
            else {
                obj.nodoId = cnt + 1;

                Mensaje.find({ 
                    "project_id": obj.project_id, 
                    "nodoId" : { ">=" : obj.nodoPadreId, "<=" : obj.nodoId }, 
                    "nodoNivel": obj.nodoNivel }).exec(function(err, resultado) { 

                    if(err)  
                        return next(err); 

                    if(resultado.length > 2) 
                        obj.nodoNivel += 1; 
                }); 

                next(null);
            }
        });
    }
};

