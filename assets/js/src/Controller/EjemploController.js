angular
	.module('app.EjemploController', [])
	.controller('EjemploController', function($scope, $http){ 
		$http.get('/csrfToken')
		.success(function (token) { 
			$scope.csrfToken = token._csrf; 
		});


		// The automatically-created socket is exposed as io.socket.
		// Use .on() to subscribe to the 'hello' event on the client
		io.socket.on('hello', function gotHelloMessage (data) { 
			var n = $('#notification');
			n.html(n.html() + '<br />' + 'Server sent: `' + data.message + '` That\'s it!');
			console.log('Server sent: `' + data.message + '` That\'s it!'); 
		}); 
		// Use .get() to contact the server 
		io.socket.get('/ejemplo/hello', function gotResponse(body, response) { 
			var n = $('#notification');
			
			console.log('Server responded with status code ' + response.statusCode + ' and data: ', body); 
		});

		$scope.enviarMensaje = function() {
			$http({ 
				method: 'POST', 
				url: '/ejemplo/message', 
				headers: {
					'Content-Type': 'application/json', 
					'X-CSRF-TOKEN': $scope.csrfToken 
					}, 
					data: {  
						msg: $scope.msg 
					} 
				}).success(function(data) { 
					console.log(data);
				});
		};
	});



