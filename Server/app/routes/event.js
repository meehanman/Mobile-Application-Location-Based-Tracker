module.exports = function(server) {
    var Event = require('../models/event');
    var Location = require('../models/location');
    var User = require('../models/user');

    //Returns current users events
    server.get('/event', function(req, res) {
        Event.find({
            'attendees': {
                $elemMatch: {
                    user: req.user._id
                }
            }
        }).sort({
            starts_at: 1
        }).populate('attendees').exec(function(error, events) {
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

    //Returns all evemts sorted by time
    server.get('/event/all', function(req, res) {
        Event.find({}).sort({
            starts_at: 1
        }).populate('attendees').exec(function(error, events) {
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

    //Returns all evemts sorted by time
    server.get('/event/upcoming', function(req, res) {
        var startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        Event.find({
            starts_at: {
                $gte: startOfToday
            }
        }).sort({
            starts_at: 1
        }).populate('attendees').lean().exec(function(error, events) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not list all events.",
                    error: error
                });
            }

            //Loop though each event and push a simplified event name status object to output
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                for (var a = 0; a < event.attendees.length; a++) {
                    var attendee = event.attendees[a];
                    if (attendee.user.toString() == req.user._id.toString()) {
                        events[i].requestedUserStatus = attendee.status;
                        break;
                    }
                }
            }

            res.json(events);

        });
    });

    //Returns all evemts sorted by time
    server.get('/event/previous', function(req, res) {
        var startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        Event.find({
            starts_at: {
                $lte: startOfToday
            }
        }).sort({
            starts_at: 1
        }).populate('attendees').exec(function(error, events) {
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

    //Adds a new event
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
                        for (var i = 0; i < req.body.attendees.length; i++) {
                            var attende = req.body.attendees[i];
                            event.attendees.push({
                                user: attende,
                                status: "invited"
                            });
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

    server.del('/event/:id', function(req, res, next) {
        Event.findByIdAndRemove({
            _id: req.params.id
        }, function(error, removed) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not delete event",
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

    //Edits the status for a user in an event
    server.put('/event/:eventID/:status', function(req, res, next) {
        console.log(req.params.user);
        if (!req.params.eventID || !req.params.status) {
            res.json({
                title: "Failed",
                message: "Please provide an event id and status.",
            });
        }

        //A user can set the status to "invited","accepted","declined","attended"
        var status_enum = ["invited", "accepted", "declined", "attended"];
        if (status_enum.indexOf(req.params.status) < 0) {
            res.json({
                title: "Failed",
                message: "You can only set the status to invited, accepted, declined or attended "
            });
        }

        //Find event
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

            //Find if the user is part of the event already
            var hasChanged = false;
            for (var i = 0; i < event.attendees.length; i++) {
                if (event.attendees[i].user.toString() == req.user._id.toString()) {
                    event.attendees[i].status = req.params.status;
                    hasChanged = true;
                }
            }
            if (hasChanged) {
                event.save(function(error, success) {
                    if (error) {
                        res.json({
                            title: "Failed",
                            message: "Could not save event",
                            error: error
                        });
                    }
                    res.json({
                        title: "Success",
                        message: "Updated Status Successfully",
                    });
                });
            } else {
                res.json({
                    title: "Success",
                    message: "Found event, user not found",
                    users: event.attendees
                });
            }
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

    //Returns all events that the user needs to accept or deny
    server.get('/notifications', function(req, res) {
        Event.find({
            'attendees': {
                $elemMatch: {
                    user: req.user._id
                }
            }
        }).sort({
            starts_at: 1
        }).exec(function(error, events) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not list all events. " + req.user._id,
                    error: error
                });
            }
            var rtnObj = [];
            var status = undefined;

            //Loop though each event and push a simplified event name status object to output
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                for (var a = 0; a < event.attendees.length; a++) {
                    var attendee = event.attendees[a];
                    if (attendee.user.toString() == req.user._id.toString()) {
                        rtnObj.push({
                            "event": event._id,
                            "name": event.name,
                            "status": attendee.status
                        });
                        break;
                    }
                }
            }
            res.json(rtnObj);
        });
    });
}
