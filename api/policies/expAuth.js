/**
 * expAuth
 *
 * @module      :: Policy
 * @description :: Politica simple para filtrar usuarios experimentales
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) { 
    
    // Si el usuario está autenticado 
    // continuar con el procedimiento solicitado 
    if (req.session.authenticated) { 

        // Si es un usuario admin o experimental 
        if(req.session.User.rol === 1 || req.session.User.rol === 2) 
            return next(); 
        else {  
            res.redirect("/project/control?id=" + req.param("id")); 
            return; 
        }
    } 
    
    // Redirigir a la página de inicio de sesión 
    res.redirect("/session/login"); 
    return; 
}; 