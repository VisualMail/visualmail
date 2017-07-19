/**
* MensajeController
*
* @description :: Logica del servidor para manejar mensajes
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = { 
	/**
	* @method :: actualizarContenido (POST)
	* @description :: Actualiza el contenido del mensaje 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	actualizarContenido: function(req, res, next) { 
		// Obtener los parámetros
		var id = req.param("id"); 
		var name = req.param("name"); 

		// Actualizar el contenido del mensaje 
		Mensaje.update({ 
			id: id 
		}, { 
			name: name 
		}).then(function(result) { 
			// Retornar error 
			if(!result) { 
				return res.json({ 
					proc: false, 
					msj: "¡No se almacenó la información!", 
				}); 
			} 

			// Retornar el Ok
			return res.json({ 
				proc: true, 
				msj: "Mensaje actualizado" 
			}); 

		}).catch(function(err) { 
			// Existe un error en actualizar el mensaje 
			sails.log(err); 
			return res.json({ 
				proc: false, 
				msj: "¡Se produjo un error al actualizar el mensaje!", 
				err: err 
			});
		}); 
	}, 

	/**
	* @method :: create (POST)
	* @description :: Crea un nuevo mensaje
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	create: function(req, res, next) { 
		// Obtener el mensaje 
		var msj = { 
			name: req.param("name"), 
			namePlain: req.param("name"), 
			respuestaMarca: req.param("respuestaMarca"), 
			respuestaMarcaId: req.param("respuestaMarcaId"), 
			tipo: req.param("tipo"), 
			position: req.param("position"), 
			project_id: req.param("project_id"), 
			numero_hijos: 0, 
			root: false, 
			parent: req.param("parent"), 
			usuario: req.session.User, 
			nodoPadreId: req.param("nodoPadreId"), 
			sessionId: req.param("sessionId"), 
			nodoNivel: req.param("nodoNivel"), 
			nodoPadreNivel: req.param("nodoPadreNivel"), 
			nodoPadreSessionId: req.param("nodoPadreSessionId") 
		}; 

        // Crear el mensaje
		Mensaje.create(msj, function mensajeCreated(err, mensaje) { 
			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ 
                    mensaje: false, 
                    mensajeError: "Se produjo un error al conectarse con el objeto 'mensaje'"
                }); 
			}
			
			// Si el objeto no se pudo crear, retornar json con formato de manejo de error
			if(!mensaje) { 
				req.session.flash = { err: err }; 
				return res.json({ 
                    mensaje: false, 
                    mensajeError: "Se produjo un error al crear el objeto 'mensaje'" 
                }); 
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

	/**
	* @method :: marcar (POST)
	* @description :: Crea un registro con el texto marcado 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	marcar: function(req, res, next) { 
		// Obtener los datos 
		var marca = req.param("marca"); 
		var tipo = req.param("tipo"); 
		var mensaje = req.param("mensaje"); 
        var mensajeId = mensaje.id; 
		var usuario = req.session.User; 
		
		// Guardar la marca del mensaje 
		MensajeMarca.create({ 
			marca: marca, 
			tipo: tipo, 
			mensajeId: mensajeId, 
			usuario: usuario 
		}).then(function(result) { 
			// Retornar error 
			if(!result) { 
				return res.json({ 
					proc: false, 
					msj: "¡No se almacenó la información!", 
				}); 
			} 
			
			// Retornar ok 
			return res.json({ 
				proc: true, 
				msj: "¡Texto marcado!", 
				mensajeMarca: result 
			}); 
		}).catch(function(err) { 
			sails.log(err); 
			// Existe un error 
			return res.json({ 
				proc: false, 
				msj: "¡Se produjo un error al almacenar la 'marca' del texto!", 
				err: err 
			});
		}); 
	},

	/**
	* @method :: marcarResponder (POST)
	* @description :: Crea un mensaje con respuesta al texto marcado 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	marcarResponder: function(req, res, next) { 
		// Obtener los parámetros
		var mensajeMarcadoId = req.param("mensajeMarcadoId"); 
		var mensajeMarcadoName = req.param("mensajeMarcadoName"); 

		// Actualizar el contenido del mensaje 
		Mensaje.update({ id: mensajeMarcadoId }, { name: mensajeMarcadoName }).then(function(resultActualizar) { 
			// Retornar error 
			if(!resultActualizar) { 
				return res.json({ 
					proc: false, 
					msj: "¡No se almacenó la información!", 
				}); 
			} 

			// Obtener el mensaje 
			var msj = { 
				name: req.param("name"), 
				namePlain: req.param("name"), 
				respuestaMarca: req.param("respuestaMarca"), 
				respuestaMarcaId: req.param("respuestaMarcaId"), 
				tipo: req.param("tipo"), 
				position: req.param("position"), 
				project_id: req.param("project_id"), 
				numero_hijos: 0, 
				root: false, 
				parent: req.param("parent"), 
				usuario: req.session.User, 
				nodoPadreId: req.param("nodoPadreId"), 
				sessionId: req.param("sessionId"), 
				nodoNivel: req.param("nodoNivel"), 
				nodoPadreNivel: req.param("nodoPadreNivel"), 
				nodoPadreSessionId: req.param("nodoPadreSessionId") 
			}; 

			// Crear el mensaje 
			Mensaje.create(msj).then(function(mensaje) { 
				// Retornar error 
				if(!mensaje) { 
					return res.json({ 
						proc: false, 
						msj: "¡No se almacenó la información!" 
					}); 
				} 

				var mensajeUser = mensaje; 

				// Enviar a todos los usuarios del proyecto 
				User.findOne(mensaje.usuario).exec(function(err, user) { 
					// Verificar si existe un error 
					if(err || !user) 
						return; 

					// En caso de no haber error, eliminar la contraseña y asignar el usuario al mensaje 
					delete user.password; 
					mensajeUser["usuario"] = user; 
					mensajeUser.save(); 

					// Si no es el mensaje inicial o el primer hijo, verificar la posición 
					if(mensajeUser.nodoId > 1) 
						Mensaje.setMensajePosicion(mensajeUser, req); 
				});

				return res.json({ mensaje: mensaje }); 
			}).catch(function(err) { 
				sails.log(err); 
				// Existe un error 
				return res.json({ 
					proc: false, 
					msj: "¡Se produjo un error al almacenar la 'respuesta de la marca' del texto!", 
					err: err 
				}); 
			}); 
		}).catch(function(err) { 
			// Existe un error en actualizar el mensaje 
			sails.log(err); 
			return res.json({ 
				proc: false, 
				msj: "¡Se produjo un error al actualizar el mensaje!", 
				err: err 
			});
		}); 
	}, 

	/**
	* @method :: marcarTarea (POST)
	* @description :: Crea una tarea asociada a una marca de un mensaje 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	marcarTarea: function(req, res, next) { 
		// Obtener los parámetros de la marca 
		var mensajeMarcadoId = req.param("mensajeMarcadoId"); 
		var mensajeMarcadoName = req.param("mensajeMarcadoName"); 

		// Actualizar el contenido del mensaje 
		Mensaje.update({ id: mensajeMarcadoId }, { name: mensajeMarcadoName }).then(function(resultActualizar) { 
			// Retornar error 
			if(!resultActualizar) { 
				return res.json({ 
					proc: false, 
					msj: "¡No se almacenó la información!", 
				}); 
			} 

			// Obtener los parámetros de la tarea  
			var datos = { 
				associated: req.param("associated"), 
				drag: req.param("drag"), 
				element: req.param("element"), 
				kanban: req.param("kanban"), 
				mensaje: mensajeMarcadoId, 
				project_id: req.param("project_id"), 
				respuestaMarca: req.param("respuestaMarca"), 
				respuestaMarcaId: req.param("respuestaMarcaId"), 
				title: req.param("title"), 
				tipo: req.param("tipo"), 
				usuario: req.param("usuario") 
			}; 
			
			//Con todos los parámetros, crear una nueva tarea
			Tarea.create(datos).then(function(result) {  
				// Retornar error 
				if(!result) { 
					return res.json({ 
						proc: false, 
						msj: "¡No se almacenó la información (Nueva Tarea)!", 
					}); 
				} 
			
				// En caso de no haber error, reiniciar la variable flash 
				// y crear el objeto retornando un post con la tarea
				req.session.flash = { }; 
			
				// Enviar un broadcast a los usuarios en línea que pertecen al proyecto 
				sails.sockets.broadcast(
					req.param("project_id"), 
					"socket_project_response", { 
						message: "Mensaje desde el servidor.", 
						obj: result, 
						type: "TareaNueva", 
						selectedUsuarioTask: req.param("selectedUsuarioTask") 
					}, req); 
				return res.json({ 
					procedimiento: true, 
					mensaje: "",
					tarea: result 
				});
			}).catch(function(err) { 
				// Existe un error al crear la tarea 
				sails.log(err); 
				return res.json({ 
					proc: false, 
					msj: "¡Se produjo un error al crear la tarea!", 
					err: err 
				});
			}); 
		}).catch(function(err) { 
			// Existe un error en actualizar el mensaje 
			sails.log(err); 
			return res.json({ 
				proc: false, 
				msj: "¡Se produjo un error al actualizar el mensaje!", 
				err: err 
			});
		}); 

	}, 

	/**
	* @method :: getMarcas (POST) 
	* @description :: Obtiene las marcas de un mensaje 
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getMarcas: function(req, res, next) { 
		// Obtener los datos del mensaje principal 
		var projectId = req.param("projectId"); 
		var nodoId = req.param("nodoId"); 

		Mensaje.findOne({ project_id: projectId, nodoId: nodoId }).then(function(result) { 
			// Retornar si no existe el resultado 
			if(!result) { 
				return res.json({ 
					proc: false, 
					msj: "¡No se obtuvieron resultados del mensaje principal!" 
				}); 
			} 

			// Obtener los identificadores de las marcas 
			var dataMarca = req.param("marcaId"); 
			var marcaId = dataMarca.split(","); 

            for(var i = 0; i < marcaId.length; i++) 
                marcaId[i] = +marcaId[i]; 

			// Obtener la(s) marca(s)
			MensajeMarca.find({ mensajeId: result.id, marcaId: marcaId }).populate("usuario").then(function(r) { 
				// Retornar si no existe el resultado 
				if(!r) { 
					return res.json({ 
						proc: false, 
						msj: "¡No se obtuvieron resultados!" 
					}); 
				} 

				// Retornar datos 
				return res.json({ 
					proc: true, 
					msj: "", 
					lista: r 
				}); 
			}).catch(function(err) { 
				// Existe un error en actualizar el mensaje 
				sails.log(err); 
				return res.json({ 
					proc: false, 
					msj: "¡Se produjo un error al buscar las marcas!", 
					err: err 
				});
			}); 
		}).catch(function(err) { 
			// Existe un error en actualizar el mensaje 
			sails.log(err); 
			return res.json({ 
				proc: false, 
				msj: "¡Se produjo un error al buscar el mensaje principal!", 
				err: err 
			});
		}); 

	}, 
};