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

    setMensajePosicionNoIntercalar: function(nuevoMensaje, req) { 

        // Buscar los nodos que están en la sesión actual del nuevo nodo 
        Mensaje.find({ 
            id: { "!": nuevoMensaje.id }, 
            project_id: nuevoMensaje.project_id, 
            sessionId: nuevoMensaje.sessionId, 
            nodoNivel: { ">=": nuevoMensaje.nodoNivel } 
        })
        .sort("nodoNivel ASC")
        .then(function(msj) { 
            // Iniciar parámetros 
            var revisarSession = false; 
            var modificarNivel = false; 

            // Si existe más de 1 mensaje actualizar
            if(msj.length > 1) { 

                for(var i = 0; i < msj.length; i++) { 

                    // Verificar si el nivel está ocupado 
                    if(msj[i].nodoNivel === nuevoMensaje.nodoNivel) {

                        // Verificar si el nivel del nodo padre del nuevo mensaje es menor que el nodo del mensaje analizado 
                        if(msj[i].nodoPadreId === nuevoMensaje.nodoPadreId || 
                            (msj[i].nodoPadreSessionId === nuevoMensaje.nodoPadreSessionId && 
                            msj[i].nodoPadreNivel < nuevoMensaje.nodoPadreNivel)) {
                            modificarNivel = false; 
                            nuevoMensaje.nodoNivel++; 
                        } else 
                            modificarNivel = true; 
                    } 

                    // Vericar si es necesario modificar el nivel de los nodos 
                    if(modificarNivel) {
                        revisarSession = true;  
                        msj[i].nodoNivel++; 
                        msj[i].save(); 
                    }
                } 

                nuevoMensaje.save(); 
            } 

            // Enviar mensaje por el socket 
            Mensaje.sendMensajeSocket(nuevoMensaje, revisarSession, [], req); 
        })
        .catch(function(err) {
            sails.log("Error en 'setMensajePosicionNoIntercalar':", err); 
        }); 
    }, 

    setMensajePosicionIntercalar: function(nuevoMensaje, req) { 

        // Encontrar todos los mensajes que podrían estar intercalados
        Mensaje.find({ 
            project_id: nuevoMensaje.project_id, 
            id: { "!": nuevoMensaje.id }, 
            sessionId: { ">": nuevoMensaje.nodoPadreSessionId } 
        })
        .then(function(msj) { 

            // Si existen mensajes por actualizar 
            if(msj.length > 1) {

                // En 'parentsId' se almacenan todos los mensajes padres que no se modificarán
                var parentsId = []; 
                parentsId.push(nuevoMensaje.nodoPadreId); 
                var auxNivel = nuevoMensaje.nodoNivel; 

                // Buscar cada mensaje 
                for(var j = 0; j < msj.length; j++) { 

                    // Buscar en cada 'parentsId' si el mensaje no se afecta 
                    for(var k = 0; k < parentsId.length; k++) { 

                        // Si el padre del mensaje se encuentra en 'parentsId' añadir el id del mensaje actual 
                        if(msj[j].nodoPadreId === parentsId[k]) { 
                            parentsId.push(msj[j].nodoId); 

                            // Verificar si el nivel del mensaje es mayor al nuevo 
                            if(msj[j].nodoNivel >= nuevoMensaje.nodoNivel) { 
                                // Si lo es actualizar el nuevo a la última posición 
                                nuevoMensaje.nodoNivel = msj[j].nodoNivel + 1; 
                                nuevoMensaje.save(); 
                            } 

                            break; 
                        } 
                    }

                    // Verificar si el nivel está ocupado 
                    if(msj[j].nodoNivel === auxNivel && 
                        msj[j].nodoPadreSessionId >= nuevoMensaje.nodoPadreSessionId && 
                        msj[j].nodoPadreNivel < nuevoMensaje.nodoPadreNivel) {
                        auxNivel++; 
                    }
                } 

                // Si no existen mensajes superiores del nuevo mensaje
                if(parentsId.length <= 1) {
                    // Asignar el nivel auxiliar 
                    nuevoMensaje.nodoNivel = auxNivel; 
                    nuevoMensaje.save(); 
                }

                var msjMismoNivel = Mensaje.find({ 
                    project_id: nuevoMensaje.project_id, 
                    id: { "!": nuevoMensaje.id }, 
                    nodoId: {"!": parentsId}, 
                    sessionId: { ">": nuevoMensaje.nodoPadreSessionId }, 
                    nodoNivel: nuevoMensaje.nodoNivel  
                })
                .then(function(resultado) { 
                    var retorno = []; 
                    
                    if(resultado.length > 0) {
                        retorno = Mensaje.find({ 
                            project_id: nuevoMensaje.project_id, 
                            id: { "!": nuevoMensaje.id }, 
                            nodoId: {"!": parentsId }, 
                            sessionId: { ">": nuevoMensaje.nodoPadreSessionId }, 
                            nodoNivel: {">=": nuevoMensaje.nodoNivel } 
                        })
                        .sort("sessionId ASC")
                        .then(function(resultado) { 
                            return resultado; 
                        })
                        .catch(function(err) {
                            sails.log("Error en 'Buscar nodos en el mismo nivel':", err); 
                            return []; 
                        });
                    }

                    return [retorno]; 
                })
                .spread(function(retorno){
                    return retorno; 
                })
                .catch(function(err) {
                    sails.log("Error en 'Buscar nodos en el mismo nivel':", err); 
                    return []; 
                }); 

                return [msjMismoNivel]; 
            } 
        })
        .spread(function(msjMismoNivel) {
            // Si existen mensajes en el mismo nivel del nuevo mensaje 
            var actualizarNodos = []; 
            var revisarSession = false; 

            if(msjMismoNivel.length > 0) { 

                // Actualizar el nivel de cada mensaje debajo del nuevo mensaje 
                for(var m = 0; m < msjMismoNivel.length; m++) { 
                    msjMismoNivel[m].nodoNivel += nuevoMensaje.nodoNivel; 

                    if(msjMismoNivel[m].nodoPadreSessionId > nuevoMensaje.nodoPadreSessionId) 
                        msjMismoNivel[m].nodoPadreNivel += nuevoMensaje.nodoNivel; 

                    msjMismoNivel[m].save(); 
                    actualizarNodos.push(msjMismoNivel[m].nodoId); 
                } 
            }

            // Enviar el mensaje por el socket 
            Mensaje.sendMensajeSocket(nuevoMensaje, revisarSession, actualizarNodos, req); 
        })
        .catch(function(err) {
            sails.log("Error en 'Buscar nodos hijos':", err); 
        }); 
    }, 
}; 