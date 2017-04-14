module.exports = function(server) {
    var Place = require('../models/place');

    server.get('/place', function(req, res) {
        Place.find({}).populate('parentPlace', 'name').exec(function(error, places) {
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

    server.get('/place/:id', function(req, res) {
        Place.findOne({
            _id: req.params.id
        }).populate('parentPlace', 'name').exec(function(error, place) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not list all places.",
                    error: error
                });
            }

            res.json(place);
        });
    });

    server.post('/place', function(req, res, next) {
        var save = function() {
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
        if (!(req.body.parentPlace == undefined || req.body.parentPlace == 'undefined')) {
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
    });

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

    server.put('/place', function(req, res, next) {
        Place.findById(req.body.id, function(error, place) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not Edit Place",
                    error: error
                });
            }

            place.name = req.body.name;
            place.description = req.body.description;
            place.address.street = req.body.addressStreet;
            place.address.streetcity = req.body.addressCity;
            place.address.streetpostcode = req.body.addressPostcode;
            place.address.streetcountry = req.body.addressCountry;

            if (req.body.parentPlace) {
                place.parentPlace = req.body.parentPlace;
            } else {
                place.parentPlace = undefined;
            }

            place.save(function(error, updatedPlace) {
                if (error) {
                    console.log(error);
                    res.json({
                        title: "Failed",
                        message: "Could not Edit Place",
                        error: error
                    });
                }
                res.json({
                    title: "Success",
                    message: place.name + " updated.",
                    place: updatedPlace
                });
            });
        });
    });

}
