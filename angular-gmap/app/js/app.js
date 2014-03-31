'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'btford.socket-io'
]).

config(['$routeProvider', function($routeProvider) {
	
  $routeProvider.when('/', {templateUrl: 'partials/main.html', controller: 'MainCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);
