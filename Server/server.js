//Setup Vairables
var restify = require('restify');
//Passport
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
//MongoDB
var mongoose = require('mongoose');
var Test = require('./app/models/test');

var settings = {
  host: "cloud.dean.technology",
  port: 9000
}

//Connect to database
mongoose.connect('mongodb://localhost/MALBT_DB');

//Create Server
var server = restify.createServer();

//Enabling CORS
server.use(restify.CORS());
//Add headers for browsers to AJAX request freely.
server.opts(/.*/, function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
});

//Setup Bearer Passport
passport.use(new BearerStrategy(
  function(token, cb) {
    //Function that looks takes in a token, and calls back if there
    //is an error or a user.
    //Otherwise returns a user to the callback.
    findByToken(token, function(err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  }));

//Server Shit
server.get('/test',
  passport.authenticate('bearer', {
    session: false
  }),
  function(req, res) {
    res.json({
      username: req.user.name
    });
  });

server.post('/user/:name',
  passport.authenticate('bearer', {
    session: false
  }),
  function(req, res) {
    res.send('Hello ' + req.params.name + " " + req.user.tok);
    return next();
  });

server.get('/test/all',
  passport.authenticate('bearer', {
    session: false
  }),
  function(req, res) {
    Test.find({}, function(error, tests) {
	     if(error){
			res.send('Error'+error);
		}else{
			var output = "<br>";
			for(i in tests){
				output+=tests[i].name+"<br>";
			}
			res.send(tests);
		}	
	});
  });
  
server.post('/test/:name',
  passport.authenticate('bearer', {
    session: false
  }),
  function(req, res) {
    var test = new Test({
      name: req.params.name
    })

    test.save(function(error){
	    if(error){
			res.send('Could not add '+req.params.name+' to database');
		}else{
			res.send('Grab a beer for '+req.params.name);
		}	
	});
  });

server.get('/hello', function(req, res, next) {
  res.send('Hello there!');
});

//Startup Server
server.listen(settings.port, settings.host, function() {
  console.log('%s listening at %s', server.name, server.url);
});

//Helper Functions
function findByToken(token, cb) {
  //Do a check in the DB
  if (token == 12345) {
    //If successfull return blank for err and the user
    var u = {
      name: "Dean",
      tok: token
    }
    return cb(null, u);
  } else {
    return cb(null, null);
  }
}
