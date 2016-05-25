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
	owner_email:{ type: 'string', required:true},
	created_date:{type:'date'},
	finish_date:{type: 'date'},
	pmo_email:{type:'string'},
	participants:{
		dominant: false,
		collection: 'user',
		via: 'projects'
	}
},
};

