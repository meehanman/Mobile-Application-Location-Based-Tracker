module.exports = function(server) {
    var Track = require('../models/track');
    var Location = require('../models/location');
    var Event = require('../models/event');
    var Location = require('../models/location');
    var User = require('../models/user');

    //Polling
    //Returns all evemts
    /*
    POST DATA
    {
        "gps": [lat, lon],
        "beacon": [
            "e!3por3wpkrwpokrwpork3"
        ],
        "access_point": [
            "dw:dw:dw:wd:wd:dw:dw:wd",
            "dw:dw:dw:wd:wd:dw:dw:wd",
            "dw:dw:dw:wd:wd:dw:dw:wd"
        ]
    }
    */
    server.post('/poll', function(req, res) {
      console.log("////");
      console.log("");
      console.log("");
      console.log("");

      console.log(req.body);

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
            console.log("no data sent for /poll");
            res.json([]);
            next();
        }

        //Let's check if there are any locations that match up ;)
        Location.find(Query).populate('attendees').lean().exec(function(error, locations) {
          if(locations != undefined){
          console.log("FOUND L:"+locations.length,locations);
        }else{
          console.log("No Location Found");
        }
            if (error || locations.length == 0) {
              console.log("0 or error",locations );
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
                            console.log("FOUND E:"+events.length);
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
            console.log("no data sent for /poll");
            res.json([]);
            next();
        }

        //Let's check if there are any locations that match up ;)
        Location.find(Query).populate('attendees').lean().exec(function(error, locations) {
          if(locations != undefined){
          console.log("FOUND L:"+locations.length,locations);
        }else{
          console.log("No Location Found");
        }
            if (error || locations.length == 0) {
              console.log("0 or error",locations );
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
                            console.log("FOUND E:"+events.length);
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

    //Testing background service
    var x = "Default"
    server.get("/ping/:pong", function(req, res) {
        x = req.params.pong;
        res.json({
            "ping": x
        });
    });

    server.get("/ping", function(req, res) {
        res.json({
            "pong": x
        });
    });


    server.put('/location/stats/:id', function(req, res, next) {
        res.json({
            "location": req.params.id
        });
    });

}
