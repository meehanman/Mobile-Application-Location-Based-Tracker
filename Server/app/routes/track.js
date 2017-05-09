module.exports = function(server) {
    var Track = require('../models/track');
    var Location = require('../models/location');
    var Event = require('../models/event');
    var Location = require('../models/location');
    var User = require('../models/user');


    server.post('/poll', function(req, res) {

        if(req.body == undefined){
          next();
          return;
        }

        var Query = {
            $or: []
        }

        var gps = req.body.gps;
        var beacon = req.body.beacon;
        var access_point = req.body.access_point;

        //Parse String
        if(gps!=undefined && typeof gps == "string"){
          gps = JSON.parse(gps);
        }
        if(beacon!=undefined && typeof beacon == "string"){
          beacon = JSON.parse(beacon);
        }

        if(access_point!=undefined && typeof access_point == "string"){
          access_point = JSON.parse(access_point);
        }

        if (gps !== undefined && gps.length == 2) {
            Query.$or.push({
              'gps': {
                  "$near": {
                      "$geometry": {
                          "type": "Point",
                          "coordinates": gps,
                      },
                      "$maxDistance": 50,
                      "distanceField": "distance",
                      spherical: true,
                  }
              }
            });
        }

        for (i in access_point) {
            Query.$or.push({
                'access_point': access_point[i].toUpperCase()
            })
        }

        for (i in beacon) {
            Query.$or.push({
                'beacon': beacon[i].toUpperCase()
            })
        }
        //If there is nothing to check, then return an empty array
        if (Query['$or'] == []) {
            res.json([]);
            next();
        }

        //Let's check if there are any locations that match up ;)
        Location.find(Query).populate('attendees').lean().exec(function(error, locations) {
          if(locations != undefined){
        }else{
        }
            if (error || locations.length == 0) {
                res.json({
                    title: "Failed",
                    message: "No Location Matches",
                });
            } else {
                //For every location found
                for (var locNum = 0; locNum < locations.length; locNum++) {
                    Event.find({
                        'attendees': {
                            $elemMatch: {
                                user: req.user._id
                            }
                        }
                    }).and({
                        starts_at: {
                            $lte: new Date()
                        }
                    }).and({
                        ends_at: {
                            $gte: new Date()
                        }
                    }).and({
                        'location': locations[locNum]._id
                    }).exec(function(error, events) {
                        if (error || events.length==0) {
                            res.json({
                                title: "",
                                message: "No current events matched for location input",
                            });
                        } else {
                            for (var e = 0; e < events.length; e++) {
                                var event = events[e];
                                for (var u = 0; u < event.attendees.length; u++) {
                                    if (event.attendees[u].user.toString() == req.user._id.toString()) {
                                        event.attendees[u].status = "attended";
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
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
    });


    server.post('/poll/gps', function(req, res) {

        if(req.body == undefined){
          next();
          return;
        }

        var Query = {
            $or: []
        }
        var gps = req.body.gps;
        //Parse String
        if(gps!=undefined && typeof gps == "string"){
          gps = JSON.parse(gps);
        }

        if (gps !== undefined && gps.length == 2) {
            Query.$or.push({
              'gps': {
                  "$near": {
                      "$geometry": {
                          "type": "Point",
                          "coordinates": gps,
                      },
                      "$maxDistance": 50,
                      "distanceField": "distance",
                      spherical: true,
                  }
              }
            });
        }

        //If there is nothing to check, then return an empty array
        if (Query['$or'] == []) {
            res.json([]);
            next();
        }

        //Let's check if there are any locations that match up ;)
        Location.find(Query).populate('attendees').lean().exec(function(error, locations) {
            if (error || locations.length == 0) {
                res.json({
                    title: "Failed",
                    message: "No Location Matches",
                });
            } else {
                //For every location found
                for (var locNum = 0; locNum < locations.length; locNum++) {
                    Event.find({
                        'attendees': {
                            $elemMatch: {
                                user: req.user._id
                            }
                        }
                    }).and({
                        starts_at: {
                            $lte: new Date()
                        }
                    }).and({
                        ends_at: {
                            $gte: new Date()
                        }
                    }).and({
                        'location': locations[locNum]._id
                    }).exec(function(error, events) {
                        if (error || events.length==0) {
                            res.json({
                                title: "",
                                message: "No current events matched for location input",
                            });
                        } else {
                            for (var e = 0; e < events.length; e++) {
                                var event = events[e];
                                for (var u = 0; u < event.attendees.length; u++) {
                                    if (event.attendees[u].user.toString() == req.user._id.toString()) {
                                        event.attendees[u].status = "attended";
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
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
    });
}
