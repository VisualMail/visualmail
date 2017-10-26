/** 
* ArchivoController 
* 
* @description ::Logica del servidor para manejar Proyectos 
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers 
**/ 
module.exports = { 
    /** 
	* @method :: create (POST) 
	* @description :: Crea un nuevo archivo asociado al proyecto. 
	* @param :: {Object} req, request element de sails. 
	* @param :: {Objetct} res, de la vista ejs del servidor. 
	* @param :: {Objetct} next, para continuar en caso de error. 
    **/ 
    create: function(req, res, next) { 
        var project_id = req.param("project_id"); 
        var obj = { 
            fileName: "", 
            fileSize: 0, 
            fileType: "", 
            name: "", 
            estado: 1,
            project_id: project_id, 
            user_id: req.session.User  
        }; 

        Archivo.create(obj).then(function(resultCreate) { 

            if(!resultCreate) { 
                return res.json({ 
                    proc: false, 
                    msg: "¡Se produjo un error con el objeto 'archivo'!" 
                }); 
            }

            req.file("file").upload({ 
                dirname: require("path").resolve(sails.config.appPath, "assets/images/projectArchivo"), 
                maxBytes: 10000000, 
                saveAs: resultCreate.id + req.param("fileExt") 
            }, function whenDone(err, uploadedFiles) { 
                if(err) { 
                    sails.log(err); 
                    return res.json({ 
                        proc: false, 
                        msg: "¡Se produjo un error al subir el archivo!" 
                    }); 
                } 

                if(uploadedFiles.length === 0) { 
                    return res.json({ 
                        proc: false, 
                        msg: "¡No se subió ningún archivo!" 
                    }); 
                }

                resultCreate.fileName = resultCreate.id + req.param("fileExt"); 
                resultCreate.fileSize = uploadedFiles[0].size; 
                resultCreate.fileType = uploadedFiles[0].type; 
                resultCreate.name = req.param("nombre"); 
                resultCreate.save(); 
    
                sails.sockets.broadcast( 
                    project_id, 
                    "socket_project_response", { 
                        message: "Mensaje desde el servidor.", 
                        type: "ProjectArchivoNuevo", 
                        archivoNuevo: resultCreate 
                    }, req);

                return res.json({ 
                    proc: true, 
                    msg: "¡Archivo registrado!"
                }); 
            }); 
        }).catch(function(err) { 
            sails.log("Se produjo un error: ", err); 
            return res.json({ 
                proc: false, 
                msg: "¡Se produjo un error en la base de datos 'Archivo.create'!" 
            }); 
        }); 
    }, 

    getAllProjectId: function(req, res, next) { 
        Archivo.find({ project_id: req.param("project_id") }).then(function(archivoLista) { 
            return res.json({ 
                proc: true, 
                msg: "", 
                archivoLista: archivoLista 
            }); 
        }).catch(function(err) { 
            sails.log("Se produjo un error: ", err); 
            return res.json({ 
                proc: false, 
                msg: "¡Se produjo un error en la base de datos!" 
            }); 
        }); 

    }
}