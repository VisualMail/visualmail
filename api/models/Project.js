/**
 * Project.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

schema:true,autoCreatedAt: true,autoUpdatedAt: true,
attributes: {
	name:{ type: 'string', required:true },
	owner_email:{ type: 'string', required:true},//encargado
	finish_date:{type: 'date'},
	pmo_email:{type:'string'},//indica quien es el pmo del proyecto
	participants:{
		dominant: false,
		collection: 'user',
		via: 'projects'
	},
	dialogos:{
		collection:'dialogo',
		via:'project'

	}
},
};

