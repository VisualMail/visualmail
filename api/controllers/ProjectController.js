/**
* ProjectController
*
* @description ::Logica del servidor para manejar Proyectos
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {

	/**
	* @method :: add_user (POST)
	* @description :: Añade un usuario un proyecto
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	add_user: function(req, res, next) {
		
		/* Nota: */
		// No confundir, emails variable en un inicio solicitaba emails, 
		// pero realmente se piden los id (puede resultar raro pero son los id)
		// 'emails' contiene lista de ids de los usuarios
		var emails = req.param("email");

		// Llamar a la función de Sails para buscar el proyecto
		Project.findOne(req.param("id")).exec(function(err, project) {
			
			// Verificar si existe un error
			if(err) 
				return res.json({ 
					project: false, 
					mensaje: "Se produjo un error al conectarse con el objeto 'project'"
				});

			// Verificar si no existe el proyecto
			if(!project) 
				return res.json({ 
					project: false, 
					mensaje: "No existe el objeto 'project'"
				});

			// Para cada valor de 'ids' de los usuarios (variable emails)
			for(var i = 0; i < emails.length; i++) {

				// Por cada 'id', añadir al proyecto,
				// se añade el usuario al proyecto
				project.participants.add(emails[i]);

				// Guardar en la base de datos
				project.save(function(err) { });
			}
		});

		return res.redirect("/user/");
	},

	/**
	* @method :: admin (VIEW)
	* @description :: retorna la vista de administración de proyectos
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	admin: function(req, res, next) {
		
		// Llamar a Sails para ir a la vista de edición del proyecto
		Project.findOne(req.param("id")).populate("participants").exec(function(err, project) {
			
			// Verificar si existe un error
			if(err) 
				return next(err); 

			// Verificar si no existe el proyecto 
			if(!project) 
				return next(); 

			// Retornar la vista con los valores del proyecto
			return res.view({
				title: "Proyecto: " + project.name,
				sectionStyles:
					"<link href='/js/dependencies/jquery-contextmenu-2.4.1/jquery.contextMenu.min.css' rel='stylesheet' type='text/css' />" + 
					"<link href='/js/dependencies/selectize-0.12.4/css/selectize.default.css' rel='stylesheet' type='text/css' />", 
				sectionScripts: 
					"<script type='text/javascript' src='/js/dependencies/jquery-contextmenu-2.4.1/jquery.contextMenu.min.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/d3-4.8.0/js/d3.min.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/selectize-0.12.4/js/standalone/selectize.min.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/angular-selectize/js/angular-selectize.js'></script>" + 
					"<script type='text/javascript' src='/js/src/Project/ProjectController.d3.js'></script>" + 
					"<script type='text/javascript' src='/js/src/Project/ProjectController.jquery.js'></script>" + 
					"<script type='text/javascript' src='/js/src/Project/ProjectController.kanban.js'></script>" + 
					"<script type='text/javascript' src='/js/src/Project/ProjectController.js'></script>" + 
					"<script src='/js/dependencies/sails.io.js'></script>", 
				project: project
			});
		});
	},

	/**
	* @method :: create (POST)
	* @description :: Crea un nuevo proyecto
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	create: function(req, res, next) { 
		// Verificar si no existe un proyecto con el mismo nombre 
		Project.find({ where: { name: req.param("name"), owner_email: req.session.User.email }}, function(err, result) { 

			// Verificar si existe un error 
			if(err) { 
				req.session.flash = { err: err };
				return res.json({ 
					procedimiento: false, 
					mensaje: "Se produjo un error al verificar el objeto 'project'"
				});
			}

			// Si el nombre está duplicado
			if(result.length > 0) { 
				return res.json({ 
					procedimiento: false, 
					mensaje: "Ya existe un proyecto con el mismo nombre registrado por el usuario"
				});	
			} 

			//Mensaje.find({ project_id: req.param("id") }).populate("usuario").exec(function(err, mensaje) { 
			Project.create(req.allParams(), function ProjectCreated(err, project) { 

				//var data = req.allParams();
				// Verificar si existe un error
				if(err) {
					// req.session dura el tiempo de la sesion hasta que el browser cierra
					// Se actualiza la variable flash y se entrega json con formato
					req.session.flash = { err: err };
					return res.json({ 
						procedimiento: false, 
						mensaje: "Se produjo un error al conectarse con el objeto 'project'"
					});
				}
			
				// Si no hay error se deja vacía la variable flash y se retorna 'user' como json
				req.session.flash = { };
				return res.json({ 
					procedimiento: true, 
					mensaje: "Nuevo proyecto registrado", 
					project: project 
				});
			}); 
		}); 
	},

	/**
	* @method :: edit (VIEW)
	* @description :: retorna la vista edit
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	edit: function(req, res, next) {
		
		// Llamar a Sails para ir a la vista de edición del proyecto
		Project.findOne(req.param('id')).populate('participants').exec(function(err, project) {
			
			// Verificar si existe un error
			if(err) 
				return next(err); 

			// Verificar si no existe el proyecto 
			if(!project) 
				return next(); 

			// Retornar la vista con los valores del proyecto
			return res.view({
				project: project
			});
		});
	},

	/**
	* @method :: editarproyecto (POST)
	* @description :: Edita los valores del proyecto
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	editarproyecto: function(req, res, next) {
	
		// Llamar a la función de sails para buscar un proyecto y llenar con los participantes
		Project.findOne(req.param("id")).populate("participants").exec(function(err, project) {
			
			// Verificar si existe un error
			if(err) 
				return res.json({ 
					procedimiento: false, 
					mensaje: "Se produjo un error al conectarse con el objeto 'project'" 
				}); 

			// Verificar si no existe el proyecto
			if(!project) 
				return res.json({ 
					procedimiento: false, 
					mensaje: "No se encontró el objeto 'project'" 
				}); 
			else {
				
				// Si encontró el proyecto
				// actualizar el nombre del proyecto
				project.name = req.param("name"); 

				// Actualizar su fecha de termino
				project.finish_date = req.param("finish_date"); 

				// Guardar en la base de datos los cambios
				project.save(function(err) { }); 

				// Retornar un json con los valores nuevos actualizados
				return res.json({ 
					procedimiento: true, 
					mensaje: "Datos del proyecto actualizados", 
					project: project 
				}); 
			}
		});
	},

	/**
	* @method :: getDialogos (POST)
	* @description :: Consigue el dialogo asociado al proyecto
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getDialogos: function(req, res, next) {
	
		// LLamar a la función en sails para buscar el proyecto de acuerdo a su 'id'
		// y hace un populate añadiendo el objeto diálogo
		Project.findOne(req.param('id')).populate('dialogos').exec(function(err, project) { 
		
			// Verificar si existe un error
			if(err) 
				return res.json({ project: 'false' }); 

			// Verificar si no existe el proyecto 
			if(!project) 
				res.json({ project: 'false' }); 
		
			// Retornar el diálogo del proyecto
			return res.json(project.dialogos[0]);
		});
	},

	/**
	* @method :: getOne (POST)
	* @description :: Consigue el json de proyecto mas los participantes, dialogos y kanban
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getOne: function(req, res, next) {

		// LLamar a la función en sails para buscar el proyecto de acuerdo a su 'id' 
		// y hace un populate a elementos necesarios
		Project.findOne(req.param("id")).populate("participants").populate("dialogos").populate("kanban").exec(function(err, project) { 
		
			// Verificar si existe un error
			if(err) 
				return res.json({ 
					project: false 
				}); 

			// Verificar si no existe el proyecto 
			if(!project) 
				res.json({ 
					project: false 
				}); 
		
			// Caso contrario, de no haber error, retornar el proyecto como json
			return res.json({ 
				project: project 
			});
		});
	},

	/**
	* @method :: conectar_socket (POST) 
	* @description :: Añade un usuario al socket de comunicación 
	* @param :: {Object} req, request element de sails 
	* @param :: {Objetct} res, de la vista ejs del servidor 
	**/
	conectar_socket: function(req, res) { 
		// Verificar que es un socket request (no un request HTTP tradicional)
	    if (!req.isSocket) 
	    	return res.badRequest(); 

	    // Establecer el socket que realizó el request join hacia un nuevo room 
	    sails.sockets.join(req, req.param("project_id")); 

	    // Realizar un broadcast al 'room' 
	    sails.sockets.broadcast(req.param("project_id"), "conectar_socket", {message: "conectado a VisualMail Socket"}, req);
	    
	    // Responder al nuevo integrante 
	    return res.ok({
	        message: "Ahora estás conectado al proyecto."
	    });
	},
};