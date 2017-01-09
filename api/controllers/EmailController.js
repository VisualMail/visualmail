/**
* EmailController
*
* @description :: Server-side logic for managing emails
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
**/
module.exports = {
	
	sendEmail: function(req, res) { 

		// sails.hooks.email.send(template, data, options, cb)
		sails.hooks.email.send(
			"welcomeEmail", 
			{ 
				recipientName: "Steve", 
				senderName: "yamasnax",
				senderEmail: "hello@yamasnax.com"
			}, 
			{ 
				from: "Admin <admin@yamasnax.com>", 
				to: "mat.quinteros@outlook.com", 
				subject: "SailsJS email test" 
			}, 
			function(err) { 
				console.log(err || "Email is sent"); 
		}); 

		return res.send('Email Test'); 
	}
};