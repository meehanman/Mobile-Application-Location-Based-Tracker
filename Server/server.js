//Setup Vairables
var restify = require('restify');
var https = require('https');
var fs = require("fs");
var passwordhash = require('password-hash-and-salt');
//MongoDB
var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = Promise;
mongoose.set("debug", true);
//Include Mongo Tables
var User = require('./app/models/user');
var Location = require('./app/models/location');
var Event = require('./app/models/event');

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

server.use(function(req, res, next) {
  //Deny Login for certain routes
  if (req.route.path == "/") {
    return next();
  }

  if (!req.authorization || !req.authorization.basic) {
    next(new restify.NotAuthorizedError("You have not provided authorisation to access this API"));
  }

  if (!req.authorization.basic.username || !req.authorization.basic.password) {
    next(new restify.NotAuthorizedError("Username and/or Password is empty"));
  }



  User.findOne({
      email: req.authorization.basic.username
    })
    .then(function(user) {
      // Ensure that user is not anonymous; and
      // That user exists; and
      if (req.username == 'anonymous' || !user) {
        // Respond with { code: 'NotAuthorized', message: '' }
        console.log("Auth: [ ]");
        next(new restify.NotAuthorizedError("Username and/or Password is incorrect"));
      } else {
        // Verifying the supplied password hash with the hash stored in the DB
        passwordhash(req.authorization.basic.password).verifyAgainst(user.password, function(error, verified) {
          if (error)
            throw new Error('Something went wrong!');
          if (!verified) {
            console.log("Auth# [ ]");
          } else {
            console.log("Auth: [/]");
            //Assign user to request object
            req.user = user;
            next();
          }
        });


      }
    })
    .error(function(error) {
      console.log("Database Error");
      next(new restify.InternalError("Could not check your creditentials [DBError]"));
    });

});

//Server Shit
//Outputting JSON
server.get('/',
  function(req, res) {
    res.json({
      "version": 1.0,
      "author": "Dean Meehan"
    });
  });

//Get current user inforamtion
server.get('/whoami',
  function(req, res) {
    res.json({
      loggedIn: req.user.name,
      email: req.user.email,
      id: req.user._id
    });
  });

//Adding a User
server.post('/user',
  function(req, res, next) {
    //Salt and Hash Password
    passwordhash(req.body.password).hash(function(error, hash) {
      if (error) {
        console.log("Could not hash password")
        res.json({
          title: "Failed",
          message: "Could not hash password.",
          error: error
        });
      }

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
        password: hash,
        admin: true,
        location: req.body.location,
        image: new Buffer("data:image/gif;base64,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", "base64"),
        groups: {
          id: 0,
          name: "CS"
        },
        addedBy: {
          _id: req.user._id,
          name: req.user.name
        }
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

//Returns all locations
server.get('/location/all',
  function(req, res) {
    Location.find({}, function(error, locations) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not list all locations.",
          error: error
        });
      } else {
        res.json(locations);
      }
    });
  });

//Returns all evemts
server.get('/event/all',
  function(req, res) {
    Event.find({}, function(error, events) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not list all events.",
          error: error
        });
      } else {
        res.json(events);
      }
    });
  });

//Start Server
server.listen(settings.port, settings.host, function() {
  console.log('%s listening at %s', server.name, server.url);
});

//Client for Testing
//https://jsfiddle.net/meehanman/a9khznye/2/
