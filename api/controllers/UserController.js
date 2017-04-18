/**
* UserController
*
* @description :: Lógica del servidor para manejar a los usuarios
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {

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
    		User.update(req.session.User.id, { password: nuevo }).exec(function userUpdatedPass(err) {

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
			sectionScripts: "<script src='/js/src/User/EditController.js'></script>"
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
	} 
};