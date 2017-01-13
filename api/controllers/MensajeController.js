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
				return res.json({ mensaje: 'false' }); 
			}
			
			// Si el objeto no se pudo crear, retornar json con formato de manejo de error
			if(!mensaje) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: 'false' }); 
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

					// Buscar los mensajes almacenados en la sesión del usuario
					Mensaje.find({ project_id: mensajeUser.project_id, sessionId: mensajeUser.sessionId }).exec(function(err, msj) {

						var revisarSession = false; 
						var revisarSessionId = 0; 
						var nivelOcupado = false; 
						var existeNodoHermano = false; 

						if(msj.length >= 2) {

							// Obtener el estado actual de los nodos en la sesión
							for(var i = 0; i < msj.length; i++) { 
								if(mensajeUser.nodoId !== msj[i].nodoId) {

									// Verificar si está ocupado el nivel actual del nuevo mensaje 
									if(!nivelOcupado && (mensajeUser.nodoNivel === msj[i].nodoNivel)) 
										nivelOcupado = true; 

									// Verificar si existe un nodo hermano en el mapa 
									if(!existeNodoHermano && (mensajeUser.nodoPadreId === msj[i].nodoPadreId)) 
										existeNodoHermano = true; 
								}
							} 

							// Si el nivel está ocupado
							if(nivelOcupado) { 
								revisarSession = true;
								revisarSessionId= mensajeUser.sessionId; 

								var ultimoNivel = 0;

								for(var i = 0; i < msj.length; i++) {

									// Si existe(n) nodo(s) hermano(s)
									if(existeNodoHermano) { 

										// Si el nodo está en la misma posición o continua al nodo actual de la sesión
										// actualizar el nivel
										if(mensajeUser.nodoPadreId !== msj[i].nodoPadreId && mensajeUser.nodoNivel <= msj[i].nodoNivel) {
											msj[i].nodoNivel++;
											msj[i].save();
										}

									} else 
										ultimoNivel = (ultimoNivel < msj[i].nodoNivel ? msj[i].nodoNivel : ultimoNivel); 
								}

								// Si no tiene nodo(s) hermano(s)
								// agregar el nodo en el último nivel
								if(!existeNodoHermano) {
									mensajeUser.nodoNivel = ++ultimoNivel;
									mensajeUser.save(); 
								}
							}

						}

						// Enviar un broadcast a los usuarios en línea que pertecen al proyecto
						sails.sockets.broadcast(
							mensaje.project_id, 
							"socket_project_response", { 
								message: "Mensaje desde el servidor.", 
								type: "MensajeNuevo", 
								obj: mensajeUser, 
								revisarSession: (revisarSession && nivelOcupado && existeNodoHermano), 
								revisarSessionId: revisarSessionId 
							}, req); 
					});
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
		Mensaje.find({ project_id: req.param('id') }).populate('usuario').exec(function(err, mensaje) { 
			
			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: 'false' }); 
			}

			// Si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
			if(!mensaje) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: 'false' });
			} else { 
				// Si no hay error se deja la variable flash como vacia ya que no hay error y se retornan los mensajes
				req.session.flash = { };
				return res.json({mensaje: mensaje});
			}
		});
	},

	/**
	* @method :: unir (POST)
	* @description :: Hace la unión entre mensajes en la parte de lños modelos
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	unir: function(req, res, next) { 
		
		// Estoy uniendo
		Mensaje.findOne(req.param('id')).populate('children').exec(function(err, mensaje) { 

			// Si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ mensaje: 'false' });
			}

			// Si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
			if(!mensaje) {
				req.session.flash = { err: err }; 
				return res.json({ mensaje: 'false' }); 
			}
			else { 
				// Si no hay error
				// se deja la variable flash como vacía ya que no hay error y se retornan los mensajes
				// se añade el mensaje a children de mensaje
				req.session.flash = { };
				mensaje.children.add(req.param('idunion'));	

				// Se actualiza el numero de hijos 
				mensaje.numero_hijos = mensaje.numero_hijos + 1; 

				// Se guarda en la base de datos
				mensaje.save(function(err) { });

				return res.json({ mensaje: mensaje });
			}
		});
	},
};