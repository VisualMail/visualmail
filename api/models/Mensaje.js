/**
 * Mensaje.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  schema:true,autoCreatedAt: true,autoUpdatedAt: true,
  attributes: {
  	name:{type:'string'},
  	tipo:{type:'string'},
  	position:{type:'array'},
    project_id:{type:'string'},
    numero_hijos:{type:'integer'},
    root:{type:'boolean'},
  	dialogos:{
  		model: 'Dialogo'
  	},
  	children:{
  		collection:'Mensaje'
  	},
  	usuario:{
  		model:'User'
  	},
    datosusuario:{type:'json'}//guarda el id, nombre, iniciales y nombre

  }
};

