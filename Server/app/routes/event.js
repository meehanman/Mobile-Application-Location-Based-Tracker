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
            starts_at: -1
        }).populate('attendees').populate('location', 'name').exec(function(error, events) {
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

    server.get('/event/upcoming', function(req, res) {
        var now = new Date();
        Event.find({
            starts_at: {
                $gte: now
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

    server.get('/event/previous', function(req, res) {
        var now = new Date();
        Event.find({
            starts_at: {
                $lte: now
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
        Event.findOne({
            _id: req.params.id
        }).populate('location', 'name').populate('attendees.user', 'name image').exec(function(error, event) {
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
    server.post('/event', function(req, res, next) {

        if (!req.body.image) {
            res.json({
                title: "Failed",
                message: "Event Add Failed. You must submit an image.",
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

            event.save(function(error, newEvent) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "Event Add Failed",
                    });
                }

                if (newEvent) {
                    res.json({
                        title: "Success",
                        id: newEvent._id,
                        name: newEvent.name,
                        message: "Event Successfully Added"
                    });
                }
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

    //Edits the status for the current user in an event
    server.put('/event/:id', function(req, res, next) {

        //Find event
        Event.findOne({
            _id: req.params.id
        }, function(error, foundEvent) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not find event",
                    error: error
                });
            }

            foundEvent.name = req.body.name;
            foundEvent.description = req.body.description;
            foundEvent.starts_at = req.body.starts_at;
            foundEvent.ends_at = req.body.ends_at;
            foundEvent.type = req.body.type;
            foundEvent.location = req.body.location;

            //Populate the Attendees
            req.body.attendees = JSON.parse(req.body.attendees);

            //Loop through what we have to make sure it's also sent. If not we delete it.
            for (var o = foundEvent.attendees.length - 1; o >= 0; o--) {
                var found = false;

                attendeeLoop: for (var i = req.body.attendees.length - 1; i >= 0; i--) {
                    //If the user is already in the list
                    if (req.body.attendees[i] == foundEvent.attendees[o].user.toString()) {
                        //If we have a match, set fount to true and exit Loop
                        found = true;
                        break attendeeLoop;
                    }
                }

                //If it was not found, we should delete them from the saved array
                if (!found) {
                    foundEvent.attendees.splice(o, 1);
                }
            }


            //Remove any attendees we already have (to ensure the status doesn't change)
            for (var i = req.body.attendees.length - 1; i >= 0; i--) {
                var attende = req.body.attendees[i];

                attendeeLoop: for (var o = foundEvent.attendees.length - 1; o >= 0; o--) {
                    //If the user is already in the list
                    if (foundEvent.attendees[o].user.toString() == attende) {
                        //Delete them
                        req.body.attendees.splice(i, 1);
                        break attendeeLoop;
                    }
                }
            }

            //Now add the attendees
            for (var i = 0; i < req.body.attendees.length; i++) {
                var attende = req.body.attendees[i];
                foundEvent.attendees.push({
                    user: attende,
                    status: "invited"
                });
            }


            foundEvent.save(function(error, success) {
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
        });
    });

    //Returns all events that the user is invited to
    server.get('/notifications', function(req, res) {
        var now = new Date();
        Event.find().and({
            starts_at: {
                $gte: now
            }
        }, {
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
