/**
 * SessionController
 *
 * @description :: Logica del ladod del servidor para manejar las sesiones
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bcrypjs = require('bcryptjs');
module.exports = {
	
/**
* @method :: login (View)
* @description :: Se encarga de dar los permisos para mostrar vista de login
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
*/
	'login':function(req,res){
		//Para maejar el tiempo de sesión se puede utilizar el formato:
		/*var olddate = new Date();
		var newdate = new Date(olddate.getTime()+60000);
		req.session.cookie.expires = newdate;
		req.session.authenticated = true;
		*/
		res.view('session/login');
	},

	/**
* @method :: recover (View)
* @description :: Se encarga de dar los permisos para mostrar vista de recuperación de clave
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
*/
	'recover': function(req,res){
		res.view('session/recover');
	},

	/**
* @method :: help (View)
* @description :: Se encarga de dar los permisos para mostrar vista de ayuda
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor

*/
	'help': function(req,res){
		res.view('session/help');
	},

	/**
* @method :: forgotpassword (View)
* @description :: Se encarga de dar los permisos para mostrar vista de olvido de contraseña
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	'forgotpassword':function(req,res){
		res.view('session/forgotpassword');
	},
/**
* @method :: create 
* @description :: Se encarga de crear una sesion de usuario
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
		create: function(req, res , next){
		if(!req.param('email') || !req.param('password')){ //si los valores de email o contraseña son invalidos
			//se actualiza la variable falsh y se entrega el error
			var usernamepasswordrequired =[{name: 'usernamepasswordrequired', message: 'Debes ingresar contraseña y usuario'}] 
				req.session.flash={
			err: usernamepasswordrequired
		}
		//se redirige al usuario 
		res.redirect('/session/login');
		return;
		}
		//Se verifica si el correo existe
		User.findOneByEmail(req.param('email'),  function foundUser(err,user){
			if(err) return next(err); // SI hay error
			//Si el usuario no existe entonces
			if(!user){
				//se actualiza la variable flash y el error asociado
				var noaccounterror=[{name: 'noaccount', message: 'La dirección de correo '+req.param('email')+' No existe'}]
				req.session.flash={
				err:noaccounterror
			}
				//se redirige al usuario
				res.redirect('/session/login');
				return;
			}
		
		//si no hay error compara el password con el guardado
		bcrypjs.compare(req.param('password'), user.password, function(err,valid){
			if(!valid){//si el password es invalido actualiza el error y redirige al usuario
				var errorcomp=[{name: 'errorcomp', message: 'password inválido'}]
				req.session.flash={
				err:errorcomp
			}
				res.redirect('/session/login');
				return;
			}
			//si todo salio ok
			//loguea al usuario
			req.session.authenticated=true; //el valor de la variable global es verdadero
			req.session.User= user; //la variable globar guarda el valor del usuario
			res.redirect('user/view/'+user.id); //redirige a la vista principal
		});

	});

	},

	/**
* @method :: logout 
* @description :: Se encarga de terminar la sesion
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	logout: function(req,res,next){
			req.session.destroy();
			res.redirect('/');
	},
/**
* @method :: sendEmail (POST) 
* @description :: Se encarga de enviar un correo a traves del hook del email
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
*/
sendEmail: function(req,res){
		//se busca a traves de funcion de sails un usuario y su email
		User.findOneByEmail(req.param('email')).exec(function(err,user){
			if(err) {//si hay un error
				return res.json({opcion:'false'});}
			//si no existe el usuario
			if(!user){
				//se actualiza la variable flash para mostrar el error
				var noaccounterror=[{name: 'noaccount', message: 'La dirección de correo '+req.param('email')+' No existe'}]
				req.session.flash={
				err:noaccounterror

			}
			//retorno el json con el formato del error para manejar el error
			return res.json({opcion:'false'});
		}
		//si el usuario existe se envia el correo a traves de sails hook email (Ver api/services)
		
		Mailer.sendWelcomeMail(user);

			//retorno json con valor verdadero para demostrar que fue un exito y mandar mensaje por pantalla
			return res.json({opcion:'true'});
		});
		

	},
/**
* @method :: actualizarpass (POST)
* @description :: Actualiza una contraseña
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	'actualizarpass':function(req,res){
		
		var nuevo;// variable temporal para guardar el password encriptado
		require('bcryptjs').hash(req.param('password'),10, function passwordEncrypted(err,password){ 
    		if(err) return res.json({opcion:'false'});//si hay un error 
    		nuevo = password; //el password en nuevo ahora esta cifrado
    		//Actualiza usuario buscando por el id solicitado y dejando el password como nuevo
    		User.update({id:req.param('id')}, {password:nuevo}).exec(function userUpdatedPass(err){
			if(err){//si hay un error
				req.session.flash = { err:err}
				return res.json({opcion:'false'});
			}
			else{//si no hay error retorna json con valor string true
			return res.json({opcion:'true'});	
			}		
		});
  		});

	},
	/**
* @method :: verficar_clave (POST)
* @description :: Verifica si la clave entregada por correo es aceptada para poder cambiar el email
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
*/
	'verficar_clave':function(req,res){
		
		var my_query = User.findOne(req.param('clave')); //deacuerdo a la clave solicitada veo si corresponde al id de un usuario
		my_query.exec(function(err,user){
			if(err) {//si hay un error	
				res.json({opcion:'false'});
			}
			if(!user){//si el id de la clave es invalido
				return res.json({opcion:'false'})
			}
			else{
				//retorna verdadero, es decir la clave fue aceptada
				return res.json({opcion:'true'})
			}

		});
	},
};

