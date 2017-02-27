var restify = require('restify');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

var server = restify.createServer();

server.post('/hello', function create(req, res, next) {
   res.send(201, Math.random().toString(36).substr(3, 8));
   return next();
 });
 
server.put('/hello', send);
server.get('/hello/:name', send);
server.head('/hello/:name', send);
server.del('hello/:name', function rm(req, res, next) {
res.send(204);
return next();
});

server.listen(9000, function() {
  console.log('%s listening at %s', server.name, server.url);
});


 function send(req, res, next) {
   res.send('Hello ' + req.params.name);
   return next();
 }

 