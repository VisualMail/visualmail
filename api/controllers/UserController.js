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
	getAllProjects: function(req,res){
		User.findOne(req.param('id')).populate('projects').exec(function (err,user){
			if(err)  return res.json({opcion:'false'});
			if(!user)  return res.json({opcion:'false'});
			return res.json({user:user});
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
			res.redirect('/user/view/'+user.id);
		});

	},	



	edit: function(req,res,next){
		User.findOne(req.param('id')).populate('projects').exec(function (err,user){
			if(err) return next(err);
			if(!user) return next();
			return res.view();
		});
	},


	getAllEmail: function(req,res,next){
		var myQuery= User.find();
		var sortString='email ASC';
		myQuery.sort('email ASC');
		myQuery.exec(function(err,user){
			if(err) return next(err);
			var arr=[];
			//console.log(user);
			var i=0;
			_.each(user,function(key,value){
				if(user[i].email!=req.session.User.email){
						user[i].firstname=user[i].firstname+' '+user[i].lastname;
						arr.push(_.pick(key,'id','email','firstname','rut','imgurl','pmo'));
				}
				
				i=i+1;
			});
			//console.log(arr);
			return res.json({arr:arr});
		});
	},

	findOneUser: function(req,res,next){
		User.findOne(req.param('id')).populate('projects').exec(function (err,user){
			if(err) return res.json({user:'false'});
			if(!user) return res.json({user:'false'});
			else{
				delete user.password;
				return res.json({user:user});
			}
			
		});


	},
	findUserOnly: function(req,res,next){
		User.findOne(req.param('id')).exec(function (err,user){
			if(err) return res.json({user:'false'});
			if(!user) return res.json({user:'false'});
			else{
				delete user.password;
				return res.json({user:user});
			}
			
		});


	},
	actualizardatos: function(req,res,next){
		var nombre=req.param('firstname');
		var apellido=req.param('lastname');
		var imagenurl=req.param('imgurl');
		var iniciales=req.param('initials');
		var id= req.param('id');
		var object ={};
		var count=0;
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
		jsonObj = [];
		jsonObj.push(object);
		
		if(count>=1){
			
			User.update({id:req.param('id')},jsonObj[0]).exec(function userupdate(err){
		
			if(err){
				
				req.session.flash={};
				return res.json({opcion:'false'});
				
			}
			else{
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
				req.session.flash = { err:'Se han actualizado los cambios'};
				return res.json({opcion:'true'});
				
			}
			
		});
			
		}
		else{
				req.session.flash={};
			return res.json({opcion:'false'});
		
		}	
	},


};

