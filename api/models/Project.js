/**
 * Project.js
 *
 * @description :: TODO: Representa los valores de un proyecto
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 **/
module.exports = { 
	schema: true, 
	autoCreatedAt: true, 
	autoUpdatedAt: true, 
	attributes: { 

		// Nombre del proyecto 
		name: { 
			type: "string", 
			required: true 
		}, 

		// Encargado del proyecto 
		owner_email: { 
			type: "string", 
			required: true 
		}, 

		// Fecha de término 
		finish_date: { 
			type: "string" 
		}, 

		// Indica quién es el pmo del proyecto (no implementado) 
		pmo_email: { 
			type: "string" 
		}, 

		// Relación mucho a muchos con los participantes 
		participants: { 
			dominant: false, 
			collection: "user", 
			via: "projects" 
		}, 

		// Relación uno a muchos con el diálogo 
		dialogos: { 
			collection: "dialogo", 
			via: "project" 
		}, 

		// Guarda los roles en un json (no implementado) 
		roles: { 
			type: "json" 
		}, 

		// 'pk' del tablero kanban asociado 
		kanban: { 
			collection: "kanban", 
			via: "project" 
		} 
	}, 
}; 