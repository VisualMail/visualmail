/**
* UserController
*
* @description :: Lógica del servidor para manejar a los usuarios
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {
	/**
	* @method :: actualizar (POST)
	* @description :: Edita los datos de un usuario de forma asincrona y sin problemas de concurrencia
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	**/
	actualizar: function(req, res) {
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
		}).then(function(resultado) { 
			if(resultado.length > 0) { 
				return res.json({ 
					procedimiento: false, 
					mensaje: "¡El correo electrónico está ocupado por otro usuario!" 
				}); 
			} 

			// Actualizar el usuario 
			User.update({ 
				id: id
			}, 
			{
				firstname: firstname, 
				lastname: lastname, 
				email: email, 
				imgurl: imgurl, 
				iniciales: iniciales, 
				color: color, 
				rol: rol 
			}).then(function(respuesta) { 
				return res.json({ 
					procedimiento: true, 
					mensaje: "Usuario actualizado!" 
				}); 
			}).catch(function(err) { 
				// En caso de que exista un error en la actualización de datos 
				return res.json({ 
					procedimiento: false, 
					mensaje: "¡Se produjo un error en la Base de Datos al actualizar el usuario!" 
				}); 
			}); 
		}).catch(function(err) { 
			// En caso de que exista un error en la verificación del correo electrónico 
			return res.json({ 
				procedimiento: false, 
				mensaje: "¡Se produjo un error en la Base de Datos al buscar el correo del usuario!" 
			}); 
		}); 
	},

	/**
	* @method :: admin (POST)
	* @description :: Administra la información de los usuarios (solo pueden acceder los administradores)
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	admin: function(req, res, next) { 
		// Redirigir a la vista 'user/admin'
		return res.view({ 
			title: "Administrar usuarios", 
			sectionHead: 
				"<link href='/js/dependencies/ng-table/2.0.2/css/ng-table.min.css'></script>", 
			sectionScripts: 
				"<script src='/js/dependencies/jscolor/2.0.4/js/jscolor.min.js'></script>" + 
				"<script src='/js/dependencies/ng-table/2.0.2/js/ng-table.min.js'></script>" + 
				"<script src='/js/src/User/AdminController.js'></script>" 
		});
	}, 

	/**
	* @method :: adminGetDatos (POST) 
	* @description :: Busca los usuarios registrados en el sistema 
	* @param :: {Object} req, request element de sails 
	* @param :: {Objetct} res, de la vista ejs del servidor 
	*/
	adminGetDatos: function(req, res) { 
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
			if(filter[item] !== "") 
				query[item] = { contains: filter[item] }; 
		}; 

		User.find(query).then(function(lista) { 

			User.count(query).then(function(total) { 
				return res.json({ 
					procedimiento: true, 
					mensaje: "", 
					lista: lista, 
					total: total
				}); 
			}).catch(function(err) { 
				sails.log(err); 
				return res.json({ 
					procedimiento: false, 
					mensaje: "¡Ocurrió un error en el conteo de la búsqueda en la base de datos!"
				});
			}); 

		}).catch(function(err) { 
			sails.log(err); 
			return res.json({ 
				procedimiento: false, 
				mensaje: "¡Ocurrió un error en la búsqueda en la base de datos!"
			});
		}); 
	}, 

	/**
	* @method :: guardar (POST)
	* @description :: Guarda los datos de un usuario de forma asincrona y sin problemas de concurrencia 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	*/
	guardar: function(req, res) { 
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
		}).then(function(resultado) { 
			if(resultado.length > 0) { 
				return res.json({ 
					procedimiento: false, 
					mensaje: "¡El correo electrónico está ocupado por otro usuario!" 
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
			}).then(function(respuesta) { 
				return res.json({ 
					procedimiento: true, 
					mensaje: "¡Usuario registrado!" 
				}); 
			}).catch(function(err) { 
				return res.json({ 
					procedimiento: false, 
					mensaje: "¡Se produjo un error en la Base de Datos al crear el usuario!" 
				}); 
			}); 
		}).catch(function(err) { 
			return res.json({ 
				procedimiento: false, 
				mensaje: "¡Se produjo un error en la Base de Datos al buscar el correo del usuario!" 
			}); 
		}); 
	}, 
	
	/**
	* @method :: actualizardatos (POST)
	* @description :: Edita los datos de un usuario de forma asincrona y sin problemas de concurrencia
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	actualizardatos: function(req, res, next){
		
		// Guardar en variables temporales los vales de cambio
		var nombre = req.param("firstname"); 
		var apellido = req.param("lastname");
		var imagenurl = req.param("imgurl");
		var iniciales = req.param("initials");
		var id = req.session.User.id; 

		// Iniciarlizar un nuevo objeto
		var object = { }; 
		var count = 0;
		
		// Por cada elemento a cambiar, revisar si este está vacío o no 
		// guardar en object, además aumentar el contador
		if(nombre !== "") {
			object["firstname"]	= nombre;
			count++;
		}
		
		if(apellido !== "") {
			object["lastname"] = apellido;
			count++;
		}
		
		if(imagenurl !== "") {
			object["imgurl"] = imagenurl;
			count++;
		}
		
		if(iniciales !== "") {
			object["initials"] = iniciales;
			count++;
		}

		// Crear el objeto array
		jsonObj = [];

		// El object queda en formato json
		jsonObj.push(object); 
		
		// Verificar si hubo un cambio
		if(count >= 1) { 
			
			// Actualizar el usuario de acuerdo al 'id' y se entrega como entrada la variable jsonObj
			User.update({ id: id }, jsonObj[0]).exec(function userupdate(err) { 

				// Verificar si existe un error
				if(err) { 
					req.session.flash = { };
					return res.json({ 
						procedimiento: false, 
						mensaje: "Se produjo un error al conectarse con el objeto 'user'"
					}); 
				}
				
				// Si no hay error, actualizar los valores de la variable de sesion User, 
				// si algún parámetro es distinto de nulo 
				req.session.flash = {}; 
				
				if(nombre !== "") 
					req.session.User.firstname = nombre;
				
				if(apellido !== "") 
					req.session.User.lastname = apellido;
					
				if(imagenurl !== "") 
					req.session.User.imgurl = imagenurl; 
					
				if(iniciales !== "") 
					req.session.User.initials = iniciales; 
					
				// Actualizar el mensaje del servidor y retornar un json con el valor de operacion correcta 
				//req.session.flash = { err: "Se han actualizado los cambios" };
				return res.json({ procedimiento: true, mensaje: "Se han actualizado los cambios" });
			}); 
		} else {

			// Caso contrario retornar si no hubieron cambios
			req.session.flash = { };
			return res.json({ 
				procedimiento: false, 
				mensaje: "No se produjo ningún cambio" 
			});
		}
	}, 

	/**
	* @method :: edit (VIEW)
	* @description :: Muestra la vista para editar el perfil
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	edit: function(req, res, next) {
		// Redirigir a la vista 'user/edit'
		return res.view({ 
			title: "Editar mi perfil", 
			sectionScripts: 
				"<script src='/js/dependencies/jscolor/2.0.4/js/jscolor.min.js'></script>" + 
				"<script src='/js/src/User/EditController.js'></script>" 
		});
	}, 

	/**
	* @method :: findOneUser (GET)
	* @description :: Busca un usuario por id y retorna el usuario y sus proyectos
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	findOneUser: function(req, res, next) {
		
		// Ejecutar la función de Sails para buscar un usuario y poblar con sus proyectos
		User.findOne(req.param('id')).populate('projects').exec(function(err, user) {
			
			// Verificar si existe un error
			if(err) 
				return res.json({ user: 'false' }); 

			// Verificar si no existe el usuario
			if(!user) 
				return res.json({ user: 'false' }); 
			else {

				// En caso de no haber error, eliminar la contraseña
				delete user.password; 

				// Retornar el json
				return res.json({ user: user }); 
			}
		});
	},

	/**
	* @method :: findUserOnly (GET)
	* @description :: Busca un usuario por id pero no pobla con sus proyectos
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	findUserOnly: function(req, res, next) {

		// Ejecutar la función de Sails para buscar un usuario por 'id'
		User.findOne(req.param('id')).exec(function(err, user) {

			// Verificar si existe un error
			if(err) 
				return res.json({ user: 'false' });
			
			// Verificar si no existe el usuario
			if(!user) 
				return res.json({ user: 'false' });
			else{

				// En caso de no haber error, eliminar la contraseña
				delete user.password;

				// Retornar el objeto 'user'
				return res.json({user: user});
			}
		});
	},

	/**
	* @method :: index (VIEW)
	* @description :: Controla la vista principal de usuarios al ingresar luego del login
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	index: function(req, res, next) {
        
		// Buscar un usuario por su 'id' y recupera los proyectos asociados
		User.findOne(req.session.User.id).populate("projects").exec(function(err, user) {

			// Verificar si existe un error
			if(err) 
				return next(err);

			// Verificar si no existe el usuario
			if(!user) 
				return next(); 
			else { 

				// Eliminar el objeto password del json resultante
				delete user.password;

				// Retornar la vista y el json del usuario
				return res.view({ 
					title: "Mis proyectos", 
					sectionScripts: "<script src='/js/src/User/IndexController.js'></script>"
				});
			}
		});
	}, 

	/**
	* @method :: getAllEmail (GET)
	* @description :: Obtiene la lista de correos de los usuarios , se utiliza para la API selectize para invitar usuarios a un proyecto 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getAllEmail: function(req, res, next) {

		// Realizar la query 
		var myQuery = User.find(); 
		var sortString = "email ASC";

		// Reordenar la lista en orden ascendente
		myQuery.sort("email ASC"); 

		// Ejecutar la query
		myQuery.exec(function(err, user) { 
			
			// Verificar si existe un error
			if(err) 
				return next(err); 

			// En caso de no haber error, crear un arreglo que guardara los datos de usuario
			var arr = []; 
			var i = 0;

			// Por cada usuario verificar si es el usuario que inició sesión
			_.each(user, function(key, value) { 

				// Si el usuario es distinto del usuario que inicio sesion
				if(user[i].email != req.session.User.email) { 
						
					// Guardar su nombre y apellido (sobreescribir)
					user[i].firstname = user[i].firstname +' ' + user[i].lastname; 

					// Guardar los datos en el arreglo
					arr.push(_.pick(key, "id", "email", "firstname", "imgurl", "pmo")); 
				}
				
				i = i + 1;
			});
			
			// Retornar el json con el arreglo
			return res.json({ arr: arr});
		});
	},
	
	/**
	* @method :: getAllProjects (GET)
	* @description :: Encuentra todos los proyectos de un usario
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getAllProjects: function(req, res) {

		// Buscar un usuario por su 'id' y recupera los proyectos asociados
		User.findOne(req.param("id")).populate("projects").exec(function(err, user) { 
			
			// Verificar si existe un error
			if(err)  
				return res.json({ 
					user: false, 
					mensaje: "Se produjo un error al conectarse con el objeto 'user'" 
				});

			// Verificar si no existe el usuario
			if(!user) 
				return res.json({ 
					user: false,
					mensaje: "No existe el objeto 'user'" 
				}); 
				
			// Eliminar el objeto password del json resultante
			delete user.password; 
			
			// Retornar el json con los datos del usuario y los proyectos asociados
			return res.json({ user: user }); 
		});
	}, 

	/**
	* @method :: password (VIEW)
	* @description :: Controla la vista principal para la modificación de la contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	password: function(req, res, next) { 
		return res.view({ 
			title: "Modificar contraseña" 
		}); 
	}, 

	/**
	* @method :: passwordActualizar (POST)
	* @description :: Actualiza una contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	passwordActualizar: function(req, res, next) { 
		// Establecer los datos 
		var user = req.session.User; 
		var userPassword = req.param("userPassword"); 
		var userPasswordNew = req.param("userPasswordNew"); 
		var userPasswordConfirm = req.param("userPasswordConfirm"); 

		// Verificar si la nueva contraseña no es igual a la actual 
		if(userPassword === userPasswordNew) { 
			req.session.passwordMessage = { result: false, message: "¡La nueva contraseña debe ser distinta de la actual!" }; 
			return res.redirect("/user/password"); 
		} 

		// Verificar si la nueva contraseña coincide 
		if(userPasswordNew !== userPasswordConfirm) { 
			req.session.passwordMessage = { result: false, message: "¡La nueva contraseña no coincide!" }; 
			return res.redirect("/user/password"); 
		} 

		// Buscar el usuario actual 
		User.findOne(user.id).then(function(result) { 
			// Verificar si no existe el usuario
			if(!result) { 
				req.session.passwordMessage = { result: false, message: "¡El usuario no existe!" }; 
				return res.redirect("/user/password"); 
			} 
			
			// Si no hay error, comparar la contraseña con la contraseña almacenada 
			var bcrypt = require("bcrypt");
			var passwordMessage = bcrypt.compare(userPassword, result.password).then(function(result) { 
				var message = ""; 

				//Verificar si es la contraseña del usuario
				if(!result) 
					message = "¡La contraseña del usuario es incorrecta!"; 
				
				return { result: result, message: message }; 
			}).catch(function(err) { 
				sails.log(err); 
				req.session.passwordMessage = { result: false, message: "¡Error al comparar la contraseña actual!" }; 
				return res.redirect("/user/password"); 
			}); 

			// Cifrar la nueva contraseña 
			userPasswordNew = bcrypt.hash(userPasswordNew, 10).then(function(result) { 
				return result; 
			}).catch(function(err) { 
				sails.log(err); 
				req.session.passwordMessage = { result: false, message: "¡Error al cifrar la nueva contraseña!" }; 
				return res.redirect("/user/password"); 
			}); 

			return [passwordMessage, userPasswordNew]; 
		}).spread(function(passwordMessage, userPasswordNew) { 
			// Si no es la contraseña del usuario 
			if(!passwordMessage.result) { 
				req.session.passwordMessage = passwordMessage; 
				return res.redirect("/user/password"); 
			}

			// Actualizar la contraseña en la base de datos 
			User.update(user.id, { password: userPasswordNew }).then(function(result) { 
				passwordMessage.message = "¡Contraseña actualizada!"; 
				req.session.passwordMessage = passwordMessage; 
				return res.redirect("/user/password"); 
			}).catch(function(err) { 
				sails.log(err); 
				req.session.passwordMessage = { result: false, message: "¡Error en la Base de Datos!" }; 
				return res.redirect("/user/password"); 
			}); 
		}).catch(function(err) { 
			sails.log(err); 
			req.session.passwordMessage = { result: false, message: "¡Error en la Base de Datos!" }; 
			return res.redirect("/user/password"); 
		}); 
	},

	/**
	* @method :: passwordActualizarUsuario (POST)
	* @description :: Actualiza una contraseña de un usuario 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	*/
	passwordActualizarUsuario: function(req, res) { 
		// Establecer los datos 
		var id = req.param("id"); 
		var userPasswordNew = req.param("userPasswordNew"); 

		// Cifrar la nueva contraseña 
		require("bcrypt").hash(userPasswordNew, 10).then(function(result) { 
			// Actualizar la contraseña en la base de datos 
			User.update(id, { password: result }).then(function(r) { 
				return res.json({ 
					procedimiento: true, 
					mensaje: "Contraseña actualizada"  
				}); 
			}).catch(function(err) { 
				sails.log(err); 
				return res.json({ 
					procedimiento: true, 
					mensaje: "¡Error en la Base de Datos!" 
				}); 
			}); 

		}).catch(function(err) { 
			sails.log(err); 
			return res.json({ 
				procedimiento: true, 
				mensaje: "¡Error al cifrar la nueva contraseña!" 
			}); 
		}); 
	},
};