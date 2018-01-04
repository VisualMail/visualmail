/**
 * adminAuth
 *
 * @module      :: Policy
 * @description :: Politica simple para manejar un usuario administrador
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

  // Si el usuario está autenticado
  // continuar con el procedimiento solicitado
  if(req.session.authenticated) { 
      if(req.session.User.rol === 1)
        return next();
  }
  
  // Redirigir a la página de inicio de sesión  
  res.redirect("/user/index"); 
  return; 
};