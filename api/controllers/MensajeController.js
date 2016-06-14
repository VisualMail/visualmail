/**
 * MensajeController
 *
 * @description :: Server-side logic for managing mensajes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
		//crea un dialogo inicial
	create: function(req,res,next){
		Mensaje.create(req.allParams(), function mensajeCreated(err,mensaje){
			if(err) {
				
				req.session.flash = { err:err}
				console.log(err);
				return res.json({mensaje:'false'});
			}
			if(!mensaje)
				return res.json({mensaje:'false'});
		
			req.session.flash={};
			return res.json({mensaje:mensaje});
		});

	},
	//GET para encontrar todos los mensajes del proyecto

	getMessages: function(req,res,next){
		console.log('here');
		Mensaje.find({project_id:req.param('id')}).populate('usuario').exec( function(err, mensaje){
			if(err){

			}
			if(!mensaje){

			}
			else{
				req.session.flash={};
				console.log('encontrado');
				return res.json({mensaje:mensaje});
			}


		});

	}


};

