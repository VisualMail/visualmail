/** 
* SessionController 
* 
* @description :: Lógica del lado del servidor para manejar las sesiones 
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers 
**/ 

var bcrypt = require("bcryptjs"); 

module.exports = { 
	/**
	* @method :: forgotPassword (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de olvido de contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Object} res, de la vista ejs del servidor
	* @param :: {Object} next, para continuar en caso de error
	**/
	forgotPassword: function(req, res) { 
		res.view({ 
			sectionScripts: "<script src='/js/src/session/forgotPass.controller.js'></script>", 
			title: "Recuperar contraseña" 
		}); 
	}, 

	/** 
	* @method :: getUser (View) 
	* @description :: Se encarga de dar los permisos para mostrar vista de login. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Object} res, de la vista ejs del servidor. 
	**/ 
	getUser: function(req, res) { 
		if(req.session.User) 
			return res.json({ user: req.session.User }); 
			
		return res.json({ user: false }); 
	},

	 /**
	* @method :: help (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de ayuda
	* @param :: {Object} req, request element de sails
	* @param :: {Object} res, de la vista ejs del servidor
	**/
	help: function(req, res) {
		res.view({ 
			title: "Ayuda", 
			layout: "shared/admin" });
	}, 

	/**
	* @method :: index (VIEW)
	* @description :: Muestra la vista principal de la sesión 
	* @param :: {Object} req, request element de sails
	* @param :: {Object} res, de la vista ejs del servidor
	* @param :: {Object} next, para continuar en caso de error
	**/
	index: function(req, res, next) {
		// Redirigir a la vista 'user/edit'
		return res.view({ 
			title: "Mis proyectos", 
			layout: "shared/admin", 
			sectionHead:
				"<link href='/js/dependencies/bootstrap-datepicker/1.7.1/css/bootstrap-datepicker.min.css' />", 
			sectionScripts: 
				"<script type='text/javascript' src='/js/dependencies/bootstrap-datepicker/1.7.1/js/bootstrap-datepicker.min.js'></script>" + 
				"<script type='text/javascript' src='/js/dependencies/bootstrap-datepicker/1.7.1/locales/bootstrap-datepicker.es.min.js'></script>" + 
				"<script type='text/javascript' src='/js/src/session/index.controller.js'></script>" 
		});
	}, 

	/**
	* @method :: login (View)
	* @description :: Muestra la vista para iniciar sesión 
	* @param :: {Object} req, request element de sails 
	* @param :: {Object} res, respuesta desde el servidor 
	**/
	login: function(req, res) {
		//Para manejar el tiempo de sesión se puede utilizar el formato:
		/*var olddate = new Date();
		var newdate = new Date(olddate.getTime()+60000);
		req.session.cookie.expires = newdate;
		req.session.authenticated = true;*/
		res.view({ 
			title: "Iniciar sesión",
			sectionScripts: "<script src='/js/src/session/login.controller.js'></script>" 
		});
	}, 

	/**
	* @method :: logon 
	* @description :: Se encarga de verificar y crear una sesion de usuario 
	* @param :: {Object} req, request element de sails 
	* @param :: {Object} res, respuesta desde el servidor 
	* @param :: {Object} next, para continuar en caso de error 
	**/
	logon: function(req, res, next) { 
		req.session.logInErrorMessage = "¡Usuario y/o contraseña incorrecto(s)!";

		// Verificar que el correo electrónico y la contraseña no estén vacíos
		if(!req.param("email") || !req.param("password")) 
			return res.redirect("/session/login"); 

		// Verificar si existe el correo electrónico
		User.findOneByEmail(req.param("email"), function foundUser(err, user) { 

			// Verificar si existe un error
			if(err) 
				return next(err); 

			// Verificar si no existe el usuario 
			if(!user) 
				return res.redirect("/session/login"); 

			// Si no hay error, comparar la contraseña con la contraseña almacenada
			bcrypt.compare(req.param("password"), user.password, function(err, valid) {

				// Verificar si la contraseña no es válida
				if(!valid) 
					return res.redirect("/session/login"); 
			
				// Si todo salio ok, iniciar sesión al usuario
				// El valor de la variable global es verdadero
				req.session.authenticated = true; 
				delete req.session.logInErrorMessage; 

				// La variable global guarda los datos del usuario
				delete user.password;
				req.session.User = user; 

				if(!user.imgurl)  
					user.imgurl = "/images/profile.jpg";
			
				// Redirige a la vista principal
				res.redirect("/session/index");
			});
		});
	},

	/**
	* @method :: logout 
	* @description :: Se encarga de terminar la sesion. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Object} res, de la vista ejs del servidor. 
	* @param :: {Object} next, para continuar en caso de error. 
	*/ 
	logout: function(req, res, next) { 
		req.session.destroy(); 
		res.redirect("/"); 
	}, 

	/**
	* @method :: edit (VIEW)
	* @description :: Muestra la vista para editar el perfil
	* @param :: {Object} req, request element de sails
	* @param :: {Object} res, de la vista ejs del servidor
	* @param :: {Object} next, para continuar en caso de error
	**/
	profile: function(req, res, next) {
		// Redirigir a la vista 'user/edit'
		return res.view({ 
			title: "Editar mi perfil", 
			layout: "shared/admin", 
			sectionScripts: 
				"<script src='/js/dependencies/jscolor/2.0.4/js/jscolor.min.js'></script>" + 
				"<script src='/js/src/session/profile.controller.js'></script>" 
		});
	}, 

	/**
	* @method :: profileUpdate (POST)
	* @description :: Edita los datos de un usuario de forma asincrona y sin problemas de concurrencia
	* @param :: {Object} req, request element de sails
	* @param :: {Object} res, de la vista ejs del servidor
	* @param :: {Object} next, para continuar en caso de error
	**/
	profileUpdate: function(req, res, next) { 
		// Verificar si el correo electrónico existe 
		User.find({
			email: req.param("email"), 
			id: { "!": req.session.User.id } 
		}).then(function(resultCheck) { 

			// Ya existe el correo electrónico 
			if(resultCheck.length > 0) { 
				req.session.flash = { }; 
				return res.json({ 
					proc: false, 
					msg: "¡El correo electrónico ya está registrado!" 
				}); 
			} 
		
			// Guardar en variables temporales los vales de cambio
			var nombre = req.param("firstname"); 
			var apellido = req.param("lastname"); 
			var email = req.param("email"); 
			var imagenurl = req.param("imgurl"); 
			var iniciales = req.param("initials"); 
			var color = req.param("color");
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

			if(email !== "") {
				object["email"] = email;
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

			if(color !== "") {
				object["color"] = color;
				count++;
			}

			// Crear el objeto array
			jsonObj = [];

			// El object queda en formato json
			jsonObj.push(object); 
		
			// Verificar si hubo un cambio
			if(count >= 1) { 
				User.findOne({ id: id }).then(function(checkEmail) { 
					if(checkEmail.email !== email) {
						Project.update({ owner_email: checkEmail.email }, { owner_email: email }).then(function(projectOk) { 

						}).catch(function(err) { 
							sails.log(err); 
							return res.json({ 
								proc: false, 
								msg: "¡Se produjo un error en la Base de Datos (Project.update)!" 
							});
						}); 
					}
				}).catch(function(err) { 
					sails.log(err); 
					return res.json({ 
						proc: false, 
						msg: "¡Se produjo un error en la Base de Datos (User.findOne)!" 
					});
				}); 
				
				// Actualizar el usuario de acuerdo al 'id' y se entrega como entrada la variable jsonObj
				User.update({ id: id }, jsonObj[0]).exec(function userupdate(err) { 

					// Verificar si existe un error
					if(err) { 
						req.session.flash = { };
						return res.json({ 
							proc: false, 
							msg: "Se produjo un error al conectarse con el objeto 'user'"
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

					if(email !== "") 
						req.session.User.email = email; 
						
					// Actualizar el mensaje del servidor y retornar un json con el valor de operacion correcta 
					//req.session.flash = { err: "Se han actualizado los cambios" };
					return res.json({ proc: true, msg: "¡Se han actualizado los cambios!" });
				}); 
			} else {

				// Caso contrario retornar si no hubieron cambios
				req.session.flash = { };
				return res.json({ 
					proc: false, 
					msg: "¡No se produjo ningún cambio!" 
				});
			}
		}).catch(function(err) { 
			sails.log(err); 
			return res.json({ 
				proc: false, 
				msg: "¡Se produjo un error en la Base de Datos!" 
			});
		}); 
	}, 

	/**
	* @method :: password (VIEW)
	* @description :: Controla la vista principal para la modificación de la contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Object} res, de la vista ejs del servidor
	* @param :: {Object} next, para continuar en caso de error
	**/
	password: function(req, res, next) { 
		return res.view({ 
			title: "Modificar contraseña", 
			layout: "shared/admin", 
		}); 
	}, 

	/**
	* @method :: passwordActualizar (POST)
	* @description :: Actualiza una contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Object} res, de la vista ejs del servidor
	* @param :: {Object} next, para continuar en caso de error
	*/
	passwordUpdate: function(req, res, next) { 
		// Establecer los datos 
		var user = req.session.User; 
		var userPassword = req.param("userPassword"); 
		var userPasswordNew = req.param("userPasswordNew"); 
		var userPasswordConfirm = req.param("userPasswordConfirm"); 

		// Verificar si la nueva contraseña no es igual a la actual 
		if(userPassword === userPasswordNew) { 
			req.session.passwordMessage = { result: false, message: "¡La nueva contraseña debe ser distinta de la actual!" }; 
			return res.redirect("/session/password"); 
		} 

		// Verificar si la nueva contraseña coincide 
		if(userPasswordNew !== userPasswordConfirm) { 
			req.session.passwordMessage = { result: false, message: "¡La nueva contraseña no coincide!" }; 
			return res.redirect("/session/password"); 
		} 

		// Verificar si la nueva contraseña posee de 6 a 20 caracteres 
		if(userPasswordNew.length < 6 || userPasswordNew.length > 20) { 
			req.session.passwordMessage = { result: false, message: "¡La nueva contraseña de poseer mínimo 6 caracteres y máximo 20 caracteres!" }; 
			return res.redirect("/session/password"); 
		} 

		// Buscar el usuario actual 
		User.findOne(user.id).then(function(result) { 
			// Verificar si no existe el usuario
			if(!result) { 
				req.session.passwordMessage = { result: false, message: "¡El usuario no existe!" }; 
				return res.redirect("/session/password"); 
			} 
			
			// Si no hay error, comparar la contraseña con la contraseña almacenada 
			var passwordMessage = bcrypt.compare(userPassword, result.password).then(function(result) { 
				var message = ""; 

				//Verificar si es la contraseña del usuario
				if(!result) 
					message = "¡La contraseña del usuario es incorrecta!"; 
				
				return { result: result, message: message }; 
			}).catch(function(err) { 
				sails.log(err); 
				req.session.passwordMessage = { result: false, message: "¡Error al comparar la contraseña actual!" }; 
				return res.redirect("/session/password"); 
			}); 

			// Cifrar la nueva contraseña 
			userPasswordNew = bcrypt.hash(userPasswordNew, 10).then(function(result) { 
				return result; 
			}).catch(function(err) { 
				sails.log(err); 
				req.session.passwordMessage = { result: false, message: "¡Error al cifrar la nueva contraseña!" }; 
				return res.redirect("/session/password"); 
			}); 

			return [passwordMessage, userPasswordNew]; 
		}).spread(function(passwordMessage, userPasswordNew) { 
			// Si no es la contraseña del usuario 
			if(!passwordMessage.result) { 
				req.session.passwordMessage = passwordMessage; 
				return res.redirect("/session/password"); 
			}

			// Actualizar la contraseña en la base de datos 
			User.update(user.id, { password: userPasswordNew }).then(function(result) { 
				passwordMessage.message = "¡Contraseña actualizada!"; 
				req.session.passwordMessage = passwordMessage; 
				return res.redirect("/session/password"); 
			}).catch(function(err) { 
				sails.log(err); 
				req.session.passwordMessage = { result: false, message: "¡Error en la Base de Datos '/User/update'!" }; 
				return res.redirect("/session/password"); 
			}); 
		}).catch(function(err) { 
			sails.log(err); 
			req.session.passwordMessage = { result: false, message: "¡Error en la Base de Datos '/User/findOne'!" }; 
			return res.redirect("/session/password"); 
		}); 
	}, 

	/** 
	* @method :: passwordUpdateRecover (POST) 
	* @description :: Actualiza una contraseña desde el formulario de recuperar contraseña. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Object} res, de la vista ejs del servidor. 
	* @param :: {Object} next, para continuar en caso de error. 
	*/ 
	passwordUpdateRecover: function(req, res) { 
		// Variable temporal para guardar la contraseña cifrada
		var nuevo;

		bcrypt.hash(req.param("password"), 10, function passwordEncrypted(err, password) { 

			// Verificar si existe un error
    		if(err) 
    			return res.json({ 
					procedimiento: false, 
					mensaje: "Se produjo un error al conectarse con el objeto 'bcrypt'" 
				}); 
    		
    		// Almacenar en 'nuevo' la contraseña cifrada 
    		nuevo = password; 

    		// Buscar el usuario por su 'id' y actualizar la nueva contraseña 
    		User.update({ id: req.param("id") }, { password: nuevo }).exec(function userUpdatedPass(err) { 

    			// Verificar si existe un error 
				if(err) 
					return res.json({ 
						procedimiento: false, 
						mensaje: "Se produjo un error al actualizar la contraseña" 
					}); 
					
				// Si no hay error retorna la opción con valor verdadero en formato JSON 
				return res.json({ 
					procedimiento: true, 
					mensaje: "Contraseña actualizada" 
				}); 
			}); 
  		}); 
	}, 
	
	/** 
	* @method :: recover (View) 
	* @description :: Se encarga de dar los permisos para mostrar vista de recuperación de clave. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Object} res, de la vista ejs del servidor. 
	**/ 
	recover: function(req, res) { 
		res.view({ 
			title: "Recuperar contraseña", 
			sectionScripts: "<script src='/js/src/session/recover.controller.js'></script>" 
		}); 
	}, 

	/** 
	* @method :: verficar_clave (POST) 
	* @description :: Verifica si la clave entregada por correo es aceptada para poder cambiar el email. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Object} res, de la vista ejs del servidor. 
	*/ 
	recoverVerificar: function(req, res) { 
		// De acuerdo a la contraseña solicitada 
		// verificar si corresponde al id de un usuario 
		var my_query = User.findOne(req.param("clave")); 
		my_query.exec(function(err, user) { 

			// Verificar si existe un error
			if(err) 
				return res.json({ 
					procedimiento: false, 
					mensaje: "No se pudo conectar con el objeto 'user'" 
				});

			// Verificar si el usuario es inválido
			if(!user) 
				return res.json({ 
					procedimiento: false, 
					mensaje: "Clave ingresada no es válida" 
				});
				
			// Retornar la opción con valor verdadero en formato JSON
			// informando que la contraseña fue aceptada
			return res.json({ 
				procedimiento: true, 
				mensaje: "Clave ingresada válida" 
			}); 
		}); 
	}, 

	/**
	* @method :: sendEmail (POST) 
	* @description :: Se encarga de enviar un correo a traves del hook del email
	* @param :: {Object} req, request element de sails
	* @param :: {Object} res, de la vista ejs del servidor
	*/
	sendEmail: function(req, res) {
		// Buscar el usuario a través de su correo electrónico
		User.findOneByEmail(req.param("email")).exec(function(err, user) { 

			// Verificar si existe un error
			if(err) {
				return res.json({ 
					procedimiento: false, 
					mensaje: "Se produjo un error en la conexión con la base de datos" 
				 }); 
			} 
			
			// Verificar si no existe el usuario 
			if(!user) 
				return res.json({ 
					procedimiento: false, 
					mensaje: "No existe el usuario" 
				}); 

			// Si el usuario existe se envia el correo a traves de sails hook email (Ver api/services) 
			Mailer.sendWelcomeMail(user); 

			// Retornar la opción en formato JSON con valor verdadero 
			// para demostrar que fue un exito y mandar mensaje por pantalla 
			return res.json({ 
				procedimiento: true, 
				mensaje: "Se envío un correo al 'email' ingresado" 
			}); 
		}); 
	}, 

	/** 
	* @method :: signin (VIEW) 
	* @description :: Controla la vista de signup. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Object} res, de la vista ejs del servidor. 
	* @param :: {Object} next, para continuar en caso de error. 
	**/ 
	signin: function(req, res) { 
		//res locals dura por el tiempo de la vista 
		res.view({ 
			title: "Registrarse", 
			sectionScripts: 
				"<script src='/js/dependencies/jscolor/2.0.4/js/jscolor.min.js'></script>" + 
				"<script src='/js/src/session/signin.controller.js'></script>" 
		}); 
	}, 

	/** 
	* @method :: signup (POST) 
	* @description :: Crea un usuario. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Object} res, de la vista ejs del servidor. 
	* @param :: {Object} next, para continuar en caso de error. 
	**/ 
	signup: function(req, res, next) { 
		// Verificar si el correo electrónico existe 
		User.find({
			email: req.param("email") 
		}).then(function(resultCheck) { 

			// Ya existe el correo electrónico 
			if(resultCheck.length > 0) { 
				req.session.signInErrorMessage = "¡El correo electrónico ya está registrado!"; 
				res.redirect("/session/signin"); 
				return; 
			} 

			// Crear un usuario dado los parametros de entrada 
			User.create(req.allParams()).then(function(usuarioNuevo) { 
				// Si existe error retornar 
				if(!usuarioNuevo) { 
					req.session.signInErrorMessage = "¡Se produjo un error con el objeto 'usuario'!"; 
					res.redirect("/session/signin"); 
					return; 
				}

				// Autenticar al usuario
				req.session.authenticated = true; 

				// Guardar la variable User con los datos de usuario (global)
				delete usuarioNuevo.password; 
				delete req.session.signInErrorMessage; 
				req.session.User = usuarioNuevo; 

				// Redirigir al usuario a la vista inicial 
				res.redirect("/session/index/" + usuarioNuevo.id); 
			}).catch(function(err) { 
				sails.log(err); 
				req.session.signInErrorMessage = "¡Error en la Base de Datos 'User.create'!"; 
				return res.redirect("/session/signin"); 
			}); 
		}).catch(function(err) { 
			sails.log(err); 
			req.session.signInErrorMessage = "¡Error en la Base de Datos!"; 
			return res.redirect("/session/signin"); 
		}); 
	}, 
}