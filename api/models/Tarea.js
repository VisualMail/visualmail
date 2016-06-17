/**
 * Tarea.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
schema:true,autoCreatedAt: true,autoUpdatedAt: true,
  attributes: {
  	usuario:{
  		model:'User'
  	},
  	title:{type:'string'},
  	tipo:{type:'string'},//doing.done,testing,new
  	kanban:{
  		model:'kanban'
  	},
    drag:{type:'boolean'},
    datosusuario:{type:'json'}//guarda el id, nombre, iniciales y nombre
  }
};

