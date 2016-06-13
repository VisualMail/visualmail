/**
 * Dialogo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
//Corresponde al modelo para el nodo principal root de los dialogos, mantiene en un json cuales son los valores que le siguen
module.exports = {
schema:true,
  attributes: {
  	name:{type:'string'},
  	text:{type:'string'},
  	position:{type:'array'},
  	children:{
  		type:'json'
  	},
  	project:{
  		model:'Project',
  	},
    mensajes:{
      collection: 'mensaje',
      via: 'dialogos'
    }
  }
};

