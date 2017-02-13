 /**
* MensajeController
*
* @description :: Logica del servidor para manejar mensajes
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {

	/**
	* @method :: create (POST)
	* @description :: Crea un nuevo mensaje
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	create: function(req, res, next) { 
		Mensaje.create(req.allParams(), function mensajeCreated(err, mensaje) { 
			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: "false" }); 
			}
			
			// Si el objeto no se pudo crear, retornar json con formato de manejo de error
			if(!mensaje) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: "false" }); 
			}
			
			// Se deja la variable flash como vacía ya que no hay error y se retorna el mensaje creado
			req.session.flash = { };
			var mensajeUser = mensaje;

			// Enviar a todos los usuarios del proyecto
			User.findOne(mensaje.usuario).exec(function(err, user) {

				// Verificar si existe un error
				if(!err && user) {
					
					// En caso de no haber error, eliminar la contraseña y asignar el usuario al mensaje
					delete user.password; 
					mensajeUser["usuario"] = user; 
					mensajeUser.save(); 

					// Si no es el mensaje inicial o el primer hijo, verificar la posición 
					if(mensajeUser.nodoId > 1)
						Mensaje.setMensajePosicion(mensajeUser, req); 
				}

				return;
			});

			return res.json({ mensaje: mensaje });
		});
	},

	/**
	* @method :: getMessages (POST)
	* @description :: Obtiene la lista de mensajes asociados a un proyecto
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getMessages: function(req, res, next) {
		
		// Llamar a la función de Sails para encontrar todos los mensajes segun la 'id' del proyecto 
		// más los usuarios asociados al mensaje
		Mensaje.find({ project_id: req.param("id") }).populate("usuario").exec(function(err, mensaje) { 
			
			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: "false" }); 
			}

			// Si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
			if(!mensaje) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: "false" });
			} else { 
				// Si no hay error se deja la variable flash como vacia ya que no hay error y se retornan los mensajes
				req.session.flash = { };
				return res.json({ mensaje: mensaje });
			}
		});
	},

	/**
	* @method :: unir (POST)
	* @description :: Hace la unión entre mensajes en la parte de los modelos
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	unir: function(req, res, next) { 
		
		// Estoy uniendo
		Mensaje.findOne(req.param("id")).populate("children").exec(function(err, mensaje) { 

			// Si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: "false" });
			}

			// Si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
			if(!mensaje) {
				req.session.flash = { err: err }; 
				return res.json({ mensaje: "false" }); 
			}
			else { 
				// Si no hay error
				// se deja la variable flash como vacía ya que no hay error y se retornan los mensajes
				// se añade el mensaje a children de mensaje
				req.session.flash = { };
				mensaje.children.add(req.param("idunion"));	

				// Se actualiza el numero de hijos 
				mensaje.numero_hijos += 1; 

				// Se guarda en la base de datos
				mensaje.save(function(err) { });

				return res.json({ mensaje: mensaje });
			}
		});
	},
};