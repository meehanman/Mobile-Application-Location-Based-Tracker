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
  host: "0.0.0.0",
  port: 9000
}

//Connect to database
mongoose.connect('mongodb://localhost/MALBT_DB');

//Keys Generated Using: https://www.sitepoint.com/how-to-use-ssltls-with-node-js/
//but then from letsEncrypt store
//Create Basic Server
/*
var server = restify.createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/cloud.dean.technology/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/cloud.dean.technology/cert.pem")
});
*/
var server = restify.createServer({});

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

//Test image code to be replaced by storing images in the db
server.post('/imageUpload',
  function(req, res, next) {
    var imageBuffer = decodeBase64Image(req.body.image);
    var filename = "image";
    if (imageBuffer.type.split("/")[0] == "image") {

      fs.writeFile('/var/www/html/images/' + filename + '.' + imageBuffer.type.split("/")[1], imageBuffer.data, function(err) {
        if (err) {
          console.log(err);
        } else {
          res.json({
            message: 'File uploaded successfully',
            filename: "http://cloud.dean.technology/images/" + filename + '.' + imageBuffer.type.split("/")[1]
          });
        }
        console.log(response);
        res.json(JSON.stringify(response));
      });
    }

    function decodeBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
    }
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
        image: {
          data: new Buffer(req.body.image.split(",")[1], "base64"),
          contentType: req.body.image.split(",")[0].split(":")[1].split(";")[0]
        },
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
            message: "User Successfully Added"
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
        var out = [];
        for (i in users) {
          var user = users[i];
          out.push({
            id: user._id,
            name: user.name,
            email: user.email,
            location: user.location
          })
        }
        res.json(out);
      }
    });
  });

//Returns a user by their ID
server.get('/user/:_id',
  function(req, res) {
    User.findOne({
      _id: req.params._id
    }, function(error, user) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not find user with id:" + req.params._id,
          error: error
        });
      } else {
        var x = user;
        res.json({
          id: user._id,
          name: user.name,
          email: user.email,
          admin: user.admin,
          groups: user.groups
        });
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

//Adding a User
server.post('/location',
  function(req, res, next) {

    req.body.services = JSON.parse(req.body.services);
    req.body.gps = JSON.parse(req.body.gps);
    req.body.place = JSON.parse(req.body.place);

    if (req.body.image) {
      var image = {};
      image.data = new Buffer(req.body.image.split(",")[1], "base64");
      image.contentType = req.body.image.split(",")[0].split(":")[1].split(";")[0];
    }

    var place = {};
    place.name = req.body.place.name;
    place.floor = req.body.place.floor;
    place.department = req.body.place.department;
    place.room_number = req.body.place.room_number;
    place.address = req.body.place.address;

    var location = new Location({
      name: req.body.name,
      description: req.body.description,
      image: image,
      type: req.body.type,
      max_people: req.body.max_people,
      services: req.body.services,
      beacon: req.body.beacon,
      access_point: req.body.access_point,
      gps: {
        x: req.body.gps.x,
        y: req.body.gps.y
      },
      place: place,
      addedBy: {
        _id: req.user._id,
        name: req.user.name
      }
    });

    location.save(function(error) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Location Add Failed",
          error: error
        });
      } else {
        res.json({
          title: "Success",
          name: location.name,
          message: "Location Successfully Added"
        });
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
