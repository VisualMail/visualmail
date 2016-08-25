/**
 * Tarea.js
 *
 * @description :: TODO: Representa las tareas de un tablero Kanban
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
schema:true,autoCreatedAt: true,autoUpdatedAt: true,
  attributes: {
  	usuario:{//relación con el usuario que realizó la tarea
  		model:'User'
  	},
    project_id:{type:'string'}, //id del proyecto
    associated:{type:'boolean'}, //valor para api
    element:{type:'string'}, //valor para api
  	title:{type:'string'}, //titulo de la tarea
  	tipo:{type:'string'},//estado de la tarea de acuerdo al Kanban: doing.done,testing,new
  	kanban:{//relación con el tablero kanban
  		model:'kanban'
  	},
    mensaje:{ //relación con el mensaje
      model:'mensaje'
    },
    drag:{type:'boolean'}, //valor para api drag and drop (true) por defecto

  }
};

