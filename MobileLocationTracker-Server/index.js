var restify = require('restify');
var server = restify.createServer();

server.use(restify.authorizationParser());

server.use(function (req, res, next) {
    var users;

    // if (/* some condition determining whether the resource requires authentication */) {
    //    return next();
    // }

    users = {
        foo: {
            id: 1,
            password: 'bar'
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

server.get('/ping', function (req, res, next) {
    res.send('pong');

    next();
});


function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

//Server.listen

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});