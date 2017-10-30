/**
* AdminController
*
* @description :: Lógica del servidor para manejar a los usuarios
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {
    /**
	* @method :: user (POST)
	* @description :: Administra la información de los usuarios (solo pueden acceder los administradores)
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	user: function(req, res, next) { 
		// Redirigir a la vista 'user/admin'
		return res.view({ 
			title: "Administrar usuarios", 
			layout: "shared/admin", 
			sectionHead: 
				"<link href='/js/dependencies/ng-table/2.0.2/css/ng-table.min.css'></script>", 
			sectionScripts: 
				"<script src='/js/dependencies/jscolor/2.0.4/js/jscolor.min.js' type='text/javascript'></script>" + 
				"<script src='/js/dependencies/ng-table/2.0.2/js/ng-table.min.js' type='text/javascript'></script>" + 
				"<script src='/js/src/admin/user.controller.js' type='text/javascript'></script>" 
		});
    }, 
    
    /** 
	* @method :: userGetDatos (POST) 
	* @description :: Busca los usuarios registrados en el sistema 
	* @param :: {Object} req, request element de sails 
	* @param :: {Objetct} res, de la vista ejs del servidor 
	*/
	userGetDatos: function(req, res) { 
		var count = req.param("count"); 
		var filter = req.param("filter"); 
		var page = req.param("page"); 
		var sorting = req.param("sorting"); 
		var sort = "firstname asc"; 

		if(Object.keys(sorting)[0]) { 
			var key = Object.keys(sorting)[0];  
			sort = key + " " + sorting[key]; 
		}

		var skip = count * (page - 1); 

		var query = { 
			limit: count, 
			skip: skip, 
			sort: sort, 
		}; 

		for(item in filter) { 
            if(filter[item] === "") 
                continue; 

			query[item] = { contains: filter[item] }; 
		}; 

		User.find(query).then(function(list) { 

			User.count(query).then(function(total) { 
				return res.json({ 
					proc: true, 
					msg: "", 
					list: list, 
					total: total
				}); 
			}).catch(function(err) { 
				sails.log(err); 
				return res.json({ 
					proc: false, 
					msg: "¡Ocurrió un error en el conteo de la búsqueda en la base de datos!"
				});
			}); 

		}).catch(function(err) { 
			sails.log(err); 
			return res.json({ 
				proc: false, 
				msg: "¡Ocurrió un error en la búsqueda en la base de datos!"
			});
		}); 
    }, 
    
	/**
	* @method :: userInsert (POST)
	* @description :: Guarda los datos de un usuario de forma asincrona y sin problemas de concurrencia 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	*/
	userInsert: function(req, res) { 
		// Guardar en variables temporales los vales de cambio
		var firstname = req.param("firstname"); 
		var lastname = req.param("lastname");
		var email = req.param("email");
		var imgurl = req.param("imgurl");
		var initials = req.param("initials");
		var color = req.param("color"); 
		var rol = req.param("rol"); 
		var password = req.param("password"); 

		// Verificar que no exista el correo electrónico del usuario 
		User.find({
			email: email 
		}).then(function(resultCheck) { 
			if(resultCheck.length > 0) { 
				return res.json({ 
					proc: false, 
					msg: "¡El correo electrónico está ocupado por otro usuario!" 
				}); 
			} 

			// Crear el usuario 
			User.create({ 
				firstname: firstname, 
				lastname: lastname, 
				email: email, 
				imgurl: imgurl, 
				initials: initials, 
				color: color, 
				password: password, 
				rol: rol 
			}).then(function(resultInsert) { 
				return res.json({ 
					proc: true, 
					msg: "¡Usuario registrado!" 
				}); 
			}).catch(function(err) { 
				return res.json({ 
					proc: false, 
					msg: "¡Se produjo un error en la Base de Datos al crear el usuario!" 
				}); 
			}); 
		}).catch(function(err) { 
			return res.json({ 
				proc: false, 
				msg: "¡Se produjo un error en la Base de Datos al buscar el correo del usuario!" 
			}); 
		}); 
    }, 
    
	/**
	* @method :: userUpdate (POST)
	* @description :: Edita los datos de un usuario de forma asincrona y sin problemas de concurrencia
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	**/
	userUpdate: function(req, res) {
		// Guardar en variables temporales los vales de cambio
		var id = req.param("id"); 
		var firstname = req.param("firstname"); 
		var lastname = req.param("lastname");
		var email = req.param("email");
		var imgurl = req.param("imgurl");
		var iniciales = req.param("initials");
		var color = req.param("color"); 
		var rol = req.param("rol"); 

		// Verificar que no exista el correo electrónico del usuario 
		User.find({
			email: email, 
			id: { "!": id }
		}).then(function(resultCheck) { 
			if(resultCheck.length > 0) { 
				return res.json({ 
					proc: false, 
					msg: "¡El correo electrónico está ocupado por otro usuario!" 
				}); 
			} 

			// Actualizar el usuario 
			User.update({ id: id }, { 
				firstname: firstname, 
				lastname: lastname, 
				email: email, 
				imgurl: imgurl, 
				iniciales: iniciales, 
				color: color, 
				rol: rol 
			}).then(function(resultUpdate) { 
				return res.json({ 
					proc: true, 
					msg: "Usuario actualizado!" 
				}); 
			}).catch(function(err) { 
				// En caso de que exista un error en la actualización de datos 
				return res.json({ 
					proc: false, 
					msg: "¡Se produjo un error en la Base de Datos al actualizar el usuario!" 
				}); 
			}); 
		}).catch(function(err) { 
			// En caso de que exista un error en la verificación del correo electrónico 
			return res.json({ 
				proc: false, 
				msg: "¡Se produjo un error en la Base de Datos al buscar el correo del usuario!" 
			}); 
		}); 
	},

	/**
	* @method :: userUpdatePassword (POST)
	* @description :: Actualiza una contraseña de un usuario 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	*/
	userUpdatePassword: function(req, res) { 
		// Establecer los datos 
		var id = req.param("id"); 
		var userPasswordNew = req.param("userPasswordNew"); 

		// Cifrar la nueva contraseña 
		require("bcryptjs").hash(userPasswordNew, 10).then(function(result) { 
			// Actualizar la contraseña en la base de datos 
			User.update(id, { password: result }).then(function(r) { 
				return res.json({ 
					proc: true, 
					msg: "Contraseña actualizada"  
				}); 
			}).catch(function(err) { 
				sails.log(err); 
				return res.json({ 
					proc: false, 
					msg: "¡Error en la Base de Datos!" 
				}); 
			}); 

		}).catch(function(err) { 
			sails.log(err); 
			return res.json({ 
				proc: false, 
				msg: "¡Error al cifrar la nueva contraseña!" 
			}); 
		}); 
	},
}