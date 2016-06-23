/**
 * DialogoController
 *
 * @description :: Server-side logic for managing dialogoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	//crea un dialogo inicial
	create: function(req,res,next){
		
		Dialogo.create(req.allParams(), function dialogoCreated(err,dialogo){
			if(err) {
				
				req.session.flash = { err:err}
				console.log(err);
				return res.json({dialogo:'false'});
			}
			if(!dialogo)
				return res.json({dialogo:'false'});
		
			req.session.flash={};
			return res.json({dialogo:dialogo});
		});

	},

	add_dialogo: function(req,res,next){
		//el id que quiero añadir		
		console.log('llegue aqui');
		id_nuevo=req.param('id_nuevo');
		
		Dialogo.findOne(req.param('id_dialogo')).populate('children').exec( function(err, dialog){
			//console.log(project);
			if(err){
				console.log(err);
			}
			if(!dialog){
				console.log('no encontrado id');
			}
			else{
				dialog.children.add(id_nuevo);
				dialog.save(function(err) {});	
			}

		});

		return res.redirect('/dialogo/');
	},
	//luego de que se crea el mensaje se debe agregar el dialogo
	update_dialogo: function(req,res,next){
		console.log('estoy cambiando');
		console.log(req.param('id'));
		var mensaje =req.param('mensaje');
		mensaje["children"]=[];
		delete mensaje.project_id;
		delete mensaje.dialogos;
		console.log(mensaje);
		Dialogo.findOne(req.param('id')).exec( function(err, dialog){
			console.log(dialog);
			if(err){
				console.log(err);
			}
			if(!dialog){
				console.log('no encontrado id');
			}
			else{
				console.log('pillado');
				function busco(dialog,position,contador,largo){
					console.log('ejecutando');
					//console.log('largo es'+largo);
					console.log('largo es'+contador);
					if(contador==largo){
						console.log('imprimiendo'+dialog.children[position[contador]]);
						console.log('imprimiendo2: '+dialog.children.length);
						dialog.children[dialog.children.length]=mensaje;
						
						//console.log(dialog.children[dialog.children.length-1]);
						return;
					}
					else{
						console.log('ejecute esto');
						console.log('dialogo es:'+dialog.children[position[contador]].name);
						busco(dialog.children[position[contador]],position,contador+1,largo);
					}
				}
				//si esta vacio el nodo
				//var jsonstring = {'name':'hola:ultima '+dialog.children.length,'root':false,'children':[]}
				//console.log('el tamano es:'+dialog.children.length);
					console.log('ejecute esto otro'+mensaje.position.length);
					var contador=1;
					var position = mensaje.position;
					var largo =mensaje.position.length-1;
					console.log('largo es'+largo);
					busco(dialog,position,contador,largo);
					//console.log(dialog.children[1].children[1].children[0]);
					//var puntero =dialog;
					//console.log(dialog.children[1].children[1].children[0].children[0]);
					//console.log('ahorafor');
				
					//otra forma

				//dialog.children[1].children[1].children[0]=jsonstring;

				dialog.save(function(err) {});	
				return res.json({dialog:dialog});
				
		
			}

	
		});
	},
	getMessages: function(req,res,next){
		console.log('here');
		Dialogo.findOne(req.param('id')).populate('mensajes').exec( function(err, dialogo){
			if(err){

			}
			if(!dialogo){

			}
			else{
				req.session.flash={};
				console.log('encontrado');
				return res.json({dialogo:dialogo});
			}


		});

	}

};

