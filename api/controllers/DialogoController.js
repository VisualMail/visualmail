/**
 * DialogoController
 *
 * @description :: Logica desde el lado del servidor para manejar los dialogos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
/**
* @method :: create (POST)
* @description :: Crea un nuevo elemento dialogo
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	create: function(req,res,next){
		
		Dialogo.create(req.allParams(), function dialogoCreated(err,dialogo){ //en caso de tener todos los parametros solicitados de acuerdo al modelo
			if(err) { // si hay un error
				req.session.flash = { err:err} //actualiza la variable de sesion flash y le da el valor del error 
				return res.json({dialogo:'false'});// retorna un json con el valor dialogo falso
			}
			if(!dialogo) //si no es un objeto dialogo
				return res.json({dialogo:'false'}); //retorna un error y el json con la configuracion
			//en caso de no haber error
			req.session.flash={}; //la variable flash de sesion s eactualiza
			return res.json({dialogo:dialogo}); //se crea el valor y se retorna un json para el metodo POST
		});

	},

/**
* @method :: update_dialogo (POST)
* @description :: Crea un nuevo elemento dialogo
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	update_dialogo: function(req,res,next){
		var mensaje =req.param('mensaje'); //valor requerido de entrada (Objeto JSON del modelo mensaje)
		mensaje["children"]=[]; //se inicializa el valor del parametro children que contiene el subconjunto de mensajes
		//se borran los elementos  innecesarios del JSON mensaje
		delete mensaje.project_id; 
		delete mensaje.dialogos;
		
		/*Funcion de Sails para buscar un dialogo dado el id del dialogo ( Al momento de crear un proyecto automaticamente se crea este valor
		por lo que al cargar el proyecto este valor ya se tiene y se pide como valor requerido)*/
		Dialogo.findOne(req.param('id')).exec( function(err, dialog){
			//condicionales para errores (tipico en sails)
			if(err){ //si existe un error
				console.log(err);
			} 
			if(!dialog){ //si no se encontró
				console.log('no encontrado id');
			}
			else{ //en caso de no haber error entonces se updatea el dialogo
				dialog.orden_message.push(mensaje.id);
				/* BLOQUE DE DEFINICION DE ELEMENTOS PARA MANEJAR LA SESION DE UN DIALOGO */
				dialog.ultimo_session_email=mensaje.usuario.email; //del json mensaje obtiene el email de quien realizo el mensaje a updatear (se crea nuevo elemento del json dialog)
				var session = dialog.session; //variable que obtiene el ultimo valor de sesion
				var sessionactual = dialog.session_actual; //variable que obtiene el valor de la sesion actual 
				var ultimoemailsession=dialog.ultimo_session_email;
				var parenultimorespondido =dialog.parent_ultimo_respondido;
				/*Nota: Este algoritmo de sesión no fue probado en su totalidad ya que no fue implementado solo está la idea, puede contener bugs*/
				/* FIN BLOQUE */


				//Se crea una función para buscar un elemento del dialogo para poder updatearlo (Recursiva)
				/**
				* @method :: busco 
				* @description :: Busca recursivamente en el JSON dialog de acuerdo a los valores que hay en position, al encontrarlo actualiza el dialogo 
				* @param :: {Object} dialog, se le pasa el JSON dialog, y luego va iterando con dialog.children (con los hijos del dialogo inicial)
				* @param  :: {Object} position, tiene la posicion donde va a ser guardado el elemento nuevo mensaje en dialogo
				* @param :: {Object} contador, contiene un contador que va aumentando hasta llegar al ultimo valor guardado del array position
				* @param :: {Object} largo, contiene el numero de elementos de position
				*/
				function busco(dialog,position,contador,largo){

					if(contador==largo){ //si el contador que se va aumentando es igual al largo de los valores guardados en position
						mensaje["idmensaje"]=mensaje.id;
						delete mensaje.id;
						/* BLOQUE DEL ALGORITMO DE SESION*/
						if(dialog.session==0){ //Si es la primera vez que se ha realizado un dialogo
							mensaje['session']= 1; //la sesion inicial es uno
							sessionactual=1; //se actualiza la sesion actual 
							ultimoemailsession=mensaje.usuario.email; //el ultimo email de sesion se actualiza
							parenultimorespondido=mensaje.parent; // guarda id del mensaje ultimo respondido
							//conoce el padre, entonces puede ver despues si fue el mismo el ultimo que realizo un mensaje y verifica si esta
							//en la misma columna (sesion mantenida) o se mueve a una diferente
						}
						else{//en caso de no ser la primera vez
							if(ultimoemailsession==mensaje.usuario.email){// Primero se revisa si el email del ultimo en iniciar sesion es igual a quien esta realizando el mensaje
								
								if(parenultimorespondido!=mensaje.parent){ //revisa si el ultimo padre guardado es distinto de el mensaje padre del mensaje a ingresar
										mensaje['session'] =sessionactual+1;//la sesion actual se actualiza en 1 para el mensaje
										sessionactual=sessionactual+1;//se actualiza la variable sesion actual
										ultimoemailsession=mensaje.usuario.email;//el ultimo en realizar el mensaje
										parenultimorespondido=mensaje.parent;//el penultimo (su padre)
								}
								else{//si son iguales los mensajes id padres entonces no se actualiza el valor (se mantiene la sesion)
									//actualiza simplemente los valores
									mensaje['session']=sessionactual; 
									ultimoemailsession=mensaje.usuario.email;
									parenultimorespondido=mensaje.parent;

								}
							}
							else{//si no son iguales entonces simplemente aumento el valor de la sesión
								mensaje['session'] =sessionactual+1; //la sesion actual se actualiza en 1 para el mensaje
								sessionactual=sessionactual+1; //se actualiza la variable sesion actual
								ultimoemailsession=mensaje.usuario.email;//el ultimo en realizar el mensaje
								parenultimorespondido=mensaje.parent;//el penultimo (su padre)
							}
						}
						/* BLOQUE DEL ALGORITMO DE SESION*/
						//Se actualiza el dialogo y se inserta en dialog.children el mensaje nuevo de entrada
						dialog.children[dialog.children.length]=mensaje;
						return;
					} //FIN IF
					else{
						busco(dialog.children[position[contador]],position,contador+1,largo);//llama a la función aumentando el contador y moviendo el valor pivot de position 
					}
				} //FIN FUNCTION busco
				/*Nota: el programa igual funciona sin el valor de sesión, solo fijarse en actualizar los valores de edit.ejs y el 
				controlador de angular*/

				//se inicializa contador en 1
				var contador=1;
				var position = mensaje.position; //obtiene el array de mensaje con los valores de position 
				var largo =mensaje.position.length-1; //se obtiene el largo de los elementos de position -1 ya que no se revisa el primero

				busco(dialog,position,contador,largo);//busca donde ingresarlo

				//actualiza los valores de session
				dialog.session_actual=sessionactual;
				dialog.ultimo_session_email=ultimoemailsession;
				dialog.parent_ultimo_respondido=parenultimorespondido;

				//Le dice a sails que actualice el modelo de dialogo
				dialog.save(function(err) {});	
				return res.json({dialog:dialog});
				
		
			}

	
		});
	},

/**
* @method :: getMessages (GET)
* @description :: Obtiene el dialogo de acuerdo al valor de sesión
* @param :: {Object} req, request element de sails
* @param  :: {Objetct} res, de la vista ejs del servidor
* @param :: {Objetct} next, para continuar en caso de error
*/
	getMessages: function(req,res,next){
		//funcion de Sails para buscar de acuerdo al parametro id del Dialogo, luego se hace un populate para llenar el JSON de acuerdo al modelo mensajes y se asocia a
		//ese dialogo el mensaje
		Dialogo.findOne(req.param('id')).populate('mensajes').exec( function(err, dialogo){
			if(err){ //si hay error
				req.session.flash = { err:err} //actualiza la variable de sesion flash y le da el valor del error 
				return res.json({dialogo:'false'});// retorna un json con el valor dialogo falso
			}
			if(!dialogo){
				req.session.flash = { err:err} //actualiza la variable de sesion flash y le da el valor del error 
				return res.json({dialogo:'false'});// retorna un json con el valor dialogo falso
			}
			else{
				req.session.flash={}; //el valor flash del servidor se vuelve vacio
				return res.json({dialogo:dialogo}); //retorno el json con el valor dialogo correspondiente
			}
		});
	}



};

