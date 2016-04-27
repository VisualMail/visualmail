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


};

