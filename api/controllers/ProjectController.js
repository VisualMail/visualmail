/**
* ProjectController
*
* @description ::Logica del servidor para manejar Proyectos
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {
	/**
	* @method :: addUser (POST)
	* @description :: Añade un usuario un proyecto
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	addUser: function(req, res, next) {
		/* Nota: */
		// No confundir, emails variable en un inicio solicitaba emails,
		// pero realmente se piden los id (puede resultar raro pero son los id)
		// 'emails' contiene lista de ids de los usuarios
		var usuarioId = req.param("usuarioId");

		// Llamar a la función de Sails para buscar el proyecto
		Project.findOne(req.param("id")).then(function(result) {
			// Verificar si existe un error
			if(!result) {
				return res.json({
					proc: false,
					msg: "¡Se produjo un error con el objeto 'project'!"
				});
			}

			if(result.owner_email !== req.session.User.email) {
				return res.json({
					proc: false,
					msg: "¡No tienes los permisos suficientes!"
				});
			}

			// Para cada valor de 'ids' de los usuarios (variable emails)
			for(var i = 0; i < usuarioId.length; i++) {
				// Por cada 'id', añadir al proyecto,
				// se añade el usuario al proyecto
				result.participants.add(usuarioId[i]);

				// Guardar en la base de datos
				result.save();
			}

			return res.json({
				proc: true	,
				msg: "¡Datos registrados!"
			});
		}).catch(function(err) {
			sails.log(err);
			return res.json({
				proc: false,
				msg: "¡Se produjo un error en la base de datos al momento de verificar el objeto 'project'!"
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

	/**
	* @method :: control (VIEW)
	* @description :: retorna la vista de administración de proyectos (sin kanban)
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	control: function(req, res, next) { 
		
		// Llamar a Sails para ir a la vista de edición del proyecto 
		Project.findOne(req.param("id")).populate("participants").exec(function(err, project) { 
			
			if(project.bloqueado) {
				res.redirect("/session/index"); 
				return;
			}

			// Verificar si existe un error 
			if(err) 
				return next(err); 
				
			// Verificar si no existe el proyecto 
			if(!project) 
				return next(); 

			// Verificar si es un participante del proyecto 
			var notMine = true; 
			
			_.each(project.participants, function(item) { 
				if(item.id === req.session.User.id) 
					notMine = false; 
			}); 
			
			if(notMine) { 
				res.redirect("/session/index"); 
				return; 
			}

			// Retornar la vista con los valores del proyecto 
			return res.view({ 
				title: "Proyecto: " + project.name, 
				layout: "shared/project", 
				sectionHead: 
					"<link href='/js/dependencies/bootstrap-datepicker/1.7.1/css/bootstrap-datepicker.min.css' />" + 
					"<link href='/js/dependencies/jquery-contextmenu/2.4.1/jquery.contextMenu.css' rel='stylesheet' type='text/css' />" + 
					"<link href='/js/dependencies/jquery-splitter/0.24.0/css/jquery.splitter.css' rel='stylesheet' type='text/css' />" + 
					"<link href='/js/dependencies/ng-table/2.0.2/css/ng-table.min.css' rel='stylesheet' type='text/css' />", 
				sectionScripts: 
					"<script type='text/javascript' src='/js/dependencies/bootstrap-datepicker/1.7.1/js/bootstrap-datepicker.min.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/bootstrap-datepicker/1.7.1/locales/bootstrap-datepicker.es.min.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/d3/4.8.0/js/d3.min.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/jquery-contextmenu/2.4.1/jquery.contextMenu.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/jquery-splitter/0.24.0/js/jquery.splitter.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/ng-file-upload/12.2.13/js/ng-file-upload-all.min.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/ng-file-upload/12.2.13/js/ng-file-upload-shim.min.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/ng-table/2.0.2/js/ng-table.min.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/control.d3.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/control.controller.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/control.chat.controller.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/control.mensaje.controller.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/control.project.controller.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/control.init.js'></script>" + 
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
		Project.find({ where: { name: req.param("name"), owner_email: req.session.User.email }}).then(function(result) {
			// Si el nombre está duplicado
			if(result.length > 0) {
				return res.json({
					proc: false,
					msg: "¡Ya existe un proyecto con el mismo nombre registrado por el usuario!"
				});
			}

			// Crear el proyecto
			Project.create(req.allParams()).then(function(resultCreate) {
				if(!resultCreate) {
					return res.json({
						proc: false,
						msg: "¡Se produjo un error con el objeto 'project'!"
					});
				}

				return res.json({
					proc: true,
					msg: "¡Nuevo proyecto registrado!",
					project: resultCreate
				});

			}).catch(function(err) {
				sails.log(err);
				return res.json({
					proc: false,
					msg: "¡Se produjo un error en la base de datos al momento de crear el objeto 'project'!"
				});
			});

		}).catch(function(err) {
			sails.log(err);
			return res.json({
				proc: false,
				msg: "¡Se produjo un error en la base de datos al momento de verificar el objeto 'project'!"
			});
		});
	},

	deleteUser: function(req, res, next) {
		Project.findOne(req.param("projectId")).populate("participants").then(function(result) {

			// Verificar si no existe el proyecto
			if(!result) {
				return res.json({
					proc: false,
					msg: "¡Se produjo un error con el objeto 'project'!"
				});
			}

			var userId = req.param("userId"); 

			for(var i = 0; i < result.participants.length; i++) { 
				if(result.participants[i].id !== userId) 
					continue; 
				
				result.participants.remove(userId); 
				result.save();
				break;
			}

			// Caso contrario, de no haber error, retornar el proyecto como json
			return res.json({
				proc: true,
				msg: "¡Usuario eliminado!",
				project: result
			});
		}).catch(function(err) {
			sails.log(err);
			return res.json({
				proc: true,
				msg: "¡Se produjo un error en la base de datos!",
			});
		});
	}, 

	/**
	* @method :: getOne (POST)
	* @description :: Consigue el json del proyecto más los participantes y kanban.
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getOne: function(req, res, next) {
		// LLamar a la función en sails para buscar el proyecto de acuerdo a su 'id'
		// y hace un populate a elementos necesarios
		Project.findOne(req.param("id"))
		.populate("participants")
		.populate("kanban")
		.then(function(result) {
			// Verificar si no existe el proyecto
			if(!result) {
				return res.json({
					proc: false,
					msg: "¡Se produjo un error con el objeto 'project'!"
				});
			}

			// Caso contrario, de no haber error, retornar el proyecto como json
			return res.json({
				proc: true,
				msg: "",
				project: result
			});
		}).catch(function(err) {
			sails.log(err);
			return res.json({
				proc: true,
				msg: "¡Se produjo un error en la base de datos!",
			});
		});
	},

	/**
	* @method :: getUserProjects (GET)
	* @description :: Encuentra todos los proyectos de un usuario
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getUserProjects: function(req, res) {
		var userId = req.session.User.id;

		// Buscar un usuario por su 'id' y recupera los proyectos asociados
		User.findOne({ id: userId }).populate("projects").then(function(result) {
			if(!result) {
				return res.json({
					proc: false,
					msg: "¡Se produjo un error al conectarse con el objeto 'user'!"
				});
			}

			delete result.password;

			return res.json({
				proc: true,
				msg: "",
				user: result
			});
		}).catch(function(err) {
			sails.log("Se produjo un error en 'projet/getUserProjects': ", err);
			return res.json({
				proc: false,
				msg: "Se produjo un error en la conexión con la base de datos"
			});
		});
	},

	/**
	* @method :: index (VIEW)
	* @description :: retorna la vista de administración de proyectos
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	index: function(req, res, next) {

		// Llamar a Sails para ir a la vista de edición del proyecto
		Project.findOne(req.param("id")).populate("participants").exec(function(err, project) {
			if(project.bloqueado) {
				res.redirect("/session/index"); 
				return;
			}
			// Verificar si existe un error
			if(err)
				return next(err);

			// Verificar si no existe el proyecto
			if(!project)
				return next();

			// Verificar si es un participante del proyecto 
			var notMine = true; 

			_.each(project.participants, function(item) { 
				if(item.id === req.session.User.id) 
					notMine = false; 
			}); 

			if(notMine) {
				res.redirect("/session/index");
				return; 
			}

			// Retornar la vista con los valores del proyecto
			return res.view({
				title: "Proyecto: " + project.name,
				layout: "shared/project",
				sectionHead:
					"<link href='/js/dependencies/bootstrap-datepicker/1.7.1/css/bootstrap-datepicker.min.css' />" +
					"<link href='/js/dependencies/jquery-contextmenu/2.4.1/jquery.contextMenu.css' rel='stylesheet' type='text/css' />" +
					"<link href='/js/dependencies/jquery-splitter/0.24.0/css/jquery.splitter.css' rel='stylesheet' type='text/css' />" +
					"<link href='/js/dependencies/ng-table/2.0.2/css/ng-table.min.css' rel='stylesheet' type='text/css' />",
				sectionScripts:
					"<script type='text/javascript' src='/js/dependencies/bootstrap-datepicker/1.7.1/js/bootstrap-datepicker.min.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/bootstrap-datepicker/1.7.1/locales/bootstrap-datepicker.es.min.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/d3/4.8.0/js/d3.min.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/jquery-contextmenu/2.4.1/jquery.contextMenu.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/jquery-splitter/0.24.0/js/jquery.splitter.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/ng-file-upload/12.2.13/js/ng-file-upload-all.min.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/ng-file-upload/12.2.13/js/ng-file-upload-shim.min.js'></script>" +
					"<script type='text/javascript' src='/js/dependencies/ng-table/2.0.2/js/ng-table.min.js'></script>" +
					"<script type='text/javascript' src='/js/src/project/index.d3.js'></script>" +
					"<script type='text/javascript' src='/js/src/project/index.kanban.js'></script>" +
					"<script type='text/javascript' src='/js/src/project/index.controller.js'></script>" +
					"<script type='text/javascript' src='/js/src/project/index.chat.controller.js'></script>" +
					"<script type='text/javascript' src='/js/src/project/index.kanban.controller.js'></script>" +
					"<script type='text/javascript' src='/js/src/project/index.mensaje.controller.js'></script>" +
					"<script type='text/javascript' src='/js/src/project/index.project.controller.js'></script>" +
					"<script type='text/javascript' src='/js/src/project/index.init.js'></script>" +
					"<script src='/js/dependencies/sails.io.js'></script>",
				project: project
			});
		});
	},

	/**
	* @method :: update (POST)
	* @description :: Edita los valores del proyecto
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	update: function(req, res, next) {
		// Llamar a la función de sails para buscar un proyecto y llenar con los participantes
		Project.findOne({ id: req.param("id"), owner_email: req.session.User.email }).populate("participants").then(function(result) {
			// Verificar si existe un error
			if(!result) {
				return res.json({
					proc: false,
					msg: "¡Se produjo un error con el objeto 'project'!"
				});
			} 

			// Actualizar los parámetros del proyecto
			var name = req.param("name");
			var finish_date = req.param("finish_date");
			var description = req.param("description");

			if(name !== "")
				result.name = name;

			result.finish_date = finish_date;

			if(description !== "")
				result.description = description;

			// Guardar en la base de datos los cambios
			result.save();

			// Retornar un json con los valores nuevos actualizados
			return res.json({
				proc: true,
				msg: "¡Datos del proyecto actualizados!",
				project: result
			});
		}).catch(function(err) {
			sails.log(err);
			return res.json({
				proc: false,
				msg: "¡Se produjo un error en la base de datos!!"
			});
		});
	}, 
};
