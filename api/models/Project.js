/**
 * Project.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

schema:true,
attributes: {
	id:{ type: 'integer', required: true, unique:true, autoIncrement: true},
	name:{ type: 'string', required:true },
	owner_id:{ type: 'integer', required:true},
	
},
};

