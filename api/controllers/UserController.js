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


	getAllEmail: function(req,res){
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
						arr.push(_.pick(key,'id','email','firstname'));
				}
				
				i=i+1;
			});
			//console.log(arr);
			return res.json({arr:arr});
		});
	},

	/*
	myQuery.exec(function(err,user){
			if(err) return next(err);
			var arr=[];
			//console.log(user);
			var projectos_email=Project.findOne(req.param('id')).populate('participants');
			console.log("yes");
			projectos_email.exec(function(err,project){
				if(err) return next(err);
				console.log(project);
				console.log(user[0].email);
				var i=0;
				_.each(user,function(key,value){
					//
					if(user[i].email!=req.session.User.email){
					for(var j=0;j<project.participants.length;j++){
						if(user[i].email!=project.participants.email[j]){
							user[i].firstname=user[i].firstname+' '+user[i].lastname;
							arr.push(_.pick(key,'email','firstname'));
							
						}
					}
				i=i+1;
				}
		
					
			});//fin each


	*/
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
			if(!user){
				return res.json({opcion:'false'});
			}
			else{
			return res.json({opcion:'true'});	
			}
			
		});



  		});
		
		//buscar usuario y updatearlo
	},






};

