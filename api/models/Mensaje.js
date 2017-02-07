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

    setMensajePosicionIntercalar: function(nuevoMensaje, req) { 
        // Buscar los mensajes del proyecto que cumplan las condiciones: 
        // - Que no sea el primer mensaje, el nuevo mensaje, o el mensaje padre 
        // - Que el nivel que ocupan sea igual o mayor al nivel del nuevo mensaje 
        Mensaje.find({ 
            project_id: nuevoMensaje.project_id, 
            nodoId: { "!": [1, nuevoMensaje.nodoId, nuevoMensaje.nodoPadreId] }, 
            nodoNivel: { ">=": nuevoMensaje.nodoPadreNivel } 
        })
        .sort("sessionId ASC")
        .then(function(msj) { 
            // Parámetros iniciales 
            var revisarSession = false; 
            var actualizarNodos = []; 

            // Si existen mensajes por actualizar 
            if(msj.length > 1) { 

                // Lista auxiliar para almacenar los nodos que se actualizarán 
                var actualizarNodosAux = []; 
                // Variable auxiliar para almacenar el último nivel que ocupará el nuevo mensaje 
                var auxNivel = nuevoMensaje.nodoNivel; 
                var verificarCamino = false; 
                var noActualizarId = []; 

                // Buscar cada mensaje 
                for(var i = 0; i < msj.length; i++) { 

                    // Si el mensaje está en el mismo nivel del padre del nuevo mensaje y 
                    // el mensaje tiene una sesión menor a la del padre del nuevo mensaje, saltar este loop 
                    if(msj[i].nodoNivel === nuevoMensaje.nodoPadreNivel && 
                        msj[i].sessionId < nuevoMensaje.nodoPadreSessionId) 
                        continue; 

                    if(msj[i].nodoNivel === nuevoMensaje.nodoNivel && msj[i].sessionId > nuevoMensaje.nodoPadreSessionId) 
                        verificarCamino = true; 

                    // 'noActualizarNivel' almacena el nivel del mensaje que no se actualizará 
                    var noActualizarNivel = 0; 
                    // 'actualizar' es una bandera para agregar los mensajes que se actualizarán 
                    var actualizar = true; 

                    // Si el nivel del mensaje es menor o igual al nivel del nuevo mensaje y 
                    // el padre del mensaje es el mismo padre del nuevo mensaje o 
                    // la sesion del padre del mensaje es mayor o igual a la sesión del padre del nuevo mensaje y 
                    // el nivel del padre del mensaje es menor al nivel del padre del nuevo mensaje 
                    if(
                        ((msj[i].nodoNivel === nuevoMensaje.nodoPadreNivel || msj[i].nodoPadreNivel < nuevoMensaje.nodoPadreNivel) && msj[i].sessionId > nuevoMensaje.nodoPadreSessionId) || 
                        (msj[i].nodoPadreId === nuevoMensaje.nodoPadreId) 
                    ) { 
                        // Agregar el 'id' del mensaje como un mensaje que no se debe actualizar 
                        noActualizarId.push(msj[i].nodoId); 
                        // Guardar el nivel del mensaje para verificarlo con el nuevo mensaje 
                        noActualizarNivel = msj[i].nodoNivel; 
                        // No actualizar este mensaje 
                        actualizar = false;
                    } else {

                        // Buscar si el mensaje es hijo de un mensaje que no se debe actualizar 
                        for(var j = 0; j < noActualizarId.length; j++) { 
                            // Si es un hijo de un mensaje que no se actualiza
                            if(msj[i].nodoPadreId === noActualizarId[j]) {
                                // Agregar el 'id' del mensaje como un mensaje que no se debe actualizar 
                                noActualizarId.push(msj[i].nodoId); 
                                // Guardar el nivel del mensaje para verificarlo con el nuevo mensaje 
                                noActualizarNivel = msj[i].nodoNivel; 
                                // No actualizar este mensaje 
                                actualizar = false;
                                break; 
                            }
                        }

                    }

                    // Verificar si el mensaje debe ser actualizado 
                    if(actualizar) {
                        // Agregar en la lista auxiliar 
                        actualizarNodosAux.push(msj[i]); 
                    } else if(noActualizarNivel >= nuevoMensaje.nodoNivel) {
                        // Actualizar el máximo nivel del nuevo mensaje
                        nuevoMensaje.nodoNivel = noActualizarNivel + 1; 
                        nuevoMensaje.save(); 
                    } 

                    // Verificar si el nivel está ocupado 
                    if(msj[i].nodoNivel === auxNivel && 
                        msj[i].nodoPadreSessionId >= nuevoMensaje.nodoPadreSessionId && 
                        msj[i].nodoPadreNivel < nuevoMensaje.nodoPadreNivel) {
                        auxNivel++; 
                    }
                }

                // Si no existen mensajes superiores al nuevo mensaje
                if(noActualizarId.length <= 1) {
                    // Asignar el nivel auxiliar 
                    nuevoMensaje.nodoNivel = auxNivel; 
                    nuevoMensaje.save(); 
                }

                // Si existen mensajes por actualizar nivel 
                if(actualizarNodosAux.length > 0 && verificarCamino) { 
                    revisarSession = true; 

                    // Actualizar cada mensaje 
                    for(var j = 0; j < actualizarNodosAux.length; j++) {

                        /*if(actualizarNodosAux[j].sessionId <= nuevoMensaje.nodoPadreSessionId && 
                            actualizarNodosAux[j].numero_hijos === 0)
                            continue; */

                        if(actualizarNodosAux[j].nodoNivel <= nuevoMensaje.nodoNivel) { 
                            actualizarNodosAux[j].nodoNivel += ((nuevoMensaje.nodoNivel - actualizarNodosAux[j].nodoNivel) + 1);  
                        } else 
                            actualizarNodosAux[j].nodoNivel++; 

                        actualizarNodos.push(actualizarNodosAux[j]); 
                    }

                    for(var l = 0; l < actualizarNodos.length; l++) {

                        for(var m = 0; m < actualizarNodos.length; m++) {
                            if(actualizarNodos[m].id === actualizarNodos[l].parent) {
                                actualizarNodos[l].nodoPadreNivel = actualizarNodos[m].nodoNivel; 
                                break; 
                            }
                        }

                        actualizarNodos[l].save(); 
                    }
                }
            }

            // Enviar el mensaje por el socket 
            Mensaje.sendMensajeSocket(nuevoMensaje, revisarSession, actualizarNodos, req); 
        })
        .catch(function(err) {
            // Si existe un error, desplegar en pantalla 
            sails.log("Se produjo un error en 'Buscar mensajes mayor o iguales al nivel del nuevo mensaje'", err); 
        });
    },
}; 