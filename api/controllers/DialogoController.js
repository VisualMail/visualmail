/**
 * DialogoController
 *
 * @description :: Server-side logic for managing dialogoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	//crea un dialogo inicial
	create: function(req,res,next){
		
		Dialogo.create(req.allParams(), function dialogoCreated(err,dialogo){
			if(err) {
				
				req.session.flash = { err:err}
				console.log(err);
				return res.json({dialogo:'false'});
			}
			if(!dialogo)
				return res.json({dialogo:'false'});
		
			req.session.flash={};
			return res.json({dialogo:dialogo});
		});

	},

	add_dialogo: function(req,res,next){
		//el id que quiero añadir		
		console.log('llegue aqui');
		id_nuevo=req.param('id_nuevo');
		
		Dialogo.findOne(req.param('id_dialogo')).exec( function(err, dialog){
			//console.log(project);
			if(err){
				console.log(err);
			}
			if(!dialog){
				console.log('no encontrado id');
			}
			else{
				dialog.child.add(id_nuevo);
				dialog.save(function(err) {});	
			}

		});

		return res.redirect('/dialogo/');
	},



};

