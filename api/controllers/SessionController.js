/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bcrypjs = require('bcryptjs');
module.exports = {
	
	'login':function(req,res){
		/*var olddate = new Date();
		var newdate = new Date(olddate.getTime()+60000);
		req.session.cookie.expires = newdate;
		req.session.authenticated = true;
		console.log(req.session);
		*/
		res.view('session/login');
	},
		create: function(req, res , next){

		if(!req.param('email') || !req.param('password')){
			var usernamepasswordrequired =[{name: 'usernamepasswordrequired', message: 'Debes ingresar contraseña y usuario'}] 
				req.session.flash={
			err: usernamepasswordrequired
		}
		res.redirect('/session/login');
		return;
		}

		User.findOneByEmail(req.param('email'),  function foundUser(err,user){
			if(err) return next(err);
			//if not user is found
			if(!user){
				var noaccounterror=[{name: 'noaccount', message: 'La dirección de correo '+req.param('email')+' No existe'}]
			req.session.flash={
				err:noaccounterror
			}
				res.redirect('/session/login');
				return;
			}
		
		//si no hay error compara el password con el guardado
		bcrypjs.compare(req.param('password'), user.password, function(err,valid){
			if(!valid){
				var errorcomp=[{name: 'errorcomp', message: 'password inválido'}]
				req.session.flash={
				err:errorcomp
			}
				res.redirect('/session/login');
				return;
			}
			//loguea al usuario
			req.session.authenticated=true;
			req.session.User= user;
			res.redirect('user/view/'+user.id);
		});

	});

	},
	logout: function(req,res,next){
			req.session.destroy();
			res.redirect('/');
	}


};

