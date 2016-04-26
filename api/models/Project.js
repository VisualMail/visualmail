/**
 * Project.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

schema:true,autoCreatedAt: false,autoUpdatedAt: false,
attributes: {
	name:{ type: 'string', required:false },
	owner_email:{ type: 'string', required:false},
	participants:{
		collection: 'user',
		via: 'projects'
	}
},
};

