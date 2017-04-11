module.exports = function(server) {
    var Place = require('../models/place');

    //Get's places
    //Returns all users
    server.get('/place',
        function(req, res) {
            Place.find({}, function(error, users) {
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
                        location: user.location,
                        image: user.image
                    })
                }
                res.json(out);
            });
        });
        
}
