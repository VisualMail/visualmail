/**
* TareaController
*
* @description :: Lógica del lado del servidor para manejar las tareas
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {

	/**
	* @method :: create (POST)
	* @description :: Crea una nueva tarea
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	create: function(req, res, next) {
		
		//Con todos los parámetros, crear una nueva tarea
		Tarea.create(req.allParams(), function tareaCreated(err, tarea) {
			
			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err };
				return res.json({ tarea: "false" });
			}
			
			// Verificar si no existe la tarea
			if(!tarea) 
				return res.json({ tarea: "false" });
			
			// En caso de no haber error, reiniciar la variable flash 
			// y crear el objeto retornando un post con la tarea
			req.session.flash = { };

			// Enviar un broadcast a los usuarios en línea que pertecen al proyecto
			sails.sockets.broadcast(
				req.param("project_id"), 
				"socket_project_response", { 
					message: "Mensaje desde el servidor.", 
					obj: tarea, 
					type: "TareaNueva", 
					selectedUsuarioTask: req.param("selectedUsuarioTask")
				}, req);

			return res.json({ tarea: tarea });
		});
	},

	/**
	* @method :: updateTipo (POST)
	* @description :: Le da un nuevo tipo a una tarea del Kanban, ejemplo , de new a doing
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	updateTipo: function(req, res, next) {
		
		// Encontrar una tarea por el 'id'
		Tarea.findOne(req.param("id")).populate("usuario").populate("mensaje").exec(function(err, tarea) {

			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err };
				return res.json({ tarea: "false" });
			}

			// Verificar si no existe la tarea
			if(!tarea) 
				return res.json({ tarea: "false" });
			else {

				// Almacenar el tipo original de la tarea y asignar el nuevo tipo 
				var tipoOriginal = tarea.tipo; 
				tarea.tipo = req.param("nuevoTipo"); 

				// Si el nuevo tipo de la tarea es distinto del original buscar 
				// todas las tareas del tipo original ordenadas por el índice 
				if(tarea.tipo !== tipoOriginal) { 
					Tarea
						.find({ 
							project_id: tarea.project_id, 
							id: { "!": tarea.id }, 
							tipo: tipoOriginal 
						})
						.sort("index ASC")
						.then(function(tareasTipo) { 
							// Iterar en cada tarea y actualizar su índice 
							for(var i = 0; i < tareasTipo.length; i++) { 
								tareasTipo[i].index = i + 1; 
								tareasTipo[i].save(); 
							} 
						})
						.catch(function(err) {
							sails.log("Se produjo un error en 'updateTipo': ", err); 
						}); 
				} 

				// Buscar todas las tareas del nuevo tipo ordenadas por su índice 
				Tarea
					.find({ 
						project_id: tarea.project_id, 
						id: { "!": tarea.id }, 
						tipo: tarea.tipo 
					})
					.sort("index ASC")
					.then(function(tareasActualizar) { 
						// La variable "newCell" permite verificar si la tarea se cambió 
						// hacia una nueva columna (en el tablero Kanban) y el usuario 
						// no especificó el índice de la tarea 
						var newCell = req.param("newCell"); 

						// Se adquiere el nuevo indice que el usuario seleccionó 
						tarea.index = req.param("newIndex"); 

						// Si el nuevo tipo de la tarea es distinto al original y 
						// el usuario no especificó en que índice colocar la tarea 
						// establecer el último índice de la tarea 
						if(tarea.tipo !== tipoOriginal && newCell) 
							tarea.index = tareasActualizar.length + 1; 

						// Almacenar los cambios de la tarea 
						tarea.save(function(err) { }); 
						var k = 1; 

						// Para cada tarea del nuevo tipo, actualizar el nuevo índice 
						for(var j = 0; j < tareasActualizar.length; j++) { 
							tareasActualizar[j].index = k++; 

							if(tareasActualizar[j].index === tarea.index)
								tareasActualizar[j].index = k++; 
							
							tareasActualizar[j].save(); 
						} 

						// Enviar un broadcast a los usuarios en línea que pertecen al proyecto 
						// con la información de la tarea modificada 
						sails.sockets.broadcast(
							tarea.project_id, 
							"socket_project_response", { 
								message: "Mensaje desde el servidor.", 
								obj: tarea, 
								usuarioId: req.param("usuarioId"), 
								newCell: newCell, 
								newIndex: tarea.index, 
								tipoOriginal: tipoOriginal, 
								nuevoTipo: tarea.tipo, 
								type: "TareaActualizar" 
							}, req);
					}); 

				// Retornar el json con el nuevo estado de la tarea
				return res.json({ tarea: tarea }); 
			}
		});
	},

	/**
	* @method :: getTareas (GET)
	* @description :: Busca todas las tareas
	* @param :: {Object} req, request element de sails
	* @param  :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getTareas: function(req, res, next) {

		// De acuerdo al id de un proyecto, se buscan todas las tareas asociadas a ese proyecto 
		// y se hace un populate para obtener el mensaje asociado y el usuario
		Tarea.find({ project_id: req.param("id") }).populate("usuario").populate("mensaje").sort("index ASC").exec(function(err, tarea) { 
			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ tarea: "false" }); 
			}
			
			// Verificar si no existe la tarea
			if(!tarea) { 
				return res.json({ tarea: "false" }); 
			} else { 
				// En caso de no existir error se devuelve el json con la lista de tareas 
				return res.json({tarea:tarea}); 
			}
		});
	}
};