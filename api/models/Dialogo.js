/**
 * Dialogo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
schema:true,
  attributes: {
  	name:{type:'string'},
  	root:{type:'boolean',required:true},
  	id_projecto:{type:'string'},
  	position:{type:'array'},
  	child:{
  		collection:'dialogo',
  	}

  }
};

