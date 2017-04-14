module.exports = function(server) {
    var Event = require('../models/event');
    var Location = require('../models/location');
    var User  = require('../models/user');

    //Returns all evemts
    server.get('/event', function(req, res) {
            Event.find({}, function(error, events) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Could not list all events.",
                        error: error
                    });
                }
                res.json(events);

            });
        });

    //Gets information about a certain event
    server.get('/event/:id',
        function(req, res) {
            Event.findOne({
                _id: req.params.id
            }, function(error, event) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Could not list event.",
                        error: error
                    });
                }
                Location.findOne({
                    _id: event.location._id
                }, function(error, location) {
                    if (error) {
                        res.json({
                            title: "Failed",
                            message: "Could not find event location",
                            _id: event.location._id,
                            name: event.location.name,
                            error: error
                        });
                    }
                    event = event.toJSON();
                    event.location = location.toJSON();
                    res.json(event);
                });
            });
        });

    //Adding an event
    server.post('/event',
        function(req, res, next) {

            Location.findOne({
                _id: req.body.location
            }, function(error, location) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "No location found with ID provided",
                        error: error
                    });
                }
                User.findOne({
                    _id: req.body.owner
                }, function(error, owner) {
                    if (error) {
                        res.json({
                            title: "Failed",
                            message: "No owner found with ID provided",
                            error: error
                        });
                    }
                    server.upload(req.body.image, function(img) {
                        if (img != false) {
                            req.body.image = img;
                        } else {
                            delete req.body.image;
                        }
                        var event = new Event({
                            name: req.body.name,
                            owner: req.body.owner,
                            description: req.body.description,
                            image: req.body.image,
                            type: req.body.type,
                            location: req.body.location,
                            addedBy: req.user._id,
                            attendees: [],
                            starts_at: new Date(req.body.starts_at),
                            ends_at: new Date(req.body.ends_at)
                        });

                        //Populate the Attendees
                        req.body.attendees = JSON.parse(req.body.attendees);
                        for(var i=0;i<req.body.attendees.length;i++){
                          var attende = req.body.attendees[i];
                          event.attendees.push({user: attende, status: "invited"});
                        }

                        event.save(function(error) {
                            if (error) {
                                res.json({
                                    title: "Failed",
                                    message: "Event Add Failed",
                                    error: error
                                });
                            }
                            res.json({
                                title: "Success",
                                id: event._id,
                                name: event.name,
                                message: "Event Successfully Added"
                            });
                        });
                    });
                });
            });
        });

    //Add another user to an event
    server.post('/event/:eventID/attendee',
        function(req, res, next) {
            if (!req.params.eventID || !req.body.attendee) {
                res.json({
                    title: "Failed",
                    message: "Please provide an event id and attendee to add.",
                    error: error
                });
            }
            Event.findOne({
                _id: req.params.eventID
            }, function(error, event) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Could not find event",
                        error: error
                    });
                }
                User.findOne({
                    _id: req.body.attendee
                }, function(error, user) {
                    if (error) {
                        res.json({
                            title: "Failed",
                            message: "Could not find user with ID: " + req.body.attendee,
                            error: error
                        });
                    }
                    event.attendees.push({
                        _id: user._id,
                        name: user.name,
                        status: req.global.eventStatus.invited
                    });
                    event.save(function(err, eventSave) {
                        if (error) {
                            res.json({
                                title: "Failed",
                                message: "Could not add user to event.",
                                error: error
                            });
                        }
                        res.json({
                            title: "Success",
                            name: event.name,
                            attendee: user.name,
                            message: "User successfully added to event."
                        });
                    });

                });

            });
        });


    //Remove user from event
    server.del('/event/:eventID/attendee',
        function(req, res, next) {
            if (!eventID || !req.body.attendee) {
                res.json({
                    title: "Failed",
                    message: "Please provide an event id and attendee to remove.",
                    error: error
                });
            }
            Event.findOne({
                _id: req.params.eventID
            }, function(error, event) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Could not find event",
                        error: error
                    });
                }
                User.findOne({
                    _id: req.body.attendee
                }, function(error, user) {
                    if (error) {
                        res.json({
                            title: "Failed",
                            message: "Could not find user with ID: " + req.body.attendee,
                            error: error
                        });
                    }
                    event.attendees = event.attendees.filter(function(el) {
                        return el._id !== user._id;
                    });

                    event.save(function(err, eventSave) {
                        if (error) {
                            res.json({
                                title: "Failed",
                                message: "Could not add user to event.",
                                error: error
                            });
                        }
                        res.json({
                            title: "Success",
                            name: event.name,
                            attendee: user.name,
                            message: "User successfully removed from event."
                        });
                    });

                });
            });
        });

    server.post('/event/:id/:status', function(req, res) {
        req.params.status = req.params.status.toLowerCase();
        if (req.params.status == "accept" || req.params.status == "decline") {

            if (req.params.status == "accept") {
                req.params.status = req.global.eventStatus.accepted;
            }

            if (req.params.status == "decline") {
                req.params.status = req.global.eventStatus.declined;
            }

            Event.findOne({
                _id: req.params.id
            }, function(error, event) {
                if (error) {
                    console.log("Error");
                    res.json({
                        title: "Failed",
                        message: "Could not list event.",
                        error: error
                    });
                }
                //Find the current user
                var match = false;
                for (var i = 0; i < event.attendees.length; i++) {
                    if (String(event.attendees[i]._id) == String(req.user._id)) {
                        event.attendees[i].status = req.params.status;
                        match = true;
                        break;
                    }
                }

                if (match) {
                    event.save(function(error) {
                        if (error) {
                            res.json({
                                title: "Failed",
                                message: "Could not update event",
                                error: error
                            });
                        }
                        res.json({
                            title: "Success",
                            status: req.params.status,
                            name: event.name,
                            message: "User status for event changed"
                        });
                    })
                } else {
                    res.json({
                        title: "Failed",
                        message: "User not invited to event",
                    });
                }

            });
        } else {
            res.json({
                title: "Failed",
                message: "Event status for user may only be set to accepted or declined",
                status: req.params.status,
                expected: [req.global.eventStatus.accepted, req.global.eventStatus.declined]
            });
        }
    });

    //Returns the events a user is invited to
    server.get('/user/events', function(req, res) {
        Event.find({
            'attendees': {
                $elemMatch: {
                    _id: req.user._id
                }
            }
        }, function(error, events) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not get events for user",
                    error: error
                });
            }
            res.json(events);
        });
    });
}
