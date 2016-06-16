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
  	name:{type:'string'},
  	tipotarea:{type:'string'},//doing.done,testing,new
  	kanban:{
  		model:'kanban'
  	},
    drag:{type:'boolean'},
  }
};

