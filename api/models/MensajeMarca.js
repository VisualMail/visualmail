/**
 * MensajeMarca.js
 *
 * @description :: TODO: Representa una marca del mensaje realizado por un usuario
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 **/
 module.exports = {
    schema: true,
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: { 

        // Identificador numérico 
        marcaId: { 
            type: "integer"
        }, 

        // Marca del texto del mensaje 
        marca: { 
            type: "string" 
        }, 

        // Representa el tipo del mensaje: duda, compromiso, acuerdo, etc 
        tipo: { 
            type: "string" 
        }, 

        // 'pk' del mensaje 
        mensajeId: {
            type: "string" 
        },

        // nodo del mensaje 
        nodoId: { 
            type: "integer" 
        }, 

        // 'pk' del usuario que realizó el mensaje
        usuario: {
            model: 'User'
        }, 
    }, 

    // Asignar el identificador numérico 
	beforeCreate: function(val, next) { 
        MensajeMarca
            .count({ mensajeId: val.mensajeId })
            .then(function(res) { 
             
            val.marcaId = res + 1; 
            next(); 
        }).catch(function(err) { 
            next(err); 
        }); 
	},
}; 