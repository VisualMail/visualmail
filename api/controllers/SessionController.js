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
	'recover': function(req,res){
		res.view('session/recover');
	},

	'forgotpassword':function(req,res){
		/*var olddate = new Date();
		var newdate = new Date(olddate.getTime()+60000);
		req.session.cookie.expires = newdate;
		req.session.authenticated = true;
		console.log(req.session);
		*/
		res.view('session/forgotpassword');
	},
	//Crea una session
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
	},

sendEmail: function(req,res){
		console.log(req.param('email'));
		console.log('empezando');
		User.findOneByEmail(req.param('email')).exec(function(err,user){
			if(err) {
				console.log('error1');
				return res.json({opcion:'false'});}
			//if not user is found
			if(!user){
				console.log('error2');
				var noaccounterror=[{name: 'noaccount', message: 'La dirección de correo '+req.param('email')+' No existe'}]
				req.session.flash={
				err:noaccounterror

			}
			return res.json({opcion:'false'});
		}
		//si el usuario existe se envia el correo
		console.log('enviando');
		sails.hooks.email.send(
		  "welcomeEmail",
		  {
		    recibe: user.firstname,
		    envia: "Visual Mail",
		    direccion_envia: "noreply.visualmail@gmail.com",
		    clave: user.id,
		  },
		  {
		    from: "VisualMail <noreply.visualmail@gmail.com>",
		    to: req.param('email'),
		    subject: "Recuperar Contraseña"
		  },
		  function(err) {console.log(err || "Email is sent");}
		)	


			return res.json({opcion:'true'});
		});
		

	},

	'actualizarpass':function(req,res){
		console.log(req.param('password'));
		var nuevo;
		require('bcryptjs').hash(req.param('password'),10, function passwordEncrypted(err,password){ 
    		if(err) return res.json({opcion:'false'});
    		nuevo = password;
    		console.log(nuevo);
    		User.update({id:req.param('id')}, {password:nuevo}).exec(function userUpdatedPass(err){
			if(err){
				req.session.flash = { err:err}
				return res.json({opcion:'false'});
			}
			else{
			return res.json({opcion:'true'});	
			}
			
		});



  		});
		
		//buscar usuario y updatearlo
	},
	'verficar_clave':function(req,res){
		console.log(req.param('clave'));
		var my_query = User.findOne(req.param('clave'));
		my_query.exec(function(err,user){
			if(err) {
				console.log("clave no aceptada");
				res.json({opcion:'false'});
			}
			//if not user is found
			if(!user){
				
				
				
			//console.log("clave no aceptada");
			return res.json({opcion:'false'})
			//return next(err);
		}
		else{
			//console.log("clave aceptada");
			return res.json({opcion:'true'})
		}
			

		});
	},
};

