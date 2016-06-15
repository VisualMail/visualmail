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
		
			req.session.flash={};
			return res.json({kanban:kanban});
		});

	},
};

