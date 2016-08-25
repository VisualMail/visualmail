/**
 * Kanban.js
 *
 * @description :: TODO: Representa los tableros Kanban 
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  schema:true,autoCreatedAt: true,autoUpdatedAt: true,
  attributes: {
  	project:{ //recibe la pk de proyectos
  		model:'project'
  	},
  	project_id:{ //guarda el id del proyecto (para no hacer populate)
  		type:'string'
  	},
  	tareas:{ // se hace la conexión para hacer populate de tareas
  		collection:'tarea',
  		via:'kanban'
  	},
    name:{type:'string'}, //contiene un nombre (por defecto no utilizado este atributo)

  }
};

