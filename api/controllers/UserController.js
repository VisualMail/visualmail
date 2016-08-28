/**
* UserController
*
* @description :: Logica del servidor para manejar a los usuarios
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

module.exports = {
/**
* @method :: signup (VIEW)
* @description :: Controla la vista de signup
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	'signup': function (req,res){
		//res locals dura por el tiempo de la vista
	
		res.view();
	},

/**
* @method :: view (VIEW)
* @description :: Controla la vista principal de usuarios al ingresar luego del login
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	view: function(req,res,next){
		//Busca un usuario por su id y pobla los proyectos asociados
		User.findOne(req.param('id')).populate('projects').exec(function (err,user){
			if(err) return next(err);//si hay error
			if(!user) return next();//si el usuario no existe
			else{//en caso de existir el usuario
				delete user.password;//se elimina el objeto password del json resultante
				return res.view({user:user});//se retorna la vista y el json del usuario
			}
			
		});

	},
/**
* @method :: getAllProjects (GET)
* @description :: Encuentra todos los proyectos de un usario
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	getAllProjects: function(req,res){
		//Encuentra un usuario por el id y pobla los proyectos
		User.findOne(req.param('id')).populate('projects').exec(function (err,user){
			if(err)  return res.json({opcion:'false'});
			if(!user)  return res.json({opcion:'false'});
			else{//En caso de no haber error
				delete user.password;//se elimina el objeto password del json resultante
				return res.json({user:user});//retorna el json con los datos del usuario y los proyectos asociados
			}
		});
	},

/**
* @method :: create (POST)
* @description :: Crea un usuario
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	create: function(req,res,next){
		//Crea un usuario dado los parametros de entrada
		User.create(req.allParams(), function userCreated(err,user){
			if(err) {//si hay error
				//req.session dura el tiempo de la sesion hasta que el browser cierra
				req.session.flash = { err:err}
				//se redirige al usuario a la vista de signup
			return res.redirect('/user/signup');
			}
			//en caos de no haber error, se reinicializa la variable flash
			req.session.flash={};
			req.session.authenticated=true;//se deja el usuario como autenticado
			req.session.User=user; //se guarda la variable User con los datos de usuario (global)
			res.redirect('/user/view/'+user.id);//se redirige al usuario a la vista view
		});

	},	


	/**
	* @method :: edit (VIEW)
	* @description :: Muestra la vista view
	* @param :: {Object} req, request element de sails
	* @param  :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	edit: function(req,res,next){
		User.findOne(req.param('id')).populate('projects').exec(function (err,user){
			if(err) return next(err); //si hay error
			if(!user) return next();//si el usuario no se encontro
			else{//si existe el usuario
				return res.view(user);//se redirige a la vista user/edit
			}
			
		});
	},

	/**
	* @method :: getAllEmail (GET)
	* @description :: Obtiene la lista de correos de los usuarios , se utiliza para la API selectize para invitar usuarios a un proyecto 
	* @param :: {Object} req, request element de sails
	* @param  :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	getAllEmail: function(req,res,next){

		var myQuery= User.find();//realiza la query 
		var sortString='email ASC'; 
		myQuery.sort('email ASC');//reordena la lsita en orden ascendientes
		myQuery.exec(function(err,user){//ejecuta la query
			if(err) return next(err);//si hay error
			//en caso de no haber error
			var arr=[]; //se crea un arreglo que guardara los datos de usuario
			
			var i=0;
			_.each(user,function(key,value){//por cada usuario 
				if(user[i].email!=req.session.User.email){//si el usuario es distinto del usuario que inicio sesion
						user[i].firstname=user[i].firstname+' '+user[i].lastname;//se guarda su nombre y apellido (sobreescribe)
						arr.push(_.pick(key,'id','email','firstname','rut','imgurl','pmo'));//se guardan los datos en el arreglo
				}
				
				i=i+1;
			});
			//se retorna el json con el arreglo
			return res.json({arr:arr});
		});
	},
	/**
	* @method :: findOneUser (GET)
	* @description :: Busca un usuario por id y retorna el usuario y sus proyectos
	* @param :: {Object} req, request element de sails
	* @param  :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	findOneUser: function(req,res,next){
		//ejecuta funcion de Sails para buscar un usuario y pobla con sus proyectos
		User.findOne(req.param('id')).populate('projects').exec(function (err,user){
			if(err) return res.json({user:'false'});//si hay error
			if(!user) return res.json({user:'false'});//si no existe el usuario 
			else{//en caso de no haber error
				delete user.password;//se elimina el pass
				return res.json({user:user});//se retorna el json
			}
			
		});


	},
	/**
	* @method :: findUserOnly (GET)
	* @description :: Busca un usuario por id pero no pobla con sus proyectos
	* @param :: {Object} req, request element de sails
	* @param  :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	findUserOnly: function(req,res,next){
		//ejecuta funcion de Sails para buscar un usuario por id
		User.findOne(req.param('id')).exec(function (err,user){

			if(err) return res.json({user:'false'});
			if(!user) return res.json({user:'false'});
			else{//en caso de no haber error
				delete user.password;
				return res.json({user:user});
			}
			
		});


	},
	/**
	* @method :: actualizardatos (POST)
	* @description :: Edita los datos de un usuario de forma asincrona y sin problemas de concurrencia
	* @param :: {Object} req, request element de sails
	* @param  :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	*/
	actualizardatos: function(req,res,next){
		//Se guardan en variables temporales los vales de cambio
		var nombre=req.param('firstname'); 
		var apellido=req.param('lastname');
		var imagenurl=req.param('imgurl');
		var iniciales=req.param('initials');
		var id= req.param('id');
		var object ={};//se inicializa un nuevo objeto
		var count=0;
		//por cada elemento a cambiar, se revisa si esta vacio o no y se guarda en object, además se aumenta el contador
		if(nombre!=''){
			object["firstname"]	=nombre;
			count++;
		}
		if(apellido!=''){
			object["lastname"]=apellido;
			count++;
		}
		if(imagenurl!=''){
			object["imgurl"]=imagenurl;
			count++;
		}
		if(iniciales!=''){
			object["initials"]=iniciales;
			count++;
		}
		//se crea el objeto array
		jsonObj = [];
		jsonObj.push(object);//object queda en formato json
		
		if(count>=1){//si hubo un cambio
			//el usuario se updatea de acuerdo al id y se entrega como entrada la variable jsonObj
			User.update({id:req.param('id')},jsonObj[0]).exec(function userupdate(err){
		
			if(err){//si hay error
				req.session.flash={};
				return res.json({opcion:'false'});
			}
			else{//si no hay error
				req.session.flash={};
				//Se actualizan los valores de la variable de sesion User, si algun parametro es distinto de nulo
				if(nombre!=''){
					req.session.User.firstname=nombre;
				}
				if(apellido!=''){
					req.session.User.lastname=apellido;
				}
				if(imagenurl!=''){
					req.session.User.imgurl=imagenurl;
				}
				if(iniciales!=''){
					req.session.User.initials=iniciales;
				}
				//se actualiza el mensaje del servidor y se retorna un json con valor de operacion correcta
				req.session.flash = { err:'Se han actualizado los cambios'};
				return res.json({opcion:'true'});
				
			}
			
		});
			
		}
		else{//en caso contrario
			//se retorna que no hubieron cambios
			req.session.flash={};
			return res.json({opcion:'false'});
		
		}	
	},


};

