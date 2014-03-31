'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).

factory('EventSocket', function (socketFactory) {

	var myIoSocket = io.connect('http://ec2-54-73-51-106.eu-west-1.compute.amazonaws.com:80');
	// myIoSocket.forward('error');

	var EventSocket = socketFactory({
		ioSocket: myIoSocket
	});

	return EventSocket;
}).

value('version', '0.1');
