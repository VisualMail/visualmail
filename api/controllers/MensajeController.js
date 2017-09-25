/**
* MensajeController
*
* @description :: Logica del servidor para manejar mensajes
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = { 
	/**
	* @method :: create (POST)
	* @description :: Crea un nuevo mensaje. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error. 
	**/
	create: function(req, res, next) { 
		// Obtener el mensaje 
		var msj = { 
			name: req.param("name"), 
			nodoNivel: req.param("nodoNivel"), 
			nodoPadreId: req.param("nodoPadreId"), 
			nodoPadreNivel: req.param("nodoPadreNivel"), 
			nodoPadreSessionId: req.param("nodoPadreSessionId"), 
			numero_hijos: 0, 
			parent: req.param("parent"), 
			project_id: req.param("project_id"), 
			root: req.param("root"), 
			sessionId: req.param("sessionId"), 
			tipo: req.param("tipo"), 
			tipoId: req.param("tipoId"), 
			tipoName: req.param("tipoName"), 
			tipoNameMarca: req.param("tipoNameMarca"), 
			usuario: req.session.User 
		}; 

        // Crear el mensaje
		Mensaje.create(msj).then(function(resultCreate) { 
			// Verificar si existe un error
			if(!resultCreate) { 
				return res.json({ 
                    proc: false, 
                    msg: "¡Se produjo un error con el objeto 'mensaje' (Mensaje.create)!" 
                }); 
			} 
			
			// Si no es el mensaje inicial unir el mensaje con sus hijos 
			if(!msj.root) { 
				// Buscar el mensaje padre para unir mensaje 
				Mensaje.findOne(msj.parent).populate("children").then(function(resultPadre) { 
					// Si hay error retornar 
					if(!resultPadre) { 
						return res.json({ 
							proc: false, 
							msg: "¡Se produjo un error en el objeto 'mensaje' (Mensaje.findOne)!" 
						}); 
					} 

					// Se actualiza el numero de hijos 
					resultPadre.children.add(resultCreate.id);	
					resultPadre.numero_hijos += 1; 
					resultPadre.save(); 
				}).catch(function(err) { 
					sails.log("Se produjo un error en '/mensaje/create/Mensaje.findOne': ", err); 
					return res.json({ 
						proc: false, 
						msg: "¡Se produjo un error en la conexión con la base de datos!" 
					}); 
				}); 
			}

			// Enviar a todos los usuarios del proyecto
			var mensajeUser = resultCreate;
			
			User.findOne(req.session.User.id).then(function(resultUser) { 
				// Verificar si existe un error
				if(!resultUser) { 
					return res.json({ 
						proc: false, 
						msg: "¡Se produjo un error con el objeto 'user'!" 
					}); 
				} 
				
				// En caso de no haber error, eliminar la contraseña y asignar el usuario al mensaje 
				delete resultUser.password; 
				mensajeUser["usuario"] = resultUser; 
				mensajeUser.save(); 
				
				// Si no es el mensaje inicial o el primer hijo, verificar la posición 
				if(mensajeUser.nodoId > 1) 
					Mensaje.setMensajePosicion(mensajeUser, req); 
 
				return res.json({ 
					proc: true, 
					msg: "¡Mensaje creado!", 
					mensaje: resultCreate 
				}); 
			}).catch(function(err) { 
				sails.log("Se produjo un error en '/mensaje/create/User.findOne': ", err); 
				return res.json({ 
					proc: false, 
					msg: "¡Se produjo un error en la conexión con la base de datos!" 
				}); 
			}); 
		}).catch(function(err) { 
            sails.log("Se produjo un error en '/mensaje/create/Mensaje.create': ", err); 
			return res.json({ 
				proc: false, 
				msg: "¡Se produjo un error en la conexión con la base de datos!" 
            }); 
        }); 
	}, 

	/**
	* @method :: getAllProjectId (POST) 
	* @description :: Obtiene la lista de mensajes asociados a un proyecto. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Objetct} res, de la vista ejs del servidor. 
	* @param :: {Objetct} next, para continuar en caso de error. 
	**/
	getAllProjectId: function(req, res, next) {
		// Llamar a la función de Sails para encontrar todos los mensajes segun la 'id' del proyecto 
		// más los usuarios asociados al mensaje
		Mensaje.find({ project_id: req.param("id") }).populate("usuario").sort("nodoId").then(function(result) { 
			// Si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
			if(!result) { 
				return res.json({ 
                    proc: false, 
                    msg: "¡Se produjo un error con el objeto 'mensaje'!" 
                }); 
            } 
            
            return res.json({ 
                proc: true, 
                msg: "", 
                mensaje: result 
            }); 
		}).catch(function(err) { 
            sails.log("Se produjo un error en '/mensaje/getAllProjectId': ", err); 
			return res.json({ 
				proc: false, 
				msg: "¡Se produjo un error en la conexión con la base de datos!" 
            }); 
        }); 
	}, 
};