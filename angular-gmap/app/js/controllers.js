'use strict';

/* Controllers */
var controllers = angular.module('myApp.controllers', []);



controllers.controller('AppCtrl', ['$scope', function($scope) {

	$scope.appTitle = "Busuu 360";
	$scope.layoutWidth = 960;
}]);



controllers.controller('MainCtrl', [
	'$scope',
	'EventSocket',
	'$timeout',
	function($scope, EventSocket, $timeout) {



	/*
	 * Define lsit of events 
	 */
	$scope.eventsTypeList = [
		{
			'type': 'registered',
			'description': 'A user registered',
			'pin': '/app/img/pin_signup.png',
			'style': {
				'background': "url('/app/img/box_signup.jpg') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'berries',
			'description': 'A user won some berries',
			'pin': '/app/img/pin_berry.png',
			'style': {
				'background': "url('/app/img/box_berry.jpg') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'premium',
			'description': 'A user became premium',
			'pin': '/app/img/pin_premium.png',
			'style': {
				'background': "url('/app/img/box_premium.png') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'badge',
			'description': 'A user won a badge',
			'pin': '/app/img/pin_badge.png',
			'style': {
				'background': "url('/app/img/box_badge.png') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'corrected',
			'description': 'A user corrected an excercise',
			'pin': '/app/img/pin_correction.png',
			'style': {
				'background': "url('/app/img/box_correction.jpg') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'posted',
			'description': 'A new excercise has been posted',
			'pin': '/app/img/pin_writing.png',
			'style': {
				'background': "url('/app/img/box_writing.png') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'friended',
			'description': 'Two user created a friendship',
			'pin': '/app/img/pin_friend.png',
			'style': {
				'background': "url('/app/img/box_friend.png') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'review',
			'description': 'A review has been completed',
			'pin': '/app/img/pin_review.png',
			'style': {
				'background': "url('/app/img/box_review.jpg') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'certificate',
			'description': 'A certificate has been earned',
			'pin': '/app/img/pin_100.png',
			'style': {
				'background': "url('/app/img/box_100.png') no-repeat center center"
			},
			'count': 0
		}, {
			'type': 'tweet',
			'description': 'A tweet mentioned us on Twitter',
			'pin': '/app/img/pin_twitter.png',
			'style': {
				'background': "url('/app/img/box_twitter.jpg') no-repeat center center"
			},
			'count': 0
		}
	];



	/*
	 * Get the pin image related to the event type passed
	 */
	var getPinImage = function (eventType) {

		for (var index in $scope.eventsTypeList) {
			var typeMatch = ( eventType == $scope.eventsTypeList[index].type );
			if (typeMatch) {
				return $scope.eventsTypeList[index].pin;
			}
		}

		return null;
	};



	/*
	 * Setup the map
	 */
	var initMap = function () {

		var map;

		var mapOptions = {
			zoom: 2,
			center: new google.maps.LatLng(30, 0),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
    		disableDefaultUI: true,
			panControl: false,
			zoomControl: false,
			mapTypeControl: false,
			scaleControl: false,
			streetViewControl: false,
			overviewMapControl: false,
		    scrollwheel: false,
		    navigationControl: false,
		    draggable: false,
			styles: [{
		        "featureType": "water",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#dff2fe"
		            }
		        ]
		    },
		    {
		        "featureType": "landscape",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#b0ddfc"
		            }
		        ]
		    },
		    {
		        "elementType": "labels",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "administrative",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "weight": 0.3
		            },
		            {
		                "color": "#61bcf9"
		            }
		        ]
		    },
		    {
		        "elementType": "labels.icon",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    }
		]};

		map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);

		return map;
	}
	$scope.map = initMap();



	/*
	 * Handle the news events
	 */
	EventSocket.forward('news', $scope);
    $scope.$on('socket:news', function (ev, data) {

    	var eventData = angular.fromJson(data);

    	// Add marker
		var latLng = new google.maps.LatLng(eventData.user.location.lat, eventData.user.location.lng);
		var marker = new google.maps.Marker({
		  position: latLng,
		  map: $scope.map,
      	  icon: getPinImage(eventData.event.type)
		});

		// Hide after a delay
		$timeout(function () {
			marker.setMap(null);
		}, 5000);

		// Save the counter
		for (var index in $scope.eventsTypeList) {
			var typeMatch = ( eventData.event.type == $scope.eventsTypeList[index].type );
			if (typeMatch) {
				$scope.eventsTypeList[index].count++;
			}
		}

		console.log("Added event '" + eventData.event.type + "' at " + latLng);
    });

	$scope.$on('socket:error', function (ev, data) {
		console.log('error')
    });

}]);
