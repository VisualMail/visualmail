/**
* KanbanController
*
* @description :: Logica del lado del servidor para manejar los tableros Kanban
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {
	/**
	* @method :: create (POST)
	* @description :: Crea un nuevo del kanban
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	create: function(req, res, next) {
		// Llamar a la función de Sails para crear el objeto, se piden todos los parámetros requeridos en el 'req' 
		Kanban.create(req.allParams()).then(function(result) { 
			// Verificar si existe un error con el objeto que arroja la respuesta 
			if(!result) { 
				return res.json({ 
                    proc: false, 
                    msg: "¡Se produjo un error al crear el objeto 'kanban'!" 
				 });
			} 
			
			return res.json({ 
				proc: true, 
				msg: "¡Nuevo registro Kanban almacenado!", 
				kanban: result 
			});
		}).catch(function(err) { 
            sails.log("Se produjo un error en 'kanban/create: ", err); 
			return res.json({ 
				proc: false, 
				msg: "¡Se produjo un error en la conexión con la base de datos!" 
            }); 
        }); 
	},

	/**
	* @method :: getKanban (POST)
	* @description :: Busca los elementos del Kanban
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getKanban: function(req, res, next) { 
		
		// Con la función de Sails, de acuerdo a un 'id' de entrada, buscar el Kanban 
		// y hacer un populate a las tareas asociadas y los datos del proyecto
		Kanban.findOne(req.param('id')).populate('tareas').populate('project').exec(function(err, kanban) { 
			
			// Verificar si existe un error, actualizar la variable flash y se entrega json con formato
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ kanban: 'false' }); 
			}
			
			// Si no fue posible buscar el objeto, el GET retorna un mensaje de error segun formato
			if(!kanban) { 
				req.session.flash = { err: err }; 
				return res.json({ kanban: 'false' }); 
			} else { 
				
				// Si no hay error, la variable flash es nula y se retorna el objeto kanban
				req.session.flash = { }; 
				return res.json({ kanban: kanban });
			}
		});
	}
};