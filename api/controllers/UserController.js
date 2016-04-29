/**
* UserController
*
* @description :: Server-side logic for managing users
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

module.exports = {
	'signup': function (req,res){
		//res locals dura por el tiempo de la vista
	
		res.view();
		

	},


	view: function(req,res,next){


		User.findOne(req.param('id')).populate('projects').exec(function (err,user){

			if(err) return next(err);
			if(!user) return next();
			
	

			return res.view({user:user});
		});

	},



	create: function(req,res,next){
		User.create(req.allParams(), function userCreated(err,user){
			if(err) {
				//req.session dura el tiempo de la sesion hasta que el browser cierra
				req.session.flash = { err:err}
				console.log(err);
			return res.redirect('/user/signup');
			}
			//res.json(user);
			req.session.flash={};
			req.session.authenticated=true;
			req.session.User=user;
			res.redirect('/');
		});

	},	



		edit: function(req,res,next){
		User.findOne(req.param('id'), function foundUSer(err,user){
			if(err) return next(err);
			if(!user) return next();
			res.view({
				user:user
			});

		});
	},
	//la segunda es realizar el update
	update_data: function(req,res,next){
		console.log('asas');
		User.update({id:req.param('id')}, {firstname:req.param('firstname')},{lastname:req.param('lastname')},{initials:req.param('initials')},{imgurl:req.param('imgurl'),pmo:req.param('pmo')}).exec(function(err){
			if(err){
				req.session.flash = { err:err}
				return res.redirect('/user/edit/'+ req.param('id'));
			}
			res.redirect('user/view/'+req.param('id'));
		});
	},
		update: function(req,res,next){
		User.update({id:req.param('id')}, {password:req.param('password')}).exec(function userUpdatedPass(err){
			if(err){
				req.session.flash = { err:err}
				return res.redirect('/user/edit/'+ req.param('id'));
			}
			res.redirect('user/view/'+req.param('id'));
		});
	},

};

