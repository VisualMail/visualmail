/**
 * Dialogo.js
 *
 * @description :: TODO: Maneja los dialogos en formato JSON según formato d3.js y de acuerdo a los valores guardados en mensajes
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
schema:true,autoCreatedAt: true,autoUpdatedAt: true,
  attributes: {

  	children:{ //guarda los mensajes hijos
  		type:'json'
  	},
  	project:{ //recibe pk de proyecto
  		model:'Project',
  	},
    name:{type:'string'}, //contiene el texto del mensaje inicial
    tipo:{type:'string'}, //contiene el tipo de mensaje del mensaje inicial (por defecto null)
    numero_hijos:{type:'integer'}, //contiene cuantos hijos tiene
    root:{type:'boolean'}, //contiene valor booleano si es root ( por defecto true)
    parent:{type:'string'}, //contiene el id del mensaje padre (por defecto null)
    session:{type:'integer'}, //contiene el valor de session del primer mensaje
    usuario:{ //contiene el json de quien realizo el primer mensaje
      type:'json'
    },
    idmensaje:{type:'string'}, //guarda el id del mensaje inicial
    
    session_actual:{type:'integer'}, //contiene el valor de sesion actual
    ultimo_session_email:{type:'string'}, //contiene quien realizo la ultima respuesta
    parent_ultimo_respondido:{type:'string'} //contiene el id del ultimo mensaje respondido

  }
};

