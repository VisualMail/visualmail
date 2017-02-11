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

    getMensajeHijos: function(nodoId) { 
        Mensaje.find({ nodoPadreId: nodoId })
            .then(function(resultado) {
                var retorno = []; 
                if(resultado.length > 0) {
                    for(var i = 0; i < resultado.length; i++) {
                        retorno.push(Mensaje.getMensajeHijos(resultado[i].nodoId)); 
                    }
                } else 
                    return resultado.length; 

                return retorno; 
            });
    }, 

    sendMensajeSocket: function(nuevoMensaje, revisarSession, actualizarNodos, req) {
        sails.sockets.broadcast( 
            nuevoMensaje.project_id, 
            "socket_project_response", { 
                message: "Mensaje desde el servidor.", 
                type: "MensajeNuevo", 
                nuevoMensaje: nuevoMensaje, 
                revisarSession: revisarSession, 
                actualizarNodos: actualizarNodos  
            }, req);
    }, 

    setMensajePosicion: function(nuevoMensaje, req) { 
        var revisarSession = false; 
        var actualizarNodos = []; 

        Mensaje.find({ 
            project_id: nuevoMensaje.project_id, 
            nodoId: { "!": [1, nuevoMensaje.nodoId, nuevoMensaje.nodoPadreId] }, 
            nodoNivel: { ">=": nuevoMensaje.nodoPadreNivel } 
        })
        .sort("sessionId ASC")
        .then(function(msj) { 
            sails.log("Entrando: ", nuevoMensaje.nodoNivel); 

            if(msj.length > 1) { 
                var nodosActualizar = []; 
                var nodosPadreId = [nuevoMensaje.nodoPadreId]; 

                for(var i = 0; i < msj.length; i++) { 
                    if(msj[i].nodoNivel === nuevoMensaje.nodoPadreNivel && 
                        msj[i].sessionId < nuevoMensaje.nodoPadreSessionId) 
                        continue; 

                    var nodoEsHijo = false; 

                    for(var j = 0; j < nodosPadreId.length; j++) {
                        if(nodosPadreId[j] === msj[i].nodoPadreId) {
                            nodosPadreId.push(msj[i].nodoId); 

                            if(msj[i].nodoNivel >= nuevoMensaje.nodoNivel)
                                nuevoMensaje.nodoNivel = msj[i].nodoNivel + 1; 

                            nodoEsHijo = true;
                            break; 
                        }
                    }

                    if(!nodoEsHijo) 
                        nodosActualizar.push(msj[i]); 
                } 

                nuevoMensaje.save(); 

                if(nodosActualizar.length > 0) {

                    for(var k = 0; k < nodosActualizar.length; k++) {
                        if(nodosActualizar[k].nodoNivel <= nuevoMensaje.nodoNivel) {
                            revisarSession = true; 

                            for(var a = 0; a < nodosActualizar.length; a++) { 

                                nodosActualizar[a].nodoNivel += 
                                    (nodosActualizar[a].nodoNivel <= nuevoMensaje.nodoNivel ? 
                                    (nuevoMensaje.nodoNivel - nodosActualizar[a].nodoNivel) : 0) + 1; 

                                for(var b = 0; b < nodosActualizar.length; b++) {

                                    if(nodosActualizar[a].nodoId === nodosActualizar[b].nodoPadreId)
                                        nodosActualizar[b].nodoPadreNivel = nodosActualizar[a].nodoNivel; 

                                }

                                nodosActualizar[a].save(); 
                                actualizarNodos.push(nodosActualizar[a]); 
                            }

                            break; 
                        }
                    }

                }
            } 

            sails.log("Saliendo: ", nuevoMensaje.nodoNivel); 

            Mensaje.sendMensajeSocket(nuevoMensaje, revisarSession, actualizarNodos, req); 

        })
        .catch(function(err) { 
            sails.log("Se produjo un error en 'sendMensajePosicion': ", err); 
        }); 
    }, 

}; 