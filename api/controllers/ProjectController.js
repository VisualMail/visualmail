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
			req.session.flash={};
			res.redirect('user/view/'+req.session.User.id);
		});

	},	



edit: function(req,res,next){
		Project.findOne(req.param('id')).populate('participants').exec(function(err,project){
			if(err) return next(err);
			if(!project) return next();
			return res.view({
				project:project
			});

		});
	},
	//la segunda es realizar el update
	add_user: function(req,res,next){
		console.log('hola mundo');
		//console.log(req.param('id'));
		//console.log(req.param('email'));
		var emails = req.param('email');
		
		Project.findOne(req.param('id')).exec( function(err, project){
			//console.log(project);
			for(var i=0; i<emails.length;i++ ){
			project.participants.add(emails[i]);
			project.save(function(err) {});
		}
		});

		return res.redirect('/user/');
		/*
		var user_id_found;
		var flag= false;
		//console.log(req.param('email'));
		User.findOneByEmail(req.param('email'), function foundUser(err,user){
			if(err){
				req.session.flash = { err:err}
				return next(err);
			} 
			if(!user){
				//console.log('usuario aqui no existe');


		var userdontexist =[{name: 'userdontexist', message: 'El usuario no existe'}] 
				req.session.flash={
			err: userdontexist
		}
				 res.redirect('/project/edit/'+req.param('project_id'));
				 return;
			}
			else{
			console.log(user.email);
			user_id_found = user.id;
			flag=true;
			}
			

		});
		
		if(flag==true){
			console.log('no debio llegar aca');
			Project.findOne(req.param('id')).exec( function(err, project){
			//console.log(req.param('id'));
			//console.log('hola: '+user_id_found);
			if(err){
				return next(err);
			}
			project.participants.add(user_id_found);
			project.save(function(err) {});
			req.session.flash={};
			res.redirect('user/view/'+req.param('user_id'));

		});
		}

		*/
	},

};

