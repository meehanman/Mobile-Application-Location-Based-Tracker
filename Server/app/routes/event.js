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

    //Returns all events sorted by time after this morning
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

    //Returns all events sorted by time from yesterday
    server.get('/event/previous', function(req, res) {
        var startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        Event.find({
            starts_at: {
                $lte: startOfToday
            }
        }).sort({
            starts_at: -1
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

    //Gets all information about a certain event
    server.get('/event/:id', function(req, res) {
            Event.findOne({_id: req.params.id}).populate('location').populate('attendees.user', 'name image').exec(function(error, event) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Could not list event.",
                        error: error
                    });
                }

                res.json(event);
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

    //Edits the status for the current user in an event
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

    //Returns all events that the user is invited to
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
