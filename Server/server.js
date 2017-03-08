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
      }
      // Verifying the supplied password hash with the hash stored in the DB
      passwordhash(req.authorization.basic.password).verifyAgainst(user.password, function(error, verified) {
        if (error)
          throw new Error('Something went wrong!');
        if (!verified) {
          console.log("Auth# [ ]");
        }
        console.log("Auth: [/]");
        //Assign user to request object
        req.user = user;
        next();

      });
    })
    .error(function(error) {
      console.log("Database Error");
      next(new restify.InternalError("Could not check your creditentials [DBError]"));
    });

});
//Global Variables
server.use(function(req, res, next) {
  req.global = {};
  req.global.eventStatus = {
    invited: "invited",
    accepted: "accepted",
    declined: "declined",
    attended: "attended"
  }
  req.global.eventType = {
    meeting: "meeting",
    event: "event",
    party: "party",
    conference: "converence",
    lecture: "lecture",
    other: "other"
  }
  next();
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
      loggedIn: true,
      id: req.user._id,
      name: req.user.name,
      admin: req.user.admin,
      location: req.user.location,
      groups: req.user.groups,
      email: req.user.email
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
        }
        res.json({
          message: 'File uploaded successfully',
          filename: "http://cloud.dean.technology/images/" + filename + '.' + imageBuffer.type.split("/")[1]
        });
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
        }
        res.json({
          title: "Success",
          username: user.name,
          message: "User Successfully Added"
        });
      });

    });
  });

//Returns all users
server.get('/user',
  function(req, res) {
    User.find({}, function(error, users) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not list all users.",
          error: error
        });
      }
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
    });
  });

//Returns a user by their ID
server.get('/user/events', function(req, res) {
  Event.find({
    'attendees': {
      $elemMatch: {
        _id: req.user._id
      }
    }
  }, function(error, events) {
    if (error) {
      res.json({
        title: "Failed",
        message: "Could not get events for user",
        error: error
      });
    }
    res.json(events);
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
      }
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        admin: user.admin,
        groups: user.groups
      });
    });
  });

//Returns all locations
server.get('/location', function(req, res) {
  Location.find({}, function(error, locations) {
    if (error) {
      res.json({
        title: "Failed",
        message: "Could not list all locations.",
        error: error
      });
    }
    res.json(locations);

  });
});

//Returns all locations
server.get('/location/:id', function(req, res) {
  Location.find({
    _id: req.params.id
  }, function(error, locations) {
    if (error) {
      res.json({
        title: "Failed",
        message: "Could not list location.",
        error: error
      });
    }
    res.json(locations);
  });
});

//Adding a Location
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
      }
      res.json({
        title: "Success",
        name: location.name,
        message: "Location Successfully Added"
      });
    });
  });

//Returns all evemts
server.get('/event/:id',
  function(req, res) {
    Event.findOne({
      _id: req.params.id
    }, function(error, event) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not list event.",
          error: error
        });
      }
      Location.findOne({
        _id: event.location._id
      }, function(error, location) {
        if (error) {
          res.json({
            title: "Failed",
            message: "Could not find event location",
            _id: event.location._id,
            name: event.location.name,
            error: error
          });
        }
        event = event.toJSON();
        event.location = location.toJSON();
        res.json(event);
      });
    });
  });

//Returns all evemts
server.get('/event',
  function(req, res) {
    Event.find({}, function(error, events) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not list all events.",
          error: error
        });
      }
      res.json(events);

    });
  });

//Adding a Location
server.post('/event',
  function(req, res, next) {
    //If type is not defined then throw error
    if (!(req.body.type.toLowerCase() in req.global.eventType)) {
      res.json({
        title: "Failed",
        message: "Event type must be of type " + Object.keys(req.global.eventType),
        error: error
      });
    }

    Location.findOne({
      _id: req.body.location
    }, function(error, location) {
      if (error) {
        res.json({
          title: "Failed",
          message: "No location found with ID provided",
          error: error
        });
      }
      User.findOne({
        _id: req.body.owner
      }, function(error, owner) {
        if (error) {
          res.json({
            title: "Failed",
            message: "No owner found with ID provided",
            error: error
          });
        }
        var event = new Event({
          name: req.body.name,
          owner: {
            _id: owner._id,
            name: owner.name
          },
          description: req.body.description,
          image: null,
          type: req.body.type,
          location: {
            _id: location._id,
            name: location.name
          },
          addedBy: {
            _id: req.user._id,
            name: req.user.name
          },
          attendees: req.body.attendees,
          starts_at: new Date(req.body.starts_at),
          ends_at: new Date(req.body.ends_at)
        });

        event.save(function(error) {
          if (error) {
            res.json({
              title: "Failed",
              message: "Event Add Failed",
              error: error
            });
          }
          res.json({
            title: "Success",
            id: event._id,
            name: event.name,
            message: "Event Successfully Added"
          });
        });
      });
    });
  });

