
module.exports.sendWelcomeMail = function(user) {
 sails.hooks.email.send(
	  "welcomeEmail",
		  {
		    recibe: user.firstname,
		    envia: "Visual Mail",
		    direccion_envia: "visualmail@app861ea74e5a0e4900a1ede12f23e2e12b.mailgun.org",
		    clave: user.id,
		  },
		  {
		    from: "VisualMail <visualmail@app861ea74e5a0e4900a1ede12f23e2e12b.mailgun.org>",
		    to: user.email,
		    subject: "Recuperar Contraseña"
		  },
		  function(err) {console.log(err || "Email is sent");}
		)	
}

