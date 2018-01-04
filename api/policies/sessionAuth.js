/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Politica simple para manejar un usuario autenticado
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

  // Si el usuario está autenticado
  // continuar con el procedimiento solicitado
  if (req.session.authenticated) 
    return next();
  
  // Redirigir a la página de inicio de sesión  
  res.redirect("/session/login"); 
  return; 
};