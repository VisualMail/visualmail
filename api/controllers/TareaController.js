/**
 * TareaController
 *
 * @description :: Server-side logic for managing tareas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function(req,res,next){
		Tarea.create(req.allParams(), function tareaCreated(err,tarea){
			if(err) {
				req.session.flash = { err:err}
				console.log(err);
				return res.json({tarea:'false'});
			}
			if(!tarea)
				return res.json({tarea:'false'});
		
			req.session.flash={};
			return res.json({tarea:tarea});
		});

	},
	updateTipo: function(req,res,next){
		Tarea.findOne(req.param('id')).exec( function(err, tarea){
			if(err){
				req.session.flash = { err:err}
				return res.json({tarea:'false'});
			}
			if(!tarea){
				return res.json({tarea:'false'});
			}
			else{
				tarea.tipo = req.param('nuevotipo');
				tarea.save(function(err) {});
				return res.json({tarea:tarea});
			}
		
		});
	},


	getTareas: function(req,res,next){
			Tarea.find({project_id:req.param('id')}).populate('usuario').populate('mensaje').exec( function(err, tarea){
			if(err){
				req.session.flash = { err:err}
				return res.json({tarea:'false'});
			}
			if(!tarea){
				return res.json({tarea:'false'});
			}
			else{
				return res.json({tarea:tarea});
			}
		
		});
	}
};

