/**
 * Mensaje.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	text:{type:'string'},
  	tipo:{type:'string'},
  	position:{type:'array'},
  	dialogos:{
  		model: 'Dialogo'
  	},
  	siguiente:{
  		model:'Mensaje'
  	},
  	usuario:{
  		model:'User'
  	}
  }
};

