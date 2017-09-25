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
        // 'pk' del mensaje al que esta asociado 
        children: { 
            collection: 'Mensaje' 
        }, 

        // Texto del mensaje 
        name: { 
            type: "string" 
        }, 

        // 'nodoId' identificador del nodo que representa al mensaje en el mapa del diálogo 
        nodoId: { 
            type: "integer" 
        }, 

        // 'nodoNivel' nivel en el que está posicionado el nodo en el mapa del diálogo 
        nodoNivel: { 
            type: "integer" 
        }, 

        // 'nodoPadreId' identificador del nodo padre del nodo que representa al mensaje en el mapa del diálogo 
        nodoPadreId: { 
            type: "integer" 
        }, 

        // 'nodoPadreNivel' nivel en el que está posicionado el nodo padre en el mapa del diálogo 
        nodoPadreNivel: { 
            type: "integer" 
        }, 

        // 'nodoPadreSessionId' el número de la sesión en la que se encuentra el nodo padre 
        nodoPadreSessionId: { 
            type: "integer" 
        }, 

        // Número de hijos del mensaje 
        numero_hijos: { 
            type: "integer" 
        }, 

        // 'id' del mensaje padre 
        parent: { 
            type: "string" 
        }, 

        // 'id' del proyecto al cual está inmerso 
        project_id: { 
            type: "string" 
        }, 

        // 'sessionId' el número de la sesión en la que se encuentra el nodo 
        sessionId: { 
            type: "integer" 
        }, 

        // Valor booleano si es raíz de los mensajes (todos false menos el primero) 
        root: { 
            type: "boolean" 
        }, 

        // 'pk' de la tarea asociada al mensaje 
        tareaId: { 
            type: "string" 
        }, 
        
        // 'pk' de la tarea asociada al mensaje 
        tareas: { 
            collection: 'tarea', 
            via: 'mensaje' 
        }, 

        // Representa el tipo del mensaje: duda, compromiso, acuerdo, etc 
        tipo: { 
            type: "string" 
        }, 

        // Identificador del tipo del mensaje: duda, compromiso, acuerdo, etc 
        tipoId: { 
            type: "string" 
        }, 

        // Texto con la marca a la que responde el mensaje 
        tipoName: { 
            type: "string", 
        }, 

        // Marca del texto a la que responde el mensaje 
        tipoNameMarca: { 
            type: "string", 
        }, 

        // 'pk' del usuario que realizó el mensaje 
        usuario: { 
            model: 'User' 
        }, 
    },

    /**
    * @method :: beforeCreate 
    * @description :: Antes de crear el mensaje, actualizar el identificador del nodo 
    * @param :: {Object} obj, contiene la información del mensaje 
    * @param :: {Objetct} next, para continuar en caso de error 
    **/
    beforeCreate: function(obj, next) { 
        // Buscar el total de mensajes que contiene el proyecto 
        Mensaje.count({ project_id: obj.project_id }).exec(function(err, cnt) { 
            // Si existe un error, continuar 
            if(err) 
                return next(err); 
            else { 
                // Actualizar el identificador que representa al mensaje 
                obj.nodoId = cnt + 1; 
                next(null); 
            }
        });
    },

    /**
    * @method :: sendMensajeSocket 
    * @description :: Envía el mensaje a través de un web socket a los integrantes de un proyecto 
    * @param :: {Object} nuevoMensaje, contiene la información del nuevo mensaje 
    * @param :: {boolean} revisarSession, en caso de ser necesario actualizar la posición de los nodos 
    * @param :: {Object} actualizarNodos, continene la lista de mensajes (con su información respectiva) que se actualizarán 
    * @param :: {Object} req, request element de sails
    **/ 
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

    /**
    * @method :: setMensajePosicion 
    * @description :: Establece la posición del nuevo mensaje 
    * @param :: {Object} nuevoMensaje, contiene la información del nuevo mensaje 
    * @param :: {Object} req, request element de sails
    **/ 
    setMensajePosicion: function(nuevoMensaje, req) { 
        // La variable 'revisarSession' permite verificar 
        // si es necesario actualizar la información de los nodos 
        var revisarSession = false; 

        // Iniciar la lista que almacenará a los nodos que se actualizarán 
        var actualizarNodos = []; 

        // Buscar los mensajes del mismo proyecto con la excepción de 
        // el mensaje inicial, el nuevo mensaje y el padre del nuevo mensaje 
        // además que el nivel del mensaje sea mayor o igual al nivel del padre del nuevo mensaje 
        Mensaje.find({ 
            project_id: nuevoMensaje.project_id, 
            nodoId: { "!": [1, nuevoMensaje.nodoId, nuevoMensaje.nodoPadreId] }, 
            nodoNivel: { ">=": nuevoMensaje.nodoPadreNivel } 
        })
        .sort("sessionId ASC")
        .then(function(msj) { 
            // Si existe más de un mensaje 
            if(msj.length > 1) { 
                // Iniciar la lista que almacenará los mensajes potenciales 
                // que deberán ser actualizados 
                var nodosActualizar = []; 

                // Iniciar la lista de los mensajes que no se modificarán 
                var nodosPadreId = [nuevoMensaje.nodoPadreId]; 

                // Inicar iteración 
                for(var i = 0; i < msj.length; i++) { 
                    // Si el nivel del nodo es igual al nivel del padre del nuevo mensaje y 
                    // es un mensaje que está en una sesión pasada a la sesión del padre, 
                    // descartar el mensaje 
                    if(msj[i].nodoNivel === nuevoMensaje.nodoPadreNivel && 
                        msj[i].sessionId < nuevoMensaje.nodoPadreSessionId) 
                        continue; 

                    // Iniciar una variable auxiliar para establecer que 
                    // no es un mensaje hijo o pariente del padre del nuevo mensaje 
                    var nodoEsHijo = false; 

                    // Iterar en la lista de los mensajes que no se modificarán 
                    for(var j = 0; j < nodosPadreId.length; j++) { 
                        // Si el mensaje está relacionado con uno de los mensajes que no se modificarán 
                        // almacenar en esta lista el mensaje 
                        if(nodosPadreId[j] === msj[i].nodoPadreId) {
                            nodosPadreId.push(msj[i].nodoId); 

                            // Si el nivel del mensaje es mayor o igual al nivel del nuevo mensaje, 
                            // modificar el nivel del nuevo mensaje 
                            if(msj[i].nodoNivel >= nuevoMensaje.nodoNivel)
                                nuevoMensaje.nodoNivel = msj[i].nodoNivel + 1; 

                            // Establecer que es un hijo o un pariente del nodo padre del nuevo mensaje 
                            nodoEsHijo = true;
                            break; 
                        }
                    }

                    // Si el mensaje no está relacionado con el nodo padre del nuevo mensaje 
                    // añadir a la lista de los mensajes que deberán ser actualizados 
                    if(!nodoEsHijo) 
                        nodosActualizar.push(msj[i]); 
                } 

                // Almacenar los cambios en el nuevo mensaje 
                nuevoMensaje.save(); 

                // Si existen mensajes por actualizar 
                if(nodosActualizar.length > 0) {

                    // Iniciar iteración 
                    for(var k = 0; k < nodosActualizar.length; k++) { 

                        // Si existe por lo menos un mensaje en un nivel menor o igual 
                        // al nivel del nuevo mensaje, actualizar el nivel de cada mensaje 
                        if(nodosActualizar[k].nodoNivel <= nuevoMensaje.nodoNivel) { 
                            // Establecer que se deben actualizar los mensajes en el mapa del diálogo 
                            revisarSession = true; 

                            // Iterar en cada nodo que se debe actualizar 
                            for(var a = 0; a < nodosActualizar.length; a++) { 
                                // Establecer el nuevo nivel del mensaje 
                                nodosActualizar[a].nodoNivel += 
                                    (nodosActualizar[a].nodoNivel <= nuevoMensaje.nodoNivel ? 
                                    (nuevoMensaje.nodoNivel - nodosActualizar[a].nodoNivel) : 0) + 1; 

                                // Iterar en cada nodo que se debe actualizar para modificar el nivel en cada nodo hijo 
                                // en caso de que el mensaje esté relacionado con un mensaje en esta lista 
                                for(var b = 0; b < nodosActualizar.length; b++) { 

                                    // Si existe un nodo hijo del mensaje 
                                    // actualizar el nivel del padre 
                                    if(nodosActualizar[a].nodoId === nodosActualizar[b].nodoPadreId)
                                        nodosActualizar[b].nodoPadreNivel = nodosActualizar[a].nodoNivel; 
                                }

                                // Actualizar el mensaje en la base de datos 
                                nodosActualizar[a].save(); 

                                // Agregar a la lista que se actualizará en el mapa del diálogo 
                                actualizarNodos.push(nodosActualizar[a]); 
                            }

                            break; 
                        }
                    }
                }
            } 

            // Enviar el nuevo mensaje y la lista de los mensajes que se actualizarán a través del web socket 
            Mensaje.sendMensajeSocket(nuevoMensaje, revisarSession, actualizarNodos, req); 
        })
        .catch(function(err) { 
            // Desplegar el error en la consola 
            sails.log("Se produjo un error en 'sendMensajePosicion': ", err); 
        }); 
    }, 

}; 