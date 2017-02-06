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

    sendMensajeSocket: function(nuevoMensaje, revisarSession, req) {
        sails.sockets.broadcast( 
            nuevoMensaje.project_id, 
            "socket_project_response", { 
                message: "Mensaje desde el servidor.", 
                type: "MensajeNuevo", 
                nuevoMensaje: nuevoMensaje, 
                revisarSession: revisarSession, 
                revisarSessionId: nuevoMensaje.sessionId  
            }, req);
    }, 

    setMensajePosicionNoIntercalar: function(nuevoMensaje, req) { 

        // Buscar los nodos que están en la sesión actual del nuevo nodo 
        Mensaje.find({ project_id: nuevoMensaje.project_id, sessionId: nuevoMensaje.sessionId }).exec(function(err, msj) { 
            // Iniciar parámetros 
            var revisarSession = false; 

            // Si existe más de 1 mensaje actualizar
            if(msj.length > 1) { 

                for(var i = 0; i < msj.length; i++) { 

                    // Verificar si el nivel está ocupado 
                    if(msj[i].id !== nuevoMensaje.id && msj[i].nodoNivel === nuevoMensaje.nodoNivel) {

                        // Verificar si el nivel del nodo padre del nuevo mensaje es menor que el nodo del mensaje analizado 
                        if((msj[i].nodoPadreId === nuevoMensaje.nodoPadreId) || 
                            (msj[i].nodoPadreSessionId > nuevoMensaje.nodoPadreSessionId && 
                            (msj[i].nodoPadreNivel <= nuevoMensaje.nodoPadreNivel))) { 
                            nuevoMensaje.nodoNivel++; 
                        } else { 
                            revisarSession = true; 
                            msj[i].nodoNivel++; 
                            msj[i].save(); 
                        } 
                    } 
                } 

                nuevoMensaje.save(); 
            } 

            // Enviar mensaje por el socket 
            Mensaje.sendMensajeSocket(nuevoMensaje, revisarSession, req); 
        }); 
    }, 

    setMensajePosicionIntercalar: function(nuevoMensaje, req) { 

        // Encontrar todos los nodos que podrían estar intercalados
        Mensaje.find({ 
            project_id: nuevoMensaje.project_id, 
            sessionId: { ">": nuevoMensaje.nodoPadreSessionId } }).then(function(msj) { 

            // Si existen mensajes por actualizar 
            if(msj.length > 1) {

                // En 'parentsId' se almacenan todos los nodos padres que no se modificarán
                var parentsId = []; 
                parentsId.push(nuevoMensaje.nodoPadreId); 

                // Buscar cada mensaje 
                for(var j = 0; j < msj.length; j++) { 

                    if(msj[j].nodoId !== nuevoMensaje.nodoId) { 

                        // Buscar en cada 'parentsId' si el nodo no se afecta 
                        for(var k = 0; k < parentsId.length; k++) { 

                            // Si el padre del nodo se encuentra en 'parentsId' añadir el id del nodo actual 
                            if(msj[j].nodoPadreId === parentsId[k]) { 
                                parentsId.push(msj[j].nodoId); 

                                // Verificar si el nivel del mensaje es mayor al nuevo 
                                // Si lo es actualizar el nuevo a la última posición 
                                if(msj[j].nodoNivel >= nuevoMensaje.nodoNivel) { 
                                    nuevoMensaje.nodoNivel = msj[j].nodoNivel + 1; 
                                    nuevoMensaje.save(); 
                                } 

                                break; 
                            } 
                        } 
                    } 
                } 

                // Buscar si existen mensajes en el mismo nivel 
                Mensaje.find({ 
                    project_id: nuevoMensaje.project_id, 
                    nodoId: { "!": nuevoMensaje.nodoId }, 
                    sessionId: { ">": nuevoMensaje.nodoPadreSessionId }, 
                    nodoNivel: nuevoMensaje.nodoNivel }).then(function(msjMismoNivel) { 

                    // Si existen mensajes en el mismo nivel del nuevo mensaje 
                    if(msjMismoNivel.length > 0) {

                        // Encontrar los mensajes que necesitan actualizar su nivel 
                        Mensaje.find({ 
                            project_id: nuevoMensaje.project_id, 
                            nodoId: { "!": nuevoMensaje.nodoId }, 
                            sessionId: { ">": nuevoMensaje.nodoPadreSessionId }, 
                            nodoNivel: { ">=": nuevoMensaje.nodoNivel } }).then(function(msjActualizar) { 

                            // Actualizar el nivel de cada mensaje debajo del nuevo mensaje 
                            for(var m = 0; m < msjActualizar.length; m++) { 
                                msjActualizar[m].nodoNivel++; 

                                if(msjActualizar[m].nodoPadreSessionId > nuevoMensaje.nodoPadreSessionId) { 
                                    msjActualizar[m].nodoPadreNivel++; 
                                }

                                msjActualizar[m].save(); 
                            } 

                            // Enviar el mensaje por el socket 
                            Mensaje.sendMensajeSocket(nuevoMensaje, false, req); 
                        })
                        .catch(function(err) {
                            sails.log("Error en 'Buscar nodos actualizar en el mismo nivel':", err); 
                        }); 
                    } else { 
                        // Enviar el mensaje por el socket 
                        Mensaje.sendMensajeSocket(nuevoMensaje, false, req); 
                    } 
                })
                .catch(function(err) {
                    sails.log("Error en 'Buscar nodos en el mismo nivel':", err); 
                }); 
            } 
        })
        .catch(function(err) {
            sails.log("Error en 'Buscar nodos hijos':", err); 
        }); 
    }, 
}; 