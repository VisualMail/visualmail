/**
 * MensajeController
 *
 * @description :: Logica del servidor para manejar mensajes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
/**
* @method :: create (POST)
* @description :: Crea un nuevo mensaje
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	create: function(req,res,next){
		Mensaje.create(req.allParams(), function mensajeCreated(err,mensaje){
			if(err) {//si hay un error retorna json con formato error
				req.session.flash = { err:err}
				return res.json({mensaje:'false'});
			}
			if(!mensaje){ //si el objeto no se pudo crear retorna json con formato de manejo de error
				req.session.flash = { err:err}
				return res.json({mensaje:'false'});
			}
			//se deja la variable flash como vacia ya que no hay error y se retorna el mensaje creado
			req.session.flash={};
			return res.json({mensaje:mensaje});
		});

	},
/**
* @method :: getMessages (POST)
* @description :: Obtiene la lista de mensajes asociados a un proyecto
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	getMessages: function(req,res,next){
		//Llama a funcion de Sails para encontrar todos los mensajes segun la id del proyecto mas los usuarios asociados al mensaje
		Mensaje.find({project_id:req.param('id')}).populate('usuario').exec( function(err, mensaje){
			if(err){ //si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
				req.session.flash = { err:err}
				return res.json({mensaje:'false'});
			}
			if(!mensaje){//si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
				req.session.flash = { err:err}
				return res.json({mensaje:'false'});
			}
			else{//si no hay error
				req.session.flash={};
				//se deja la variable flash como vacia ya que no hay error y se retornan los mensajes
				return res.json({mensaje:mensaje});
			}
		});

	},
/**
* @method :: unir (POST)
* @description :: Hace la unión entre mensajes en la parte de lños modelos
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	unir: function(req,res,next){
		//estoy uniendo
		
		Mensaje.findOne(req.param('id')).populate('children').exec( function(err, mensaje){
			if(err){//si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
				req.session.flash = { err:err}
				return res.json({mensaje:'false'});
			}//si hay error se actualiza la variable flash y se entrega el json con formato de manejo del error
			if(!mensaje){
				req.session.flash = { err:err} 
				return res.json({mensaje:'false'});
			}
			else{//si no hay error
				req.session.flash={};
				//se deja la variable flash como vacia ya que no hay error y se retornan los mensajes
				//se añade el mensaje a children de mensaje
				mensaje.children.add(req.param('idunion'));	
				mensaje.numero_hijos = mensaje.numero_hijos+1; //se actualiza el numero de hijos 
				//se guarda en la base de datos
				mensaje.save(function(err) {});
				return res.json({mensaje:mensaje});
			}


		});
	},


};

