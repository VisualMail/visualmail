/**
* UserController
*
* @description :: Lógica del servidor para manejar a los usuarios
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = { 
	/**
	* @method :: getAllEmail (GET)
	* @description :: Obtiene la lista de correos de los usuarios , se utiliza para la API selectize para invitar usuarios a un proyecto 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getAllEmail: function(req, res, next) { 
		// Ejecutar la query 
		User.find().sort("email ASC").then(function(result) { 
			// Verificar si no existe un error 
			if(!result) { 
				return res.json({ 
					proc: false, 
					msg: "¡Se produjo un error con el objeto 'user'!" 
				}); 
			}

			// En caso de no haber error, crear un arreglo que guardara los datos de usuario 
			var arr = []; 
			var i = 0; 
			
			// Por cada usuario verificar si es el usuario que inició sesión 
			_.each(result, function(key, value) { 
				// Si el usuario es distinto del usuario que inicio sesion 
				if(result[i].email != req.session.User.email) { 
					// Guardar su nombre y apellido (sobreescribir) 
					result[i].firstname = result[i].firstname +' ' + result[i].lastname; 
					
					// Guardar los datos en el arreglo 
					arr.push(_.pick(key, "id", "email", "firstname", "lastname", "imgurl", "pmo", "initials", "color")); 
				} 
				
				i = i + 1; 
			}); 
			
			// Retornar el json con el arreglo 
			return res.json({ 
				proc: true, 
				msg: "", 
				users: arr 
			});
		}).catch(function(err) { 
			sails.log(err); 
			return res.json({ 
				proc: true, 
				msg: "¡Se produjo un error en la base de datos!" 
			}); 
		}); 
	}, 
};