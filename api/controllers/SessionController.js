/**
* SessionController
*
* @description :: Lógica del lado del servidor para manejar las sesiones
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/

var bcrypt = require("bcrypt");

module.exports = { 

	/**
	* @method :: actualizarpass (POST)
	* @description :: Actualiza una contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	actualizarpass: function(req, res) {
		
		// Variable temporal para guardar la contraseña cifrada
		var nuevo;

		require("bcrypt").hash(req.param("password"), 10, function passwordEncrypted(err, password) { 

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
	* @method :: forgotPassword (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de olvido de contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	forgotPassword: function(req, res) {
		res.view({ 
			sectionScripts: "<script src='/js/src/Session/ForgotPassController.js'></script>", 
			title: "Recuperar contraseña" });
	},

	/**
	* @method :: getUser (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de login
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor 
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
	* @param :: {Objetct} res, de la vista ejs del servidor
	**/
	help: function(req, res) {
		res.view({ title: "Ayuda" });
	},

	/**
	* @method :: login (View)
	* @description :: Muestra la vista para iniciar sesión 
	* @param :: {Object} req, request element de sails 
	* @param :: {Objetct} res, respuesta desde el servidor 
	**/
	login: function(req, res) {
		//Para manejar el tiempo de sesión se puede utilizar el formato:
		/*var olddate = new Date();
		var newdate = new Date(olddate.getTime()+60000);
		req.session.cookie.expires = newdate;
		req.session.authenticated = true;*/
		res.view({ 
			title: "Iniciar sesión",
			sectionScripts: "<script src='/js/src/Session/LogInController.js'></script>" 
		});
	}, 

	/**
	* @method :: logon 
	* @description :: Se encarga de verificar y crear una sesion de usuario 
	* @param :: {Object} req, request element de sails 
	* @param :: {Objetct} res, respuesta desde el servidor 
	* @param :: {Objetct} next, para continuar en caso de error 
	**/
	logon: function(req, res, next) { 
		req.session.flash = { };
		// Verificar que el correo electrónico y la contraseña no estén vacíos
		if(!req.param("email") || !req.param("password")) { 

			// Establecer el error
			req.session.flash = {
				err: "Usuario y/o contraseña incorrecto(s)" 
			};

			// Redirigir al inicio de sesión
			return res.redirect("/session/login");
		}

		// Verificar si existe el correo electrónico
		User.findOneByEmail(req.param("email"),  function foundUser(err, user) { 

			// Verificar si existe un error
			if(err) 
				return next(err); 

			// Verificar si no existe el usuario 
			if(!user) { 

				// Establecer el error
				req.session.flash = {
					err: "Usuario y/o contraseña incorrecto(s)" 
				};

				// Redirigir al inicio de sesión
				return res.redirect("/session/login");
			}

			// Si no hay error, comparar la contraseña con la contraseña almacenada
			bcrypt.compare(req.param("password"), user.password, function(err, valid) {

				// Verificar si la contraseña no es válida
				if(!valid) { 

					// Establecer el error
					req.session.flash = {
						err: "Usuario y/o contraseña incorrecto(s)" 
					};

					// Redirigir al inicio de sesión
					return res.redirect("/session/login");
				}
			
				// Si todo salio ok, iniciar sesión al usuario
				// El valor de la variable global es verdadero
				req.session.authenticated = true; 

				// La variable global guarda los datos del usuario
				delete user.password;
				req.session.User = user; 

				if(!user.imgurl)  
					user.imgurl = "/images/profile.jpg";
			
				// Redirige a la vista principal
				res.redirect("/user/index");
			});
		});
	},

	/**
	* @method :: logout 
	* @description :: Se encarga de terminar la sesion
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	logout: function(req, res, next) {
		req.session.destroy();
		res.redirect('/');
	}, 

	/**
	* @method :: recover (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de recuperación de clave
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	**/
	recover: function(req, res) { 
		res.view({ 
			title: "Recuperar contraseña", 
			sectionScripts: "<script src='/js/src/Session/RecoverController.js'></script>" 
		});
	},

	/**
	* @method :: sendEmail (POST) 
	* @description :: Se encarga de enviar un correo a traves del hook del email
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
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
					mensaje: "No existe el usuario" });

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
	* @method :: signin (POST)
	* @description :: Crea un usuario
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	signin: function(req, res, next) {
		// Crear un usuario dado los parametros de entrada
		User.create(req.allParams(), function userCreated(err, user) {
			
			// Verificar si existe un error
			if(err) { 
				
				// req.session dura el tiempo de la sesion hasta que el browser cierra
				req.session.flash = { err: err };
				
				// Redirigir al usuario a la vista de signup
				return res.redirect("/user/signup");
			}
			
			// En caso de no haber error, se reinicializa la variable flash
			req.session.flash = { };

			// Autenticar al usuario
			req.session.authenticated = true; 

			// Guardar la variable User con los datos de usuario (global)
			delete user.password;
			req.session.User = user; 

			// Redirigir al usuario a la vista 'view'
			res.redirect("/user/index/" + user.id); 
		});
	},

	/**
	* @method :: signup (VIEW)
	* @description :: Controla la vista de signup
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	signup: function(req, res) {
		
		//res locals dura por el tiempo de la vista
		res.view({ 
			title: "Registrarse", 
			sectionScripts: 
				"<script src='/js/dependencies/jscolor-2.0.4/js/jscolor.min.js'></script>" + 
				"<script src='/js/src/Session/SignUpController.js'></script>" 
		});
	},

	/**
	* @method :: verficar_clave (POST)
	* @description :: Verifica si la clave entregada por correo es aceptada para poder cambiar el email
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	*/
	verficar_clave: function(req, res) { 
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
	} 
}