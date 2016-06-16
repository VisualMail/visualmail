/**
 * KanbanController
 *
 * @description :: Server-side logic for managing kanbans
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function(req,res,next){
		Kanban.create(req.allParams(), function tableroCreated(err,kanban){
			if(err) {
				
				req.session.flash = { err:err}
				console.log(err);
				return res.json({kanban:'false'});
			}
			if(!kanban)
				return res.json({kanban:'false'});
			else{
				console.log('creado'+kanban.id);
				req.session.flash={};
				return res.json({kanban:kanban});

			}
		

		});

	},
	getKanban: function(req,res,next){
		Kanban.findOne(req.param('id')).populate('tareas').populate('project').exec( function(err, kanban){
			if(err){
				return res.json({kanban:'false'});
			}
			if(!kanban){
				return res.json({kanban:'false'});
			}
			else{
				req.session.flash={};
				return res.json({kanban:kanban});
			}


		});
	}
};

