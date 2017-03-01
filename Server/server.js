//Setup Vairables
var restify = require('restify');
var https = require('https');
var fs = require("fs");
//MongoDB
var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = Promise;

//Include Mongo Tables?
var Test = require('./app/models/test');
var User = require('./app/models/user');

var settings = {
  host: "cloud.dean.technology",
  port: 9000
}

//Connect to database
mongoose.connect('mongodb://localhost/MALBT_DB');

//Keys Generated Using: https://www.sitepoint.com/how-to-use-ssltls-with-node-js/
//but then from letsEncrypt store
//Create Basic Server
var server = restify.createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/cloud.dean.technology/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/cloud.dean.technology/cert.pem")
});

//Enabling CORS
server.use(restify.CORS());
server.use(restify.authorizationParser());
//Body Parser for POST data
server.use(restify.bodyParser({
  mapParams: false
}));
//Add headers for browsers to AJAX request freely.
server.opts(/.*/, function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
  res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
  res.send(200);
  return next();
});

//Authentication of Username and Password

server.use(function (req, res, next) {

if(!req.authorization || !req.authorization.basic){
	next(new restify.NotAuthorizedError("You have not provided authorisation to access this API"));
}

if(!req.authorization.basic.username || !req.authorization.basic.password){
	next(new restify.NotAuthorizedError("Username and/or Password is empty"));
}

User.findOne({email: req.authorization.basic.username})
.then(function (user) {
// Ensure that user is not anonymous; and
// That user exists; and
// That user password matches the record in the database.
if (req.username == 'anonymous' || !user || req.authorization.basic.password !== user.password) {
// Respond with { code: 'NotAuthorized', message: '' }
console.log("Auth: [ ]");
next(new restify.NotAuthorizedError("Username and/or Password is incorrect"));
} else {
console.log("Auth: [/]");
//Assign user to request object
req.user = user;
next();
}
})
.error(function(error){
console.log("Database Error");
next(new restify.InternalError ("Could not check your creditentials [DBError]"));
});

});

//Server Shit
//Outputting JSON
server.get('/',
  function(req, res) {
    res.json({"version":1.0, "author":"Dean Meehan"});
  });
  
//Outputting JSON
server.get('/whoami',
  function(req, res) {
    res.json({
      loggedIn: req.user.name,
	  email: req.user.email,
	  id: req.user._id
    });
  });

//Read data from the body
server.post('/post',
  function(req, res) {
    res.send("You posted: " + req.body.name);
  });

//Outputting Everything
server.get('/test/all',
  function(req, res) {
    Test.find({}, function(error, tests) {
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

//Adding Something
server.post('/test/:name',
  function(req, res) {
    var test = new Test({
      name: req.params.name
    })

    test.save(function(error) {
      if (error) {
        res.send('Could not add ' + req.params.name + ' to database');
      } else {
        res.send('Grab a beer for ' + req.params.name);
      }
    });
  });

//Adding a User
server.post('/user',
  function(req, res) {
    //TODO: Add Validation
    /*
    name
    email
    password
    admin
    location
     */
    var user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      admin: true,
      location: req.body.location,
	  addedBy: {_id: req.user._id, name: req.user.name}
    })

    user.save(function(error) {
      if (error) {
        res.json({
          title: "Failed",
          message: "User Add Failed",
		  error: error
        });
      } else {
        res.json({
          title: "Success",
          username: user.name,
          message: "User Successfull Added"
        });
      }
    });
  });

//Returns all users
server.get('/user/all',
  function(req, res) {
    User.find({}, function(error, users) {
       if (error) {
        res.json({
          title: "Failed",
          message: "Could not list all users.",
		  error: error
        });
      } else {
        res.json(users);
      }
    });
  });
  
//Start Server
server.listen(settings.port, settings.host, function() {
  console.log('%s listening at %s', server.name, server.url);
});

//Client for Testing
//https://jsfiddle.net/meehanman/a9khznye/2/
