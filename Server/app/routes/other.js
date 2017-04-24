module.exports = function(server){
  //Set a default page for hitting /
  server.get('/',
      function(req, res) {
          res.json({
              "version": 1.0,
              "author": "Dean Meehan"
          });
      });

  //Browsers request favicons, so respond
  server.get('/favicon.ico', function(req, res) {
    res.json({});
  });

  //Get current user inforamtion
  server.get('/whoami', function(req, res) {
          res.json({
              loggedIn: true,
              id: req.user._id,
              name: server.toCamelCase(req.user.name),
              admin: req.user.admin,
              location: req.user.location,
              groups: req.user.groups,
              image: req.user.image,
              email: req.user.email
          });
      });
}
