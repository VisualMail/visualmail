module.exports = {

	mensaje: function(req, res, next) {
		var mensajeAux = Mailer.sample(); 
		sails.log(mensajeAux); 

		res.redirect("/test/index.html"); 
	},

}; 