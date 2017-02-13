/**
* DialogoController
*
* @description :: Logica desde el lado del servidor para manejar los dialogos
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {
	
	/**
	* @method :: create (POST)
	* @description :: Crea un nuevo elemento dialogo
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	create: function(req,res,next){ 

		// En caso de tener todos los parámetros solicitados de acuerdo al modelo
		Dialogo.create(req.allParams(), function dialogoCreated(err, dialogo) { 
			
			// Verificar si existe un error
			// actualiza la variable de sesion flash y le da el valor del error 
			// retorna un json con el valor dialogo falso
			if(err) { 
				req.session.flash = { err: err }; 
				return res.json({ dialogo: 'false' }); 
			}
			
			// Si no es un objeto diálogo
			// retorna un error y el json con la configuracion
			if(!dialogo) 
				return res.json({ dialogo:'false' }); 
			
			// En caso de no haber error
			// la variable flash de sesión se actualiza
			req.session.flash = { }; 

			// Se crea el valor y se retorna un json para el metodo POST
			return res.json({dialogo:dialogo}); 
		});
	},

	/**
	* @method :: update_dialogo (POST)
	* @description :: Crea un nuevo elemento dialogo
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	update_dialogo: function(req, res, next) { 

		// Valor requerido de entrada (Objeto JSON del modelo mensaje)
		var mensaje = req.param('mensaje'); 

		// Se inicializa el valor del parámetro children que contiene el subconjunto de mensajes
		mensaje["children"] = []; 

		// Se borran los elementos  innecesarios del JSON mensaje
		var project_id_aux = mensaje.project_id; 
		delete mensaje.project_id; 
		delete mensaje.dialogos; 
		
		// Funcion de Sails para buscar un dialogo dado el id del dialogo 
		// Al momento de crear un proyecto automaticamente se crea este valor
		// por lo que al cargar el proyecto este valor ya se tiene y se pide como valor requerido
		Dialogo.findOne(req.param('id')).exec( function(err, dialog){

			// Verificar si existe un error
			if(err) { 
				console.log(err);
			} 
			
			// Verificar si no encontró un diálogo
			if(!dialog) { 
				console.log('no encontrado id');
			} else{ 
				// En caso de no haber error entonces se actualiza el diálogo

				// Inicio BLOQUE DE DEFINICION DE ELEMENTOS PARA MANEJAR LA SESION DE UN DIALOGO
				// Del json 'mensaje', obtener el email de quién realizó el mensaje que se debe actualizar
				// se crea nuevo elemento del json 'dialog'
				dialog.ultimo_session_email = mensaje.usuario.email; 

				// Variable que obtiene el último valor de sesión
				var session = dialog.session; 

				// Variable que obtiene el valor de la sesión actual 
				var sessionactual = dialog.session_actual; 
				var ultimoemailsession = dialog.ultimo_session_email;
				var parenultimorespondido = dialog.parent_ultimo_respondido;
				// Nota: Este algoritmo de sesión no fue probado en su totalidad 
				// ya que no fue implementado solo está la idea, puede contener bugs
				// Fin BLOQUE DE DEFINICION DE ELEMENTOS PARA MANEJAR LA SESION DE UN DIALOGO


				//Se crea una función para buscar un elemento del diálogo para poder actualizarlo (Recursiva)
				/**
				* @method :: busco 
				* @description :: Busca recursivamente en el JSON dialog de acuerdo a los valores que hay en position, al encontrarlo actualiza el dialogo 
				* @param :: {Object} dialog, se le pasa el JSON dialog, y luego va iterando con dialog.children (con los hijos del dialogo inicial)
				* @param :: {Object} position, tiene la posicion donde va a ser guardado el elemento nuevo mensaje en dialogo
				* @param :: {Object} contador, contiene un contador que va aumentando hasta llegar al ultimo valor guardado del array position
				* @param :: {Object} largo, contiene el numero de elementos de position
				*/
				function busco(dialog,position,contador,largo){

					// Si el contador que se va aumentando es igual al largo de los valores guardados en position
					if(contador == largo) { 
						mensaje["idmensaje"] = mensaje.id;
						delete mensaje.id;
						
						// Inicio BLOQUE DEL ALGORITMO DE SESION
						// Si es la primera vez que se ha realizado un diálogo
						if(dialog.session == 0) { 
							
							// La sesión inicial es uno
							mensaje['session'] = 1; 

							// Se actualiza la sesión actual 
							sessionactual = 1; 

							// El último email de sesión se actualiza
							ultimoemailsession = mensaje.usuario.email; 

							// Guardar 'id' del mensaje último respondido
							parenultimorespondido = mensaje.parent; 

							// Conoce el padre, entonces puede ver despues si fue él mismo  el último que realizó un mensaje 
							// y verifica si está en la misma columna (sesión mantenida) o se mueve a una diferente
						} else {

							// En caso de no ser la primera vez
							if(ultimoemailsession == mensaje.usuario.email) { 

								// Primero se revisa si el email del último en iniciar sesión es igual 
								// a quien está realizando el mensaje
								// Revisa si el último padre guardado es distinto de el mensaje padre del mensaje a ingresar
								if(parenultimorespondido != mensaje.parent) { 
									
									// La sesión actual se actualiza en 1 para el mensaje
									mensaje['session'] = sessionactual + 1; 

									// Se actualiza la variable sesión actual
									sessionactual = sessionactual + 1;

									// El último en realizar el mensaje
									ultimoemailsession = mensaje.usuario.email;

									// El penúltimo (su padre)
									parenultimorespondido = mensaje.parent;
								} else {
									// Si son iguales los mensajes 'id' padres entonces no se actualiza el valor 
									// (se mantiene la sesion) 
									mensaje['session'] = sessionactual; 

									// Actualiza simplemente los valores
									ultimoemailsession = mensaje.usuario.email;
									parenultimorespondido = mensaje.parent;
								}
							} else {

								// Si no son iguales entonces simplemente aumento el valor de la sesión
								// La sesión actual se actualiza en 1 para el mensaje
								mensaje['session'] = sessionactual + 1; 

								// Se actualiza la variable sesión actual
								sessionactual = sessionactual + 1; 

								// El último en realizar el mensaje
								ultimoemailsession = mensaje.usuario.email;

								// El penúltimo (su padre)
								parenultimorespondido=mensaje.parent;
							}
						}
						// Fin BLOQUE DEL ALGORITMO DE SESION

						// Se actualiza el diálogo ('dialog') y se inserta en 'dialog.children' el 'mensaje' nuevo de entrada
						dialog.children[dialog.children.length] = mensaje;
						return;
					} else {

						// Llamar a la función 'busco' aumentando el contador y moviendo el valor pivot de 'position'
						busco(dialog.children[position[contador]], position, contador + 1, largo);
					}
				} 
				// Nota: el programa igual funciona sin el valor de sesión, solo fijarse en actualizar 
				// los valores de edit.ejs y el controlador de angular

				// Se inicializa 'contador' en 1
				var contador = 1;

				// Obtener el arreglo de 'mensaje' con los valores de 'position'
				var position = mensaje.position; 

				// Se obtiene el 'largo' de los elementos de position -1 ya que no se revisa el primero
				var largo = mensaje.position.length - 1; 

				// Buscar dónde ingresarlo
				busco(dialog, position, contador, largo);

				// Actualizar los valores de session
				dialog.session_actual = sessionactual;
				dialog.ultimo_session_email = ultimoemailsession;
				dialog.parent_ultimo_respondido = parenultimorespondido;

				// Le dice a sails que actualice el modelo de dialogo
				dialog.save(function(err) { });	
				//sails.sockets.broadcast(project_id_aux, 'conectar_socket', {message: 'conectado a VisualMail Socket'}, req);
				return res.json({ dialog: dialog });
			}
		});
	},

	/**
	* @method :: getMessages (GET)
	* @description :: Obtiene el dialogo de acuerdo al valor de sesión
	* @param :: {Object} req, request element de sails
	* @param :: {Objetct} res, de la vista ejs del servidor
	* @param :: {Objetct} next, para continuar en caso de error
	**/
	getMessages: function(req, res, next) { 
		
		// Función de Sails para buscar de acuerdo al parámetro 'id' del Dialogo, 
		// luego se hace un populate para llenar el JSON de acuerdo al modelo mensajes 
		// y se asocia a ese dialogo el mensaje
		Dialogo.findOne(req.param('id')).populate('mensajes').exec( function(err, dialogo){

			// Verificar si existe un error
			if(err) { 
				// Actualizar la variable de sesion flash y dar el valor del error 
				req.session.flash = { err: err }; 

				// Retornar un json con el valor diálogo falso
				return res.json({ dialogo: 'false' }); 
			}
			
			if(!dialogo) { 
				// Actualizar la variable de sesión flash y le da el valor del error 
				req.session.flash = { err: err }; 

				// Retornar un json con el valor diálogo falso
				return res.json({ dialogo: 'false' }); 
			} else { 
				// El valor flash del servidor se vuelve vacio
				req.session.flash = { }; 

				// Retorno el json con el valor diálogo correspondiente
				return res.json({ dialogo: dialogo }); 
			}
		});
	}
};