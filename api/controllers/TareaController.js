/**
 * TareaController
 *
 * @description :: Logica del lado del servidor para manejar las tareas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
/**
* @method :: create (POST)
* @description :: Crea una nueva tarea
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	create: function(req,res,next){
		//Con todos los parametros crea una nueva tarea
		Tarea.create(req.allParams(), function tareaCreated(err,tarea){
			if(err) {//Si hay error, se actualiza la variable flash y se entrega json
				req.session.flash = { err:err}
				return res.json({tarea:'false'});
			}
			if(!tarea)//si existe otro tipo de error
				return res.json({tarea:'false'});
			//en caso de no haber error, se reinicializa la variable flash y se crea el objeto, retornando un post con la tarea
			req.session.flash={};
			return res.json({tarea:tarea});
		});

	},
/**
* @method :: updateTipo (POST)
* @description :: Le da un nuevo tipo a una tarea del Kanban, ejemplo , de new a doing
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	updateTipo: function(req,res,next){
		//encuentra una tarea por el ID
		Tarea.findOne(req.param('id')).exec( function(err, tarea){
			if(err){//si hay un error
				req.session.flash = { err:err}
				return res.json({tarea:'false'});
			}
			if(!tarea){//si no existe la tarea (id)
				return res.json({tarea:'false'});
			}
			else{//en caso de existir
				tarea.tipo = req.param('nuevotipo'); //se pide como entrada del metodo nuevotipo y se le da el nuevo tipo a la tarea
				tarea.save(function(err) {});//se modifica el valor
				return res.json({tarea:tarea}); //se retorna el json con el nuevo estado de la tarea
			}
		
		});
	},

/**
* @method :: getTareas (GET)
* @description :: Busca todas las tareas
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	getTareas: function(req,res,next){
			//De acuerdo al id de un poryecto se buscan todas las tareas asociadas a ese proyecto y se hace un populate para ver el mensaje asociado y el usuario
			Tarea.find({project_id:req.param('id')}).populate('usuario').populate('mensaje').exec( function(err, tarea){
			if(err){ // si hay un error de cualquier tipo
				req.session.flash = { err:err}
				return res.json({tarea:'false'});
			}
			if(!tarea){//si no se encontraron tareas
				return res.json({tarea:'false'});
			}
			else{//en caso de no existir error se devuelve el json con la lista de tareas
				return res.json({tarea:tarea});
			}
		
		});
	}
};

