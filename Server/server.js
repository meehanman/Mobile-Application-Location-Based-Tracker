/*

Title: MALBT - Mobile Application Location Based Tracker
Author: Dean Meehan <dmeehan05@qub.ac.uk>

Repo:               https://github.com/meehanman/FYP-MALBT/
Testing Client:     https://jsfiddle.net/meehanman/a9khznye/2/
Dashboard Client:   https://cloud.dean.technology/dashboard/angularjs/
Mobile App Client:  https://github.com/meehanman/FYP-MALBT/tree/master/MobileApp

*/
//Setup Dependables
var restify = require('restify');
var https = require('https');
var fs = require("fs");
var passwordhash = require('password-hash-and-salt');

//MongoDB
var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = Promise;
mongoose.set("debug", true);

//Push notifications
var admin = require("firebase-admin");
var serviceAccount = require("./firebase-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-malbt.firebaseio.com"
});
//Setup plugins
var restify = require('restify');
var https = require('https');
var fs = require("fs");
var passwordhash = require('password-hash-and-salt');

//Define Settings
var settings = {
    host: "0.0.0.0",
    port: 9000
}

//Define Settings
var settings = {
    host: "0.0.0.0",
    port: 9000
}

//Connect to database
mongoose.connect('mongodb://localhost/MALBT_DB');

//Start Server
var server = restify.createServer({});
server.fs = fs;

//Include Mongo Tables
var User = require('./app/models/user');
var Place = require('./app/models/place');
var Location = require('./app/models/location');
var Track = require('./app/models/track');
var Event = require('./app/models/event');

server.opts(/.*/, function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
});

//Setup Middleware
var middleware = require('./app/use/auth');
server.use(restify.CORS());
server.use(restify.authorizationParser());
server.use(restify.bodyParser({mapParams: false}));
server.use(restify.queryParser());

//Authentication
server.use(function(req, res, next) {
    //Don't request Login for these routes
    if (req.route.path == "/favicon.ico" || req.route.path == "/" || req.route.path.substring(0, 5) == "/ping") {
        return next();
    }
    if (!req.authorization || !req.authorization.basic) {
        next(new restify.NotAuthorizedError("You have not provided authorisation to access this API"));
    }
    if (!req.authorization.basic.username || !req.authorization.basic.password) {
        next(new restify.NotAuthorizedError("Username and/or Password is empty"));
    }
    User.findOne({email: req.authorization.basic.username.toLowerCase()}).then(function(user) {
            // Ensure that user is not anonymous; and
            // That user exists; and
            if (!user) {
                // Respond with { code: 'NotAuthorized', message: '' }
                console.log("Auth: [ ]");
                next(new restify.NotAuthorizedError("Username and/or Password is incorrect"));
            }else{
              // Verifying the supplied password hash with the hash stored in the DB
              passwordhash(req.authorization.basic.password).verifyAgainst(user.password, function(error, verified) {
                  if (error){
                      throw new Error('Something went wrong!');
                  }
                  if (!verified) {
                      next(new restify.NotAuthorizedError("Username and/or Password is incorrect"));
                  }
                  if(verified){
                    console.log("Auth: [/]#");
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

//Include utils
require('./app/utils/utils.js')(server);

//Import routes
require('./app/routes/other.js')(server);
require('./app/routes/event.js')(server);
require('./app/routes/location.js')(server);
require('./app/routes/place.js')(server);
require('./app/routes/track.js')(server);
require('./app/routes/user.js')(server);
require('./app/routes/stats.js')(server);

//Start Server
server.listen(settings.port, settings.host, function() {
    console.log('%s listening at %s', server.name, server.url);
});
