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

server.get('/location/:id', function(req, res) {
    Location.findOne({
        _id: req.params.id
    }).populate('place', 'name').exec(function(error, location) {
        if (error) {
            res.json({
                title: "Failed",
                message: "Could not find location.",
                error: error
            });
        }
        res.json(location);
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

    //Build Objects that have been stringified
    req.body.gps ? req.body.gps = JSON.parse(req.body.gps) : undefined;
    req.body.services ? req.body.services = JSON.parse(req.body.services) : undefined;

    var save = function() {
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
    }

    var location = new Location();
    location.name = req.body.name;
    location.type = req.body.type;
    location.place = req.body.place;
    location.addedBy = req.user._id;

    location.description = req.body.description;
    location.floor = req.body.floor;
    location.max_people = req.body.max_people;
    location.services = req.body.services;
    location.beacon = req.body.beacon;
    location.access_point = req.body.access_point;
    location.gps = req.body.gps;

    //If there was an image provided, then try and save it
    //otherwise delete the image and just save without
    if (req.body.image != undefined) {
      server.upload(req.body.image, function(img) {
          if (img != false) {
              location.image = img;
          } else {
              delete req.body.image;
          }
          save();
        });
    }else{
      save();
    }
});

server.del('/location/:id', function(req, res, next) {
    Location.findByIdAndRemove({
        _id: req.params.id
    }, function(error, removed) {
        if (error) {
            res.json({
                title: "Failed",
                message: "Could not delete location",
                error: error
            });
        }
        res.json({
            title: "Success",
            message: removed.name + " deleted.",
            location: removed
        });
    });
});
}
