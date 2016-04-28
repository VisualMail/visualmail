/**
 * ProjectController
 *
 * @description :: Server-side logic for managing projects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
edit: function(req,res,next){
		Project.findOne(req.param('id'), function foundProject(err,project){
			if(err) return next(err);
			if(!project) return next();
			return res.view({
				project:project
			});

		});
	},
	//la segunda es realizar el update
	add_user: function(req,res,next){
	

		Project.findOne(req.param('id')).exec( function(err, project){
			console.log(req.param('id'));
			console.log(req.param('participants'));
			if(err){
				return next(err);
			}
			project.participants.add(req.param('participants'));
			project.save(function(err) {});
			res.redirect('user/view/'+req.param('user_id'));

		});
	},
};

