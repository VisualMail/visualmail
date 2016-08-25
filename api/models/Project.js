/**
 * Project.js
 *
 * @description :: TODO: Representa los valores de un proyecto
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

schema:true,autoCreatedAt: true,autoUpdatedAt: true,
attributes: {
	name:{ type: 'string', required:true }, //nombre del proyecto
	owner_email:{ type: 'string', required:true},//encargado del proyecto
	finish_date:{type: 'date'}, //fecha de termino
	pmo_email:{type:'string'},//indica quien es el pmo del proyecto (no implementado)
	participants:{ //relación mucho a muchos con los participantes
		dominant: false,
		collection: 'user',
		via: 'projects'
	},
	dialogos:{ //relación uno a muchos con el dialogo
		collection:'dialogo',
		via:'project'
	},
	roles:{//guarda los roles en un json (no implementado)
		type:'json'
	},
	kanban:{//pk del tablero kanban asociado
		collection:'kanban',
		via:'project'
	}

},
};

