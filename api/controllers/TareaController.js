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
		Tarea.findOne(req.param("id")).exec(function(err, tarea) {

			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err };
				return res.json({ tarea: "false" });
			}

			// Verificar si no existe la tarea
			if(!tarea) 
				return res.json({ tarea: "false" });
			else {

				// En caso de existir pedir como entrada del método nuevo tipo y se le da el nuevo tipo a la tarea
				tarea.tipo = req.param("nuevotipo"); 

				// Modificar el valor
				tarea.save(function(err) { }); 

				// Enviar un broadcast a los usuarios en línea que pertecen al proyecto
				sails.sockets.broadcast(
					req.param("project_id"), 
					"socket_project_response", { 
						message: "Mensaje desde el servidor.", 
						obj: tarea, 
						type: "TareaActualizar" 
					}, req);

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

		// De acuerdo al id de un proyecto se buscan todas las tareas asociadas a ese proyecto 
		// y se hace un populate para ver el mensaje asociado y el usuario
		Tarea.find({ project_id: req.param('id') }).populate('usuario').populate('mensaje').exec(function(err, tarea) {
			
			// Verificar si existe un error
			if(err) { 
				req.session.flash = { err: err };
				return res.json({ tarea: 'false' });
			}
			
			// Verificar si no existe la tarea
			if(!tarea) { 
				return res.json({ tarea: 'false' });
			} else { 
				
				// En caso de no existir error se devuelve el json con la lista de tareas
				return res.json({tarea:tarea});
			}
		
		});
	}
};