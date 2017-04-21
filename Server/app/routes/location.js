module.exports = function(server) {
    var Location = require('../models/location');
    var Event = require('../models/event');

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
        }).populate('place').exec(function(error, location) {
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

    server.get('/location/deep/:place', function(req, res) {
        Location.find({
            place: req.params.place
        }).deepPopulate('place').exec(function(error, location) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not find location.",
                    error: error
                });
            } else {
                res.json(location);
            }
        });
    });

    //Get events from today
    server.get('/location/:id/events', function(req, res) {
        var tonight = new Date();
        tonight.setHours(24, 0, 0, 0);

        var thisMorning = new Date();
        thisMorning.setHours(0, 0, 0, 0);

        Event.find({
            location: req.params.id,
            starts_at: {
                "$gte": thisMorning,
                "$lt": tonight
            },
        }).sort({
            starts_at: 1
        }).populate('owner').exec(function(error, locations) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not find location.",
                    error: error
                });
            }
            res.json(locations);
        });
    });

    server.get('/location/near/:x/:y/:distance', function(req, res) {
        Location.find({
                gps: {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [req.params.x, req.params.y],
                        },
                        "$maxDistance": req.params.distance,
                        "distanceField": "distance"
                    }
                }
            })
            .populate('place').exec(function(error, location) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Could not find location.",
                        error: error
                    });
                }
                console.log(location[0])
                res.json(location);
            });
    });

    //Adding a Location
    server.post('/location', function(req, res, next) {

        //Build Objects that have been stringified
        req.body.gps && JSON.parse(req.body.gps).length == 2 ? req.body.gps = JSON.parse(req.body.gps) : undefined;
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
        } else {
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

    server.put('/location', function(req, res, next) {
        req.body.gps && JSON.parse(req.body.gps).length == 2 ? req.body.gps = JSON.parse(req.body.gps) : undefined;
        req.body.services ? req.body.services = JSON.parse(req.body.services) : undefined;

        Location.findById(req.body.id, function(error, location) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not edit location",
                    error: error
                });
            }

            var save = function() {

                location.name = req.body.name;
                location.description = req.body.description;
                location.type = req.body.type;
                location.floor = req.body.floor;
                location.max_people = req.body.max_people;
                location.beacon = req.body.beacon;
                location.access_point = req.body.access_point;
                location.place = req.body.place;
                location.gps = req.body.gps;
                location.services = req.body.services;

                location.save(function(error, updatedLocation) {
                    if (error) {
                        res.json({
                            title: "Failed",
                            message: "Could not Edit Place",
                            error: error
                        });
                    }
                    res.json({
                        title: "Success",
                        message: updatedLocation.name + " updated.",
                        place: updatedLocation
                    });
                });
            }

            //If the image begins with data: then it's a new image to upload
            if (req.body.image != undefined && req.body.image.startsWith("data:")) {
                server.upload(req.body.image, function(img) {
                    if (img != false) {
                        location.image = img;
                    } else {
                        delete req.body.image;
                    }
                    save();
                });
            } else {
                save();
            }

        });
    });

}
