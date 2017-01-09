/**
* SessionController
*
* @description :: Lógica del lado del servidor para manejar las sesiones
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
var bcrypjs = require('bcryptjs');
module.exports = {
	
	/**
	* @method :: login (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de login
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor 
	**/
	'login': function(req, res) {
		//Para maejar el tiempo de sesión se puede utilizar el formato:
		/*var olddate = new Date();
		var newdate = new Date(olddate.getTime()+60000);
		req.session.cookie.expires = newdate;
		req.session.authenticated = true;*/
		res.view('session/login');
	},

	/**
	* @method :: recover (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de recuperación de clave
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	**/
	'recover': function(req, res) {
		res.view('session/recover');
	},

	/**
	* @method :: help (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de ayuda
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	**/
	'help': function(req, res) {
		res.view('session/help');
	},

	/**
	* @method :: forgotpassword (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de olvido de contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	'forgotpassword': function(req, res) {
		res.view('session/forgotpassword');
	},

	/**
	* @method :: create 
	* @description :: Se encarga de crear una sesion de usuario
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	create: function(req, res, next) {
		
		// Verificar el correo electrónico y la contraseña
		if(!req.param('email') || !req.param('password')) { 

			// Actualizar la variable falsh y el error asociado
			var usernamepasswordrequired = [{
				name: 'usernamepasswordrequired', 
				message: 'Debes ingresar el usuario y la contraseña.'
			}];
			req.session.flash = {
				err: usernamepasswordrequired
			};
		
			// Redirigir al inicio de sesión
			return res.redirect('/session/login');
		}

		// Verificar si existe el correo electrónico
		User.findOneByEmail(req.param('email'),  function foundUser(err, user) {

			// Verificar si existe un error
			if(err) 
				return next(err);

			// Verificar si no existe el usuario
			if(!user) {
				
				// Actualizar la variable falsh y el error asociado
				var noaccounterror = [{
					name: 'noaccount', 
					message: 'La dirección de correo ' + req.param('email') + ' no existe.'
				}];
				req.session.flash = {
					err: noaccounterror
				}
				
				// Redirigir al inicio de sesión
				return res.redirect('/session/login');
			}

			// Si no hay error, comparar la contraseña con la contraseña almacenada
			bcrypjs.compare(req.param('password'), user.password, function(err, valid) {

				// Verificar si la contraseña no es válida
				if(!valid) { 

					// Actualizar la variable falsh y el error asociado
					var errorcomp = [{
						name: 'errorcomp', 
						message: 'Contraseña inválida.'
					}];
					req.session.flash = { 
						err: errorcomp
					}

					// Redirigir al inicio de sesión
					return res.redirect('/session/login');
				}
			
				// Si todo salio ok, iniciar sesión al usuario
				// El valor de la variable global es verdadero
				req.session.authenticated = true; 

				// La variable global guarda los datos del usuario
				req.session.User = user; 

				if(!user.imgurl)  
					user.imgurl = "/images/profile.jpg";
			
				// Redirige a la vista principal
				res.redirect('user/view/' + user.id);
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
	* @method :: sendEmail (POST) 
	* @description :: Se encarga de enviar un correo a traves del hook del email
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	*/
	sendEmail: function(req, res) {

		// Buscar el usuario a través de su correo electrónico
		User.findOneByEmail(req.param('email')).exec(function(err, user) {

			// Verificar si existe un error
			if(err) {
				return res.json({ opcion: 'false' });
			}
			
			// Verificar si no existe el usuario
			if(!user) {
				
				// Actualizar la variable falsh y el error asociado
				var noaccounterror = [{
					name: 'noaccount', 
					message: 'La dirección de correo ' + req.param('email') + ' no existe.'
				}]
				req.session.flash = {
					err: noaccounterror
				}
			
				// Retornar la opción en formato de JSON 
				return res.json({ opcion: 'false' });
			}

			// Si el usuario existe se envia el correo a traves de sails hook email (Ver api/services)
			Mailer.sendWelcomeMail(user);

			// Retornar la opción en formato JSON con valor verdadero 
			// para demostrar que fue un exito y mandar mensaje por pantalla
			return res.json({ opcion: 'true' });
		});
	},

	/**
	* @method :: actualizarpass (POST)
	* @description :: Actualiza una contraseña
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	'actualizarpass': function(req, res) {
		
		// Variable temporal para guardar la contraseña cifrada
		var nuevo;

		require('bcryptjs').hash(req.param('password'), 10, function passwordEncrypted(err, password) { 

			// Verificar si existe un error
    		if(err) 
    			return res.json({ opcion: 'false' });
    		
    		// Almacenar en 'nuevo' la contraseña cifrada
    		nuevo = password; 

    		// Buscar el usuario por su 'id' y actualizar la nueva contraseña
    		User.update({ id: req.param('id') }, { password: nuevo }).exec(function userUpdatedPass(err) {

    			// Verificar si existe un error
				if(err) {
					req.session.flash = { 
						err: err
					}
					return res.json({ opcion: 'false' });
				} else {

					// Si no hay error retorna la opción con valor verdadero en formato JSON
					return res.json({ opcion: 'true' });
				}

			});

  		});

	},
	
	/**
	* @method :: verficar_clave (POST)
	* @description :: Verifica si la clave entregada por correo es aceptada para poder cambiar el email
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	*/
	'verficar_clave': function(req, res) {
		
		// De acuerdo a la contraseña solicitada
		// verificar si corresponde al id de un usuario
		var my_query = User.findOne(req.param('clave')); 
		my_query.exec(function(err, user) {

			// Verificar si existe un error
			if(err) {
				res.json({ opcion: 'false' });
			}

			// Verificar si el usuario es inválido
			if(!user) {
				return res.json({ opcion: 'false' });
			} else {
				
				// Retornar la opción con valor verdadero en formato JSON
				// informando que la contraseña fue aceptada
				return res.json({ opcion: 'true' })
			}

		});
	},
	/**
	* @method :: login (View)
	* @description :: Se encarga de dar los permisos para mostrar vista de login
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor 
	**/
	getUser: function(req, res) {
		if(req.session.User) {
			var miUsuario = req.session.User;
			delete miUsuario.password; 
			delete miUsuario.rut; 
			return res.json({ user: miUsuario });
		} else {
			return res.json({ user: "false" });
		}
	}
};

