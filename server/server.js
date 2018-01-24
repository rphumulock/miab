var express = require('express');
var bodyParser = require('body-parser');
var helpers = require('../helpers');
var app = express();

var isProd = process.env.NODE_ENV === 'production';
var serverPort = 0;
var indexRoot = 'wwwroot';

if (isProd) {
  app.use(express.static(helpers.root('./wwwroot')));
  serverPort = process.env.PORT;
} else {
  indexRoot = 'webdev';
  app.use(express.static(helpers.root('./webdev')));
  serverPort = 8000;
}

app.get(
  '*',
  function (req, res) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
    //res.set('Cache-Control', 'no-cache');
    res.sendFile(helpers.root(indexRoot + '/index.html'));
  });

// enable body parsing
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/logging', function (req, res) {

  // https://www.miabgame.com/logging
  // Content-Type: application/json
  var message = req.body;
  
  if (!message.timestamp || !message.level) {
    // invalid body type;
    console.warn('invalid post request received!');
    console.warn(req.body);
    // successfully recieved
    res.sendStatus(200);
    return;
  }
  
  message.ipaddress = req.ip;

  switch (message.level) {
    case 'error':
      console.error(JSON.stringify(message));
      break;
    case 'log':
      console.log(JSON.stringify(message));
      break;
    case 'warn':
      console.warn(JSON.stringify(message));
      break;
  }

  // successfully recieved
  res.sendStatus(200);
  

});

app.listen(serverPort);

if (!isProd) {
  console.log('Server On: 8000');
};
