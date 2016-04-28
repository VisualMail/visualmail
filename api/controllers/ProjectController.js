/**
 * ProjectController
 *
 * @description :: Server-side logic for managing projects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

create: function(req,res,next){
Project.create(req.allParams(), function ProjectCreated(err,user){
			if(err) {
				//req.session dura el tiempo de la sesion hasta que el browser cierra
				req.session.flash = { err:err}
				console.log(err);
			return res.redirect('/user/signup');
			}
			
			res.redirect('user/view/');
		});

	},	



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
		var user_id_found;
		User.findOneByEmail(req.param('email')).exec( function(err,user){
			if(err) return next(err);
			console.log(user.email);
			user_id_found = user.id;

		});

		Project.findOne(req.param('id')).exec( function(err, project){
			console.log(req.param('id'));
			console.log('hola: '+user_id_found);
			if(err){
				return next(err);
			}
			project.participants.add(user_id_found);
			project.save(function(err) {});
			res.redirect('user/view/'+req.param('user_id'));

		});
		
	},
};

