/**
 * ProjectController
 *
 * @description ::Logica del servidor para manejar Proyectos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

/**
* @method :: create (POST)
* @description :: Crea un nuevo proyecto
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
create: function(req,res,next){
Project.create(req.allParams(), function ProjectCreated(err,user){
	console.log("LLegue a crear");
	console.log(req.param('finish_date'));
	var data=req.allParams();
			if(err) {
				//req.session dura el tiempo de la sesion hasta que el browser cierra
				//Se actualiza la variable flash y se entrega json con formato
				req.session.flash = { err:err}
				return  res.json({project:'false'});
			}
			//si no hay error se deja vacio la variable flash y se retorna user como json
			req.session.flash={};
		
			return res.json({project:user});
		});

	},	
/**
* @method :: getDialogos (POST)
* @description :: Consigue el dialogo asociado al proyecto
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
getDialogos: function(req,res,next){
	//LLama a funcion en sails para buscar el proyecto de acuerdo a su id y hace un populate añadiendo el objeto dialogo
	Project.findOne(req.param('id')).populate('dialogos').exec(function(err,project){
		if(err) return res.json({project:'false'});//Si hay error retorna el error
		if(!project) res.json({project:'false'});//Si hay error retorna el error
		//retorna el dialogo del proyecto
		return res.json(project.dialogos[0]);
	});
},
/**
* @method :: getOne (POST)
* @description :: Consigue el json de proyecto mas los participantes, dialogos y kanban
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
getOne: function(req,res,next){
	//LLama a funcion en sails para buscar el proyecto de acuerdo a su id y hace un populate a elementos necesarios
	Project.findOne(req.param('id')).populate('participants').populate('dialogos').populate('kanban').exec(function(err,project){
		if(err) return res.json({project:'false'});//Si hay error retorna el error
		if(!project) res.json({project:'false'});//Si hay error retorna el error
		//en caos contrario de no haber error retorna el proyecto como json
		return res.json({project:project});
	});
	
},
/**
* @method :: edit (VIEW)
* @description :: retorna la vista edit
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
edit: function(req,res,next){
		//llama a Sails para vista de edicion del proyecto
		Project.findOne(req.param('id')).populate('participants').exec(function(err,project){
			if(err) return next(err); //si hay error el servidor se encarga de manejar el error
			if(!project) return next();//si no se encontro el proyecto el servidor se encarga de manejar el error
			return res.view({//retorna la vista con los valores del proyecto
				project:project
			});

		});
	},

/**
* @method :: editarproyecto (POST)
* @description :: Edita los valores del proyecto
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
editarproyecto: function(req,res,next){
	//LLama a funcion de sails para buscar un proyecto y llena con los participantes
		Project.findOne(req.param('id')).populate('participants').exec(function(err,project){
			if(err) return res.json({project:'false'});//si hay error
			if(!project) return res.json({project:'false'});//si no se encontro
			else{
				//si se encontro
				project.name= req.param('name'); //actualiza el nombre del proyecto
				project.finish_date = req.param('finish_date');//actualiza su fecha de termino
				project.save(function(err) {});//guarda en la base de datos los cambios
				return res.json({project:project});//retorna un json con los valores nuevos actualizados
			}
		});
	},

/**
* @method :: add_user (POST)
* @description :: Añade un usuario un proyecto
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	add_user: function(req,res,next){
		/*Nota:*/
		//No confundir, emails variable en un inicio solicitaba emails , pero realmente se piden los id (puede resultar raro pero son los id)

		var emails = req.param('email');//contiene lista de ids de los usuarios
		//se llama a la funcion de Sails para buscar el proyecto
		Project.findOne(req.param('id')).exec( function(err, project){
			if(err) return res.json({project:'false'});//si hay error
			if(!project) return res.json({project:'false'});//si no se encontro
			//para cada valor de ids de los usuarios (variable emails)
			for(var i=0; i<emails.length;i++ ){//por cada id añadelo al proyecto.
				project.participants.add(emails[i]); //se añade el usuario al proyecto
				project.save(function(err) {});//se guarda en la base de datos
			}
		});
		return res.redirect('/user/');
	},

};

