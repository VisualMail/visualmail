/**
 * User.js
 *
 * @description :: TODO: Representa un usuario de la aplicación
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
schema:true,autoCreatedAt: false,autoUpdatedAt: false,
attributes: {
	
	firstname:{ type: 'string', required:true }, //primer nombre
	lastname:{ type: 'string', required:true}, //ultimo nombre
	email:{ type: 'email', email:true, required:true, unique:true}, //email
	
	initials:{ type: 'string',required:true}, //iniciales
	password:{ type: 'string',required:true}, //password
	imgurl:{ type:'string'},//url de la imagen
	rut:{type:'string'}, //rut
	projects:{ //relacion muchos a muchos con proyecto
		dominant: true,
		collection: 'project',
		via:'participants'
	},
	mensajes:{ //asociacion con mensajes
		collection:'mensaje',
		via:'usuario'
	},
	tareas:{//asociacion con tareas
		collection:'tarea',
		via:'usuario'
	}
},
 //callback llamado antes de crear el usuario, el password se encripta
 beforeCreate: function(values,next){
  //utilizando bcryptjs recibe el password sin encriptar values.password y valor de configuracion
  require('bcryptjs').hash(values.password,10, function passwordEncrypted(err,password){ 
    if(err) return next(err); //Si hay error

    values.password = password;
    next(); //continua Sails
  });
 },
};

