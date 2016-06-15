/**
 * Kanban.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  schema:true,autoCreatedAt: true,autoUpdatedAt: true,
  attributes: {
  	project:{
  		model:'project',
  		unique: true
  	},
  	project_id:{
  		type:'string'
  	},
  	tareas:{
  		collection:'tarea',
  		via:'kanban'
  	}

  }
};

