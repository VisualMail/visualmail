/**
 * ProjectController
 *
 * @description :: Server-side logic for managing projects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	
create: function(req,res,next){
Project.create(req.allParams(), function ProjectCreated(err,user){
	var data=req.allParams();
			if(err) {
				//req.session dura el tiempo de la sesion hasta que el browser cierra
				req.session.flash = { err:err}
				console.log(err);
				return  res.json({project:'false'});
			}
			
			req.session.flash={};
		
			return res.json({project:user});
		});

	},	
getDialogos: function(req,res,next){
	Project.findOne(req.param('id')).populate('dialogos').exec(function(err,project){
		if(err) return next(err);
		if(!project) return next();
		//console.log(project);
		return res.json(project.dialogos[0]);
	});
},

getOne: function(req,res,next){
	Project.findOne(req.param('id')).populate('participants').populate('dialogos').populate('kanban').exec(function(err,project){
		if(err) return next(err);
		if(!project) return next();
		//console.log(project);
		return res.json({project:project});
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
		//console.log('hola mundo');
		//console.log(req.param('id'));
		//console.log(req.param('email'));
		//NO confundir, emails variable en un inicio solicitaba emails , pero realmente se piden los id
		var emails = req.param('email');
		
		Project.findOne(req.param('id')).exec( function(err, project){
			//console.log(project);
			for(var i=0; i<emails.length;i++ ){//por cada id añadelo al proyecto.
			project.participants.add(emails[i]);
			project.save(function(err) {});
		}
		});

		return res.redirect('/user/');
	},

};