//Add another user to an event
server.post('/event/:eventID/attendee',
  function(req, res, next) {
    if (!req.params.eventID || !req.body.attendee) {
      res.json({
        title: "Failed",
        message: "Please provide an event id and attendee to add.",
        error: error
      });
    }
    Event.findOne({
      _id: req.params.eventID
    }, function(error, event) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not find event",
          error: error
        });
      }
      User.findOne({
        _id: req.body.attendee
      }, function(error, user) {
        if (error) {
          res.json({
            title: "Failed",
            message: "Could not find user with ID: " + req.body.attendee,
            error: error
          });
        }
        event.attendees.push({
          _id: user._id,
          name: user.name,
          status: req.global.eventStatus.invited
        });
        event.save(function(err, eventSave) {
          if (error) {
            res.json({
              title: "Failed",
              message: "Could not add user to event.",
              error: error
            });
          }
          res.json({
            title: "Success",
            name: event.name,
            attendee: user.name,
            message: "User successfully added to event."
          });
        });

      });

    });
  });


//Remove user from event
server.del('/event/:eventID/attendee',
  function(req, res, next) {
    if (!eventID || !req.body.attendee) {
      res.json({
        title: "Failed",
        message: "Please provide an event id and attendee to remove.",
        error: error
      });
    }
    Event.findOne({
      _id: req.params.eventID
    }, function(error, event) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not find event",
          error: error
        });
      }
      User.findOne({
        _id: req.body.attendee
      }, function(error, user) {
        if (error) {
          res.json({
            title: "Failed",
            message: "Could not find user with ID: " + req.body.attendee,
            error: error
          });
        }
        event.attendees = event.attendees.filter(function(el) {
          return el._id !== user._id;
        });

        event.save(function(err, eventSave) {
          if (error) {
            res.json({
              title: "Failed",
              message: "Could not add user to event.",
              error: error
            });
          }
          res.json({
            title: "Success",
            name: event.name,
            attendee: user.name,
            message: "User successfully removed from event."
          });
        });

      });
    });
  });

server.post('/event/:id/:status', function(req,res){
    req.params.status = req.params.status.toLowerCase();
    if(req.params.status=="accept"||req.params.status=="decline"){

      if(req.params.status=="accept"){
        req.params.status = req.global.eventStatus.accepted;
      }

      if(req.params.status=="decline"){
        req.params.status = req.global.eventStatus.declined;
      }

      Event.findOne({
        _id: req.params.id
      }, function(error, event) {
        if (error) {
          console.log("Error");
          res.json({
            title: "Failed",
            message: "Could not list event.",
            error: error
          });
        }
          //Find the current user
          var match=false;
          for(var i=0;i<event.attendees.length;i++){
            if(String(event.attendees[i]._id)==String(req.user._id)){
              event.attendees[i].status = req.params.status;
              match=true;
              break;
            }
          }

          if(match){
            event.save(function(error){
              if(error){
                res.json({
                  title: "Failed",
                  message: "Could not update event",
                  error: error
                });
              }
              res.json({
                title: "Success",
                status: req.params.status,
                name: event.name,
                message: "User status for event changed"
              });
            })
          }else{
            res.json({
              title: "Failed",
              message: "User not invited to event",
            });
          }

      });
    }else{
      res.json({
        title: "Failed",
        message: "Event status for user may only be set to accepted or declined",
        status: req.params.status,
        expected: [req.global.eventStatus.accepted, req.global.eventStatus.declined]
      });
    }
});

//Polling
//Returns all evemts
server.post('/poll',
  function(req, res) {

    var gps = req.body.gps ? JSON.parse(req.body.gps) : [];
    var beacon = req.body.beacon ? JSON.parse(req.body.beacon) : [];
    var access_point = req.body.access_point ? JSON.parse(req.body.access_point) : [];

    var Query = {
      $or: []
    }
    for (i in access_point) {
      Query.$or.push({
        access_point: access_point[i]
      })
    }

    //Let's check if there are any locations that match up ;)
    Location.find(Query, "name access_point gps", function(error, locations) {
      if (error) {
        res.json({
          title: "Failed",
          message: "Could not list all locations.",
          error: error
        });
      }
      res.json(locations);
    });


    //User should poll:
    //GPS
    //Beacons
    //Hotspots

    //App Searches for next meeting scheduled
    //Gets the meetings location
    //Get's the location information that's
    //not empty for the location

    //compares these with the not empty values the user sends
    //if the user replys with nothing then do nothing


  });
//Start Server
server.listen(settings.port, settings.host, function() {
  console.log('%s listening at %s', server.name, server.url);
});

//Client for Testing
//https://jsfiddle.net/meehanman/a9khznye/2/
