/**
 * Mensaje.js
 *
 * @description :: TODO: Representa un mensaje realizado por un usuario
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  schema:true,autoCreatedAt: true,autoUpdatedAt: true,
  attributes: {
  	name:{type:'string'}, //texto del mensaje
  	tipo:{type:'string'}, //representa el tipo del mensaje: duda, compromiso, acuerdo, etc
  	position:{type:'array'}, //guarda en un arreglo la posicion que le corresponde al mensaje de acuerdo al dialogo (Dialog)
    project_id:{type:'string'},//id del proyecto al cual esta inmerso
    numero_hijos:{type:'integer'},//numero de hijos del mensaje
    root:{type:'boolean'},//valor booleano si es raiz de los mensajes (todos false menos el primero)
    parent:{type:'string'},//id del mensaje padre

  	children:{ //pk del mensaje al que esta asociado
  		collection:'Mensaje'
  	},
  	usuario:{//pk del usuario que realizó el mensaje
  		model:'User'
  	},
    tareas:{//pk de la tarea asociada al mensaje
      collection:'tarea',
      via:'mensaje'
    },

  }
};

