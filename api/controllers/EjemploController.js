module.exports = {
	hello: function(req, res) {
	    // Make sure this is a socket request (not traditional HTTP)
	    if (!req.isSocket) {return res.badRequest();}
	    // Have the socket which made the request join the "funSockets" room
	    sails.sockets.join(req, 'funSockets');
	    // Broadcast a "hello" message to all the fun sockets.
	    // This message will be sent to all sockets in the "funSockets" room,
	    // but will be ignored by any client sockets that are not listening-- i.e. that didn't call `io.socket.on('hello', ...)`
	    // The data of the message ({} object) is the "data" in io.socket.on('hello', function gotHelloMessage (data)
	    sails.sockets.broadcast('funSockets', 'hello', {message: 'my id'}, req);
	    // Respond to the request with an a-ok message
	    // The object returned here is "body" in io.socket.get('/say/hello', function gotResponse(body, response)
	    return res.ok({
	        message: "OK"
	    });
	  },

	message: function(req, res) {
		var msg = req.param('msg');
	    sails.sockets.broadcast('funSockets', 'hello', {message: msg}, req);
		return res.json({ opcion: 'true' });
	},



}