/**
 * Mensaje.js
 *
 * @description :: TODO: Representa un mensaje realizado por un usuario
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 **/
 module.exports = {
    schema: true,
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: { 

        // Texto del mensaje 
        name: { 
            type: "string" 
        }, 

        // Representa el tipo del mensaje: duda, compromiso, acuerdo, etc 
        tipo: { 
            type: "string" 
        }, 

        // Guardar en un arreglo la posición que le corresponde al mensaje de acuerdo al diálogo ('dialog')
        position: { 
            type: "array"
        }, 

        // 'id' del proyecto al cual está inmerso
        project_id: {
            type: "string"
        },

        // Número de hijos del mensaje
        numero_hijos: {
            type: "integer"
        },

        // Valor booleano si es raíz de los mensajes (todos false menos el primero)
        root: {
            type: "boolean"
        },
    
        // 'id' del mensaje padre
        parent: { 
            type: "string"
        },

        // 'pk' del mensaje al que esta asociado
        children: { 
            collection: 'Mensaje'
        },

        // 'pk' del usuario que realizó el mensaje
        usuario: {
            model: 'User'
        },

        // 'pk' de la tarea asociada al mensaje
        tareas: {
            collection: 'tarea',
            via: 'mensaje'
        },


        // Datos adicionales para dibujar el diálogo
        nodoId: {
            type: "integer"
        }, 
        nodoPadreId: {
            type: "integer"
        },
        sessionId: {
            type: "integer"
        },
        nodoNivel: {
            type: "integer"
        },
        nodoPadreNivel: {
            type: "integer"
        },
        nodoPadreSessionId: {
            type: "integer"
        }
    },

    beforeCreate: function(obj, next) {
        Mensaje.count({ project_id: obj.project_id }).exec(function(err, cnt) {
            if(err) 
                return next(err);
            else {
                obj.nodoId = cnt + 1;

                Mensaje.find({ 
                    "project_id": obj.project_id, 
                    "nodoId" : { ">=" : obj.nodoPadreId, "<=" : obj.nodoId }, 
                    "nodoNivel": obj.nodoNivel }).exec(function(err, resultado) { 

                    if(err)  
                        return next(err); 

                    if(resultado.length > 2) 
                        obj.nodoNivel += 1; 
                }); 

                next(null);
            }
        });
    },

    sendMensajeSocket: function(nuevoMensaje, req) {
        Mensaje.find().then(function(msj) { 
            sails.sockets.broadcast(  
                nuevoMensaje.project_id, 
                "socket_project_response", { 
                    message: "Mensaje desde el servidor.", 
                    type: "MensajeNuevo", 
                    obj: msj, 
                    nuevoMensaje: nuevoMensaje, 
                    revisarSession: false, 
                    revisarSessionId: nuevoMensaje.sessionId  
                }, req);
        });
    }, 

    setMensajePosicion: function(nuevoMensaje, req) { 

        // Verificar si no se intercala la ruta del nodo 
        if((nuevoMensaje.sessionId > 1) && (nuevoMensaje.nodoPadreSessionId < (nuevoMensaje.sessionId - 1))) {
            sails.log("Verificar si no se intercala el nodo."); 

            // Encontrar todos los nodos que podrían estar intercalados
            Mensaje.find({ project_id: nuevoMensaje.project_id, sessionId: { ">": nuevoMensaje.nodoPadreSessionId } }).then(function(msjNivel) {

                // Si existen mensajes por actualizar 
                if(msjNivel.length > 1) {

                    // En 'parentsId' se almacenan todos los nodos padres que no se modificarán
                    var parentsId = []; 
                    var updateId = []; 
                    parentsId.push(nuevoMensaje.nodoPadreId); 

                    // Buscar cada mensaje
                    for(var j = 0; j < msjNivel.length; j++) {

                        if(msjNivel[j].nodoId !== nuevoMensaje.nodoId) {
                            // Bandera para modificar los nodos que no son hijos
                            var noEsHijo = true; 

                            // Buscar en cada 'parentsId' si el nodo no se afecta
                            for(var k = 0; k < parentsId.length; k++) { 

                                // Si el padre del nodo se encuentra en 'parentsId' añadir el id del nodo actual
                                if(msjNivel[j].nodoPadreId === parentsId[k]) { 
                                    parentsId.push(msjNivel[j].nodoId); 

                                    // Verificar si el nivel del mensaje es mayor al nuevo 
                                    // Si lo es actualizar el nuevo a la última posición
                                    if(msjNivel[j].nodoNivel >= nuevoMensaje.nodoNivel) {
                                        nuevoMensaje.nodoNivel = msjNivel[j].nodoNivel + 1; 
                                        nuevoMensaje.save(); 
                                    }

                                    noEsHijo = false;
                                    break;
                                }
                            }

                            // Si no es hijo, se añade para actualizar el nivel
                            if(noEsHijo) 
                                updateId.push(msjNivel[j].nodoId); 
                        } 
                    }
                    sails.log("updateId length", updateId.length); 

                    // Si hay que modificar los nodos que no son hijos
                    /*if(updateId.length > 0) {
                        Mensaje.find({ project_id: nuevoMensaje.project_id, nodoId: updateId }).then(function(msjActualizar) {

                            // Actualizar el nivel del padre en los hijos
                            var nodosPadre = []; 

                            // Actualizar los nodos que no son hijos
                            for(var l = 0; l < msjActualizar.length; l++) {

                                msjActualizar[l].nodoNivel = nuevoMensaje.nodoNivel + (l + 1); 
                                msjActualizar[l].save(); 
                                nodosPadre.push({ nodoPadreId: msjActualizar[l].nodoId, nodoPadreNivel: msjActualizar[l].nodoNivel }); 
                                break; 

                            }

                            if(nodosPadre.length > 0) {
                                Mensaje.find({ project_id: nuevoMensaje.project_id, nodoPadreId: updateId }).then(function(msjActualizarPadre) {

                                    // Actualizar los nodos que tienen el nivel del padre
                                    for(var m = 0; m < msjActualizarPadre.length; m++) {

                                        for(var n = 0; n < nodosPadre.length; n++) {
                                            if(nodosPadre[n].nodoPadreId === msjActualizarPadre[m].nodoPadreId) {
                                                msjActualizarPadre[m].nodoPadreNivel = nodosPadre[n].nodoPadreNivel; 
                                                msjActualizarPadre[m].save(); 
                                                break; 
                                            }
                                        }
                                    }

                                }); 
                            }
                            
                        });
                    }*/
                }
            }); 
        } else {
            // Buscar los mensajes en la sessión actual
            Mensaje.find({ project_id: nuevoMensaje.project_id, sessionId: nuevoMensaje.sessionId }).exec(function(err, msjSession) { 

                // Si existe más de 1 mensaje actualizar
                if(msjSession.length > 1) {
                    sails.log("Verificar si no está en el mismo nivel."); 

                    var maxNivel = 0; 

                    for(var i = 0; i < msjSession.length; i++) {

                        // Verificar si el nivel está ocupado
                        if(msjSession[i].id !== nuevoMensaje.id && msjSession[i].nodoNivel === nuevoMensaje.nodoNivel) {
                            if(
                                (msjSession[i].nodoPadreId === nuevoMensaje.nodoPadreId) || 
                                (msjSession[i].nodoPadreSessionId > nuevoMensaje.nodoPadreSessionId && 
                                    (msjSession[i].nodoPadreNivel <= nuevoMensaje.nodoPadreNivel)
                                )
                            ) {
                                nuevoMensaje.nodoNivel++; 
                            } else {
                                msjSession[i].nodoNivel++;
                                msjSession[i].save(); 
                            }
                        }

                        if(msjSession[i].nodoNivel > maxNivel)
                            maxNivel = msjSession[i].nodoNivel;
                    }
                }

                nuevoMensaje.save(); 
                
                Mensaje.find().then(function(msj) {
                    sails.sockets.broadcast( 
                    nuevoMensaje.project_id, 
                    "socket_project_response", { 
                        message: "Mensaje desde el servidor.", 
                        type: "MensajeNuevo", 
                        obj: msj, 
                        nuevoMensaje: nuevoMensaje, 
                        revisarSession: false, 
                        revisarSessionId: nuevoMensaje.sessionId  
                    }, req);
                });
            });
        }



        
    }, 

};

