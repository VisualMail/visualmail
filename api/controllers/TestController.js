module.exports = {


	mensaje: function(req, res, next) {
		var ass = "Ass"; 

		Dialogo
		.find({ idmensaje: "589babce5570a1ad368a3c1c" })
		.then(function(m) { 

			var retorno = "Hola"; 

			if(retorno === "Hola1") {
				return Mensaje.find({ nodoId: 1}).then(function(msj) {
					return msj; 
				}); 
			} else 
				return ["Nada"]
		})
		.then(function(pos) {
			sails.log(ass); 
			sails.log(pos); 
		}); 
		res.redirect("/test/index.html"); 
	},

}; 
