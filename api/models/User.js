/**
* User.js
*
* @description :: TODO: Representa un usuario de la aplicación
* @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
**/
module.exports = {
	schema: true,
	autoCreatedAt: false,
	autoUpdatedAt: false,
	attributes: { 

		// Nombre
		firstname: { 
			type: "string", 
			required: true 
		}, 

		// Apellido
		lastname: { 
			type: "string", 
			required: true
		}, 

		// Email
		email: { 
			type: "email", 
			email: true, 
			required: true, 
			unique: true 
		}, 

		// Iniciales
		initials: { 
			type: "string",
			required: true
		}, 

		// Password
		password: { 
			type: "string",
			required: true
		}, 

		// URL de la imagen
		imgurl: { 
			type: "string"
		}, 

		// Color 
		color: {
			type: "string"
		},

		// Rol
		rol: { 
			type: "integer"
		}, 

		// Relación muchos a muchos con proyecto
		projects: { 
			dominant: true,
			collection: "project",
			via: "participants"
		},

		// Asociación con mensajes
		mensajes: { 
			collection: "mensaje",
			via: "usuario"
		},

		// Asociación con tareas
		tareas: {
			collection: "tarea",
			via: "usuario"
		}
	},

	// Callback llamado antes de crear el usuario, el password se encripta
	beforeCreate: function(values,next){
		
		// Utilizando bcryptjs recibe el password sin encriptar values.password y valor de configuracion
		require("bcryptjs").hash(values.password, 10, function passwordEncrypted(err, password) { 

			// Verificar si existe un error
			if(err) 
				return next(err); 
			
			values.password = password;

			// Continua Sails
			next(); 
		});
	},
};