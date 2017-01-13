/**
* Dialogo.js
*
* @description :: TODO: Maneja los dialogos en formato JSON según formato d3.js y de acuerdo a los valores guardados en mensajes
* @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
**/
module.exports = { 
    schema: true, 
    autoCreatedAt: true, 
    autoUpdatedAt: true, 
    attributes: { 

        // Guarda los mensajes hijos 
        children: { 
            type: "json" 
        }, 

        // Recibe el 'pk' de proyecto 
        project: { 
            model: "Project", 
        }, 

        // Contiene el texto del mensaje inicial 
        name: { 
            type: "string" 
        }, 

        // Contiene el tipo de mensaje del mensaje inicial (por defecto null) 
        tipo: { 
            type: "string" 
        }, 

        // Contiene cuantos hijos tiene 
        numero_hijos: { 
            type: "integer" 
        }, 

        // Contiene valor booleano si es root (por defecto true) 
        root: { 
            type: "boolean" 
        }, 

        // Contiene el id del mensaje padre (por defecto null) 
        parent: { 
            type: "string" 
        }, 

        // Contiene el valor de session del primer mensaje 
        session: { 
            type: "integer" 
        }, 

        // Contiene el json de quien realizo el primer mensaje 
        usuario: { 
            type: "json" 
        }, 

        // Guarda el id del mensaje inicial 
        idmensaje: { 
            type: "string" 
        }, 

        // Contiene el valor de sesion actual 
        session_actual: { 
            type: "integer" 
        }, 

        // Contiene quien realizo la ultima respuesta 
        ultimo_session_email: { 
            type: "string" 
        }, 

        // Contiene el id del ultimo mensaje respondido 
        parent_ultimo_respondido: { 
            type:"string" 
        } 
    } 
}; 