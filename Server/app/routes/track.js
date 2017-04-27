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
        "gps": {
            "x": 54.581827,
            "y": -5.93746520000002
        },
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
    server.post('/poll',
        function(req, res) {

            var Query = {
                $or: []
            }

            var gps = req.body.gps;
            var beacon = req.body.beacon;
            var access_point = req.body.access_point;

            for (i in access_point) {
                Query.$or.push({
                    access_point: access_point[i]
                })
            }

            for (i in beacon) {
                Query.$or.push({
                    beacon: beacon[i]
                })
            }

            console.log("Poll request from user " + req.user.name);
            console.log(gps);
            console.log(beacon);
            console.log(access_point);
            console.log(Query);

            //If there is nothing to check, then return an empty array
            if (Query['$or'] == []) {
                console.log("no data sent for /poll");
                res.json([]);
                next();
            }

            //Let's check if there are any locations that match up ;)
            Location.find(Query, function(error, locations) {
                if (error) {
                    res.json({
                        title: "Failed",
                        message: "We had an error",
                        error: error
                    });
                }
                console.log("User location matched: " + locations.length + " [0] " + locations[0].name);
                res.json(locations);
            });


            //User should poll:
            //GPS
            //Beacons
            //Hotspots

            //App Searches for next meeting scheduled
            //Gets the meetings location
            //Get's the location information that's
            //not empty for the location

            //compares these with the not empty values the user sends
            //if the user replys with nothing then do nothing


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
          "location":req.params.id
      });
    });

}
