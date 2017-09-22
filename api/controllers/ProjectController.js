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
		Project.findOne(req.param("id"))
		.populate("participants")
		.populate("dialogos")
		.populate("kanban")
		.then(function(result) { 
			// Verificar si no existe el proyecto 
			if(!result) { 
				return res.json({ 
					proc: false, 
					msj: "¡Se produjo un error con el objeto 'project'!" 
				}); 
			} 
			
			// Caso contrario, de no haber error, retornar el proyecto como json 
			return res.json({ 
				proc: true, 
				msj: "", 
				project: result 
			}); 
		}).catch(function(err) { 
			sails.log(err); 
			return res.json({ 
				proc: true, 
				msj: "¡Se produjo un error en la base de datos!", 
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
	* @method :: admin (VIEW)
	* @description :: retorna la vista de administración de proyectos
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	index: function(req, res, next) {
		
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
					"<script type='text/javascript' src='/js/dependencies/ng-table/2.0.2/js/ng-table.min.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/index.d3.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/index.kanban.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/index.init.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/index.controller.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/index.kanban.controller.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/index.mensaje.controller.js'></script>" + 
					"<script type='text/javascript' src='/js/src/project/index.project.controller.js'></script>" + 
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
		Project.findOne(req.param("id")).populate("participants").then(function(result) { 
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
				sectionHead:
					"<link href='/js/dependencies/jquery-contextmenu/2.4.1/jquery.contextMenu.min.css' rel='stylesheet' type='text/css' />" + 
					"<link href='/js/dependencies/selectize/0.12.4/css/selectize.default.css' rel='stylesheet' type='text/css' />", 
				sectionScripts: 
					"<script type='text/javascript' src='/js/dependencies/jquery-contextmenu/2.4.1/jquery.contextMenu.min.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/d3/4.8.0/js/d3.min.js'></script>" + 
					"<script type='text/javascript' src='/js/dependencies/selectize/0.12.4/js/standalone/selectize.min.js'></script>" + 
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

	delete: function(req, res, next) { 
		Project.findOne(req.param("id"))
		.populate("participants")
		.populate("dialogos")
		.populate("kanban")
		.then(function(project) { 
			sails.log("Eliminando proyecto: ", project.id); 
			

			for(var i = 0; i < project.participants.length; i++) { 
				project.participants.remove(project.participants[i].id); 
			}

			project.save(); 
			
			Mensaje.find({ project_id: project.id }).populate("children").then(function(mensaje) { 

				if(mensaje.children) { 

					for(var i = 0; i < mensaje.length; i++) { 
						mensaje.children.remove(mensaje.children[i].id);

						MensajeMarca.destroy({ menasjeId: mensaje[i].id }).then(function(mensajeMarca) { 
							sails.log("Mensaje Marca eliminado"); 
						}); 
					} 

					mensaje.save(); 

				}

				
				
				Mensaje.destroy({ project_id: project.id }).then(function(mensajeDestroy) { 
					sails.log("Mensajes eliminados"); 
				}); 
		
				


			}); 

			
			Tarea.destroy({ project_id: project.id }).then(function(tareaDestroy) { 
				sails.log("Tareas eliminadas"); 

				Kanban.destroy({ project_id: project.id }).then(function(kanbanDestroy) { 
					sails.log("Kanban eliminado"); 
				}); 
			}); 

			/*Dialogo.destroy({ project_id: project.id }).then(function(dialogoDestroy) { 
				sails.log("Diálogo destruido"); 
			}); */

			Project.destroy(req.param("id")).then(function(projectDestroy) { 
				return ({ 
					proc: true, 
					msg: "¡Proyecto eliminado!"
				}); 
			}); 

			


			
			

		}).catch(function(err) { 
			sails.log("Se produjo un error en '/project/delete/Project.find(project): ", err); 
			return res.json({ 
				proc: false, 
				msg: "¡Se produjo un error en '/project/delete/Project.find(project)!" 
			}); 
		}); 
	}




};