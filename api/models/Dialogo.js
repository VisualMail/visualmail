/**
 * Dialogo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
//Corresponde al modelo para el nodo principal root de los dialogos, mantiene en un json cuales son los valores que le siguen
module.exports = {
schema:true,autoCreatedAt: true,autoUpdatedAt: true,
  attributes: {

  	children:{
  		type:'json'
  	},
  	project:{
  		model:'Project',
  	},
    name:{type:'string'},
    tipo:{type:'string'},
    numero_hijos:{type:'integer'},
    root:{type:'boolean'},
    parent:{type:'string'},
    session:{type:'integer'},
    usuario:{
      type:'json'
    },
    idmensaje:{type:'string'},
    numero_hijos:{type:'integer'},
    session_actual:{type:'integer'},
    ultimo_session_email:{type:'string'},
    parent_ultimo_respondido:{type:'string'}

  }
};

