
module.exports.sendWelcomeMail = function(user) {
 sails.hooks.email.send(
	  "welcomeEmail",
		  {
		    recibe: user.firstname,
		    envia: "Visual Mail",
		    direccion_envia: "noreply.visualmail@gmail.com",
		    clave: user.id,
		  },
		  {
		    from: "VisualMail <noreply.visualmail@gmail.com>",
		    to: user.email,
		    subject: "Recuperar Contraseña"
		  },
		  function(err) {console.log(err || "Email is sent");}
		)	
}

