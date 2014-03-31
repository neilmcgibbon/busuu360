/** 
  * busuu360
  * Busuu innovation day app, for displaying 
  * busuu related events in realtime on 
  * a front-end map.
  */

// Node dependencies.
var io = require('socket.io').listen(80),
    dgram = require("dgram"),
    listener = dgram.createSocket("udp4"),
    geoip = require('geoip-lite');

/**
 * UDP Listener. Listens for UDP messages.
 * Once receieved, it relays/broacasts the
 * raw message to listening sockets, using
 * sockets.io interface.
 */
listener.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  listener.close();
});

listener.on("message", function (msg, rinfo) {
  console.log("Incoming UDP message: " + msg);

  // Connvert payload to JSON.
  var payload = JSON.parse(msg);

  // Get Geodata
  var geo = geoip.lookup(payload.user.ip);
  if (!geo) {
    return;
  }

  payload.user.location = {
    "country": geo.country,
    "city": geo.city,
    "lat": geo.ll[0],
    "lng": geo.ll[1]
  };

  // lookup
  // Bradcast the message to listening sockets
  io.sockets.emit('news', JSON.stringify(payload));
});

listener.bind(41234);



// NPM requires
var util = require('util'),
    twitter = require('twitter'),
    _s = require('string');


// Twitter client
var twit = new twitter({
    consumer_key: 'NK05lCnRDDUEzFyEzKBrw',
    consumer_secret: 'G9i0bAcqi4DzTCO9rPu7T0pgWBlaXYIDEzEU259nDY',
    access_token_key: '15747513-5KyqkKQ8z0awfIMzDjfr5W1iojsxgFyW5kgd2nMnk',
    access_token_secret: 'bNY1Zbr0SEtnUmcsfELiaROpVPyRlRymdKb5nEVINbg'
});

twit.stream('statuses/filter', {'track':'busuu'}, function(stream) {
  stream.on('data', function (data) {
    if (!data.geo || !data.geo.coordinates || !data.place || !data.place.name || !data.place.country) {
      return;
    }

    var payload = {
      "user": {
        "name": data.user.screen_name,
        "picture": data.user.profile_image_url,
        "ip":null,
        "location": {
          "country": data.place.country,
          "city": data.place.name,
          "lat": data.geo.coordinates[0],
          "lng": data.geo.coordinates[1]
        }
      },
      "event": {
        "type": "tweet",
        "text": data.text
      },
      "time": (new Date().getTime()/1000)
    }

    io.sockets.emit('news', JSON.stringify(payload));

  });
});

/*
setInterval(function() {

  var payload = {
    "user": { 
      "name": "Claudio",
      "picture": "http://static2.bscdn.net/files/pictures/picture-65556_5377197144.jpg",
      "ip": "195.110.69.86",
      "location": {
        "country": "UK",
        "city": "Lincoln",
        "lat": 51.5,
        "lng": -0.13
      }
    },
    "event": {
      "type": "posted",
      "text": "Submitted an exercise in German"
    },
    "timestamp": 1396016800
  };

  io.sockets.emit('news', JSON.stringify(payload));
}, 1000);
*/
