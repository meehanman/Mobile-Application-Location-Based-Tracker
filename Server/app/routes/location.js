module.exports = function(server) {
    var Location = require('../models/location');

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
    server.post('/location', function(req, res, next) {
        console.log("THIS LOCATION ADD NEEDS TO BE FIXED");
        next();
        req.body.services = JSON.parse(req.body.services);
        req.body.gps = JSON.parse(req.body.gps);
        req.body.place = JSON.parse(req.body.place);

        server.upload(req.body.image, function(img) {
            if (img != false) {
                req.body.image = img;
            } else {
                delete req.body.image;
            }
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
                addedBy: req.user._id
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
    });
}
