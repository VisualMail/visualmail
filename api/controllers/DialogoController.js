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

	buscar: function(req,res,next){
		console.log('estoy cambiando');
		var query= Dialogo.findOne('5755d8a06f9032531c1b68cc').exec( function(err, dialog){
			//console.log(dialog);
			if(err){
				console.log(err);
			}
			if(!dialog){
				console.log('no encontrado id');
			}
			else{
				function busco(dialog,position,contador){
					
					if(contador==position.length){
						console.log('entre solo al final');
						var jsonstring = {'name':'hola:dentro de la recursion'+dialog.children.length,'root':false,'children':[]}
						dialog.children[0]=jsonstring;
						
						//console.log(dialog.children[1]);
						return;
					}
					else{
						console.log('dialogo es:'+dialog.children[position[contador]].name);
						busco(dialog.children[position[contador]],position,contador+1);
					}
				}
				//si esta vacio el nodo
				//var jsonstring = {'name':'hola:ultima '+dialog.children.length,'root':false,'children':[]}
				//console.log('el tamano es:'+dialog.children.length);
					var contador=0;
					var position = [1,1,0];
					busco(dialog,position,contador);
					console.log(dialog.children[1].children[1].children[0]);
					//var puntero =dialog;
					console.log(dialog.children[1].children[1].children[0].children[0]);
					//console.log('ahorafor');
				
					//otra forma

				//dialog.children[1].children[1].children[0]=jsonstring;

				dialog.save(function(err) {});	
				return res.redirect('/dialogo/');
				
		
			}

	
		});
	},

};

