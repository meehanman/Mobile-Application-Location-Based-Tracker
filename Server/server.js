//Setup Vairables
var restify = require('restify');
var https = require('https');
var fs = require("fs")
  //MongoDB
  var mongoose = require('mongoose');

//Include Mongo Tables?
var Test = require('./app/models/test');

var settings = {
  host: "cloud.dean.technology",
  port: 9000
}

//Connect to database
mongoose.connect('mongodb://localhost/MALBT_DB');

//Keys Generated Using: https://www.sitepoint.com/how-to-use-ssltls-with-node-js/
//but then from letsEncrypt store
options = {
  key: fs.readFileSync("/etc/letsencrypt/live/cloud.dean.technology/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/cloud.dean.technology/cert.pem")
};

//Create Basic Server
var server = restify.createServer(options);

//Enabling CORS
server.use(restify.CORS());
server.use(restify.authorizationParser());
//Add headers for browsers to AJAX request freely.
server.opts(/.*/, function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
  res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
  res.send(200);
  return next();
});

//Authentication of Username and Password
server.use(function (req, res, next) {
  var users;
  // if (/* some condition determining whether the resource requires authentication */) {
  //    return next();
  // }

  users = {
    dean: {
      id: 1,
      password: 'password'
    }
  };

  // Ensure that user is not anonymous; and
  // That user exists; and
  // That user password matches the record in the database.
  if (req.username == 'anonymous' || !users[req.username] || req.authorization.basic.password !== users[req.username].password) {
    // Respond with { code: 'NotAuthorized', message: '' }
    next(new restify.NotAuthorizedError());
  } else {
    next();
  }

  next();
});

//Server Shit
server.get('/test',
  function (req, res) {
  res.json({
    username: req.user.name
  });
});

server.post('/user/:name',
  function (req, res) {
  res.send('Hello ' + req.params.name + " " + req.user.tok);
  return next();
});

server.get('/test/all',
  function (req, res) {
  Test.find({}, function (error, tests) {
    if (error) {
      res.send('Error' + error);
    } else {
      var output = "<br>";
      for (i in tests) {
        output += tests[i].name + "<br>";
      }
      res.send(tests);
    }
  });
});

server.post('/test/:name',
  function (req, res) {
  var test = new Test({
      name: req.params.name
    })

    test.save(function (error) {
      if (error) {
        res.send('Could not add ' + req.params.name + ' to database');
      } else {
        res.send('Grab a beer for ' + req.params.name);
      }
    });
});

server.get('/hello', function (req, res, next) {
  res.send('Hello there!');
});

//Start Server
server.listen(settings.port, settings.host, function () {
  console.log('%s listening at %s', server.name, server.url);
});
