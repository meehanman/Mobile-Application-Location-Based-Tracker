module.exports = function(server) {
    var Place = require('../models/place');

    //Get's places
    //Returns all users
    server.get('/place', function(req, res) {
        Place.find({}, function(error, places) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not list all places.",
                    error: error
                });
            }
            res.json(places);
        });
    });

    //Adding a Place
    server.post('/place', function(req, res, next) {
        var place = new Place({
            name: req.body.name,
            description: req.body.description,
            address: {
                street: req.body.addressStreet,
                city: req.body.addressCity,
                postcode: req.body.addressPostcode,
                country: req.body.addressCountry
            },
            addedBy: req.user._id
        });

        //If there is a parentPalce defined
        if (req.body.parentPlace != undefined) {
            Place.findOne({
                _id: req.body.parentPlace
            }, function(error, parentPlace) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Parent Place provided was incorrect",
                    });
                    next();
                }

                place.parentPlace = req.body.parentPlace;
                save();
            });
        } else {
          //Otherwise just save without adding a parent place
          save();
        }

        var save = function(s) {
            place.save(function(error) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Place Add Failed",
                        error: error
                    });
                }
                res.json({
                    title: "Success",
                    place: place,
                    message: "Place Successfully Added"
                });
            });
        }
    });

    //Adding a Place
    server.del('/place/:id', function(req, res, next) {
        Place.findByIdAndRemove({
            _id: req.params.id
        }, function(error, removed) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not delete place",
                    error: error
                });
            }
            res.json({
                title: "Success",
                message: removed.name + " deleted.",
                place: removed
            });
        });
    });

}
