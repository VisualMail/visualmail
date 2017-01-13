/**
* UserController
*
* @description :: Lógica del servidor para manejar a los usuarios
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {

	/**
	* @method :: signup (VIEW)
	* @description :: Controla la vista de signup
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	'signup': function(req, res) {
		
		//res locals dura por el tiempo de la vista
		res.view();
	},

	/**
	* @method :: view (VIEW)
	* @description :: Controla la vista principal de usuarios al ingresar luego del login
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	view: function(req, res, next) {

		// Buscar un usuario por su 'id' y recupera los proyectos asociados
		User.findOne(req.param('id')).populate('projects').exec(function(err, user) {

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
				return res.view({ user: user });
			}
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
		User.findOne(req.param('id')).populate('projects').exec(function(err, user) {
			
			// Verificar si existe un error
			if(err)  
				return res.json({ opcion: 'false' });

			// Verificar si no existe el usuario
			if(!user) 
				return res.json({ opcion: 'false' });
			else{ 
				
				// Eliminar el objeto password del json resultante
				delete user.password; 

				// Retornar el json con los datos del usuario y los proyectos asociados
				return res.json({ user: user }); 
			}
		});
	},

	/**
	* @method :: create (POST)
	* @description :: Crea un usuario
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	create: function(req, res, next) {
		
		// Crear un usuario dado los parametros de entrada
		User.create(req.allParams(), function userCreated(err, user) {
			
			// Verificar si existe un error
			if(err) { 
				
				// req.session dura el tiempo de la sesion hasta que el browser cierra
				req.session.flash = { err: err };
				
				// Redirigir al usuario a la vista de signup
				return res.redirect('/user/signup');
			}
			
			// En caso de no haber error, se reinicializa la variable flash
			req.session.flash = { };

			// Autenticar al usuario
			req.session.authenticated = true; 

			// Guardar la variable User con los datos de usuario (global)
			req.session.User = user; 

			// Redirigir al usuario a la vista 'view'
			res.redirect('/user/view/' + user.id);
		});
	},

	/**
	* @method :: edit (VIEW)
	* @description :: Muestra la vista view
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	edit: function(req, res, next) {
		User.findOne(req.param('id')).populate('projects').exec(function(err, user) {

			// Verificar si existe un error
			if(err) 
				return next(err); 

			// Verificar si no existe el usuario
			if(!user) 
				return next(); 
			else { 

				// Redirigir a la vista 'user/edit'
				return res.view(user); 
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
		var sortString='email ASC';

		// Reordenar la lista en orden ascendente
		myQuery.sort('email ASC'); 

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
					arr.push(_.pick(key, 'id', 'email', 'firstname', 'rut', 'imgurl', 'pmo')); 
				}
				
				i = i + 1;
			});
			
			// Retornar el json con el arreglo
			return res.json({ arr: arr});
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
	* @method :: actualizardatos (POST)
	* @description :: Edita los datos de un usuario de forma asincrona y sin problemas de concurrencia
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	actualizardatos: function(req,res,next){
		
		// Guardar en variables temporales los vales de cambio
		var nombre = req.param('firstname'); 
		var apellido = req.param('lastname');
		var imagenurl = req.param('imgurl');
		var iniciales = req.param('initials');
		var id = req.param('id');

		// Iniciarlizar un nuevo objeto
		var object = { }; 
		var count = 0;
		
		// Por cada elemento a cambiar, revisar si este está vacío o no 
		// guardar en object, además aumentar el contador
		if(nombre != '') {
			object["firstname"]	= nombre;
			count++;
		}
		
		if(apellido != '') {
			object["lastname"] = apellido;
			count++;
		}
		
		if(imagenurl != '') {
			object["imgurl"] = imagenurl;
			count++;
		}
		
		if(iniciales != '') {
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
			User.update({ id: req.param('id') }, jsonObj[0]).exec(function userupdate(err) {

				// Verificar si existe un error
				if(err) { 
					req.session.flash = { };
					return res.json({ opcion: 'false' });
				} else {

					// Si no hay error, actualizar los valores de la variable de sesion User, 
					// si algún parámetro es distinto de nulo
					req.session.flash={};

					if(nombre != '') {
						req.session.User.firstname = nombre;
					}
				
					if(apellido != '') {
						req.session.User.lastname = apellido;
					}

					if(imagenurl != '') {
						req.session.User.imgurl = imagenurl;
					}

					if(iniciales != '') {
						req.session.User.initials = iniciales;
					}
				
					// Actualizar el mensaje del servidor y retornar un json con el valor de operacion correcta
					req.session.flash = { err:'Se han actualizado los cambios' };
					return res.json({ opcion: 'true' });
				}
			});
		} else {

			// Caso contrario retornar si no hubieron cambios
			req.session.flash = { };
			return res.json({ opcion: 'false' });
		}
	},
};