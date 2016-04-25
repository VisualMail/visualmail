/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
schema:true,
attributes: {
	id:{ type: 'integer', required: true, unique:true, autoIncrement: true},
	firstname:{ type: 'string', required:true },
	lastname:{ type: 'string', required:true},
	email:{ type: 'string', email:true, required:true, unique:true},
	pmo:{ type: 'boolean',required:true},
	initials:{ type: 'string',required:true},
	password:{ type: 'string',required:true},
	imgurl:{ type:'string'}
}

};

