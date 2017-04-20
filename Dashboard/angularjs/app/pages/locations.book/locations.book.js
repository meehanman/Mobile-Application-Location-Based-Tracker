app.controller('LocationsBookCtrl', ['$scope', '$stateParams', 'Users', 'Locations', 'Events', '$interval', '$state', function($scope, $stateParams, Users, Locations, Events, $interval, $state) {
    $scope.date = new Date();
    $scope.location;
    $scope.events;
    $scope.timeBookedAlready;
    $scope.eventStep = 0;
    $scope.form = {};
    $scope.users = [];

    $scope.btnText = "Next";
    $scope.question = "BOOK ROOM";
    $scope.valuePlaceholder = "Please enter your email";
    $scope.statusMessage;

    var tick = function() {
        $scope.date = Date.now() // get the current time
    }

    $scope.back = function() {
        $state.go('locations-info', {
            id: $stateParams.id
        });
    }

    Locations.getOne($stateParams.id, function(location) {
        $scope.location = location.data;
    });

    //Get the available times for today
    Locations.getEvents($stateParams.id, function(events) {
        $scope.events = events.data;
    });

    $scope.next = function() {
        console.log("Next", $scope.eventStep);
        var step = $scope.eventStep;
        $scope.statusMessage = "Loading..."
        if ($scope.value == "" || $scope.value == undefined) {
            $scope.statusMessage
        }
        //Email
        if (step == 0) {
            Users.getIDfromEmail($scope.value, function(response) {
                if (response.status == 200) {
                    //Get user id and name
                    $scope.form.owner = response.data.id;
                    $scope.form.ownerName = response.data.name;

                    //Reset
                    $scope.statusMessage = "";
                    $scope.value = "";

                    //Setup next question
                    $scope.valuePlaceholder = "Hi " + $scope.form.ownerName + ", please enter event name"
                    $scope.question = "Enter Event Name";
                    $scope.eventStep++;
                } else {
                    $scope.statusMessage = response.data.message;
                }

            });
        }

        if (step == 1) {
            //Reset
            $scope.statusMessage = "";
            $scope.value = ""

            //Setup next question
            $scope.question = "Event Description";
            $scope.valuePlaceholder = "Enter a description about the event. "
            $scope.eventStep++;
        }

        if (step == 2) {
            //Reset
            $scope.statusMessage = "";
            $scope.value = ""

            //Setup next question
            $scope.question = "Event Type";
            $scope.valuePlaceholder = " "
            $scope.eventStep++;
        }

        if (step == 3) {
            //Reset
            $scope.statusMessage = "";
            $scope.value = ""

            //Setup next question
            var now = new Date();
            var nextFiveMin = now.setMinutes(now.getMinutes() + (5 - (now.getMinutes() % 5)));
            var twelvePM = now.setHours(23, 59, 0, 0);
            $scope.rangeMin = nextFiveMin;
            $scope.rangeMax = twelvePM;
            $scope.question = "Event Start Time";
            $scope.valuePlaceholder = " "
            $scope.eventStep++;
        }

        if (step == 4) {
            //Reset
            $scope.statusMessage = "";
            $scope.value = ""

            //Setup next question
            $scope.rangeMin = $scope.form.starts_at;
            $scope.rangeMax = $scope.nextEventTime() + 300000; // Add 5 mins to fix bug?
            $scope.question = "Event End Time";
            $scope.valuePlaceholder = " "
            $scope.eventStep++;
        }

        if (step == 5) {
            //Reset
            $scope.statusMessage = "";
            $scope.value = ""
            $scope.form.attendees = [];

            //Setup next question
            $scope.question = "Invite Users";
            $scope.valuePlaceholder = "Start typing to search for Users"
            $scope.eventStep++;
        }

        $scope.form.location = $stateParams.id;
        $scope.form.description = "Event added at Kiosk by " + $scope.form.ownerName;
    }

    $scope.addEvent = function() {
        $scope.statusMessage = "Loading...";
        $scope.form.image = $scope.location.image;
        console.log($scope.form);
        Events.add($scope.form, function(data) {
            $scope.statusMessage = "Event Added";
            $scope.form = {};
            alert("Event Added");
            $state.go('locations-info', {
                id: $stateParams.id
            });
            return 200;
        });
    }

    Users.getUsers(function(users) {
        //Only store the name string and id
        for (user in users) {
            var wordList = users[user].name.split(" ");
            input = "";
            for (var i = 0; i < wordList.length; i++) {
                input += wordList[i].charAt(0).toUpperCase() + wordList[i].substr(1).toLowerCase() + " "
            }
            users[user].name = input.slice(0, -1);
            $scope.users.push({
                image: users[user].image,
                displayName: users[user].name + " <" + users[user].email + ">",
                name: users[user].name,
                id: users[user].id
            });
        }
    });

    $scope.addUser = function(user) {
        user._id = user.id;
        $scope.form.attendees.push({
            id: user._id,
            user: user,
            status: "Added"
        });
        $scope.searchText = "";
    }

    $scope.checkTimeNotInRange = function() {
        if ($scope.events == undefined) {
            return;
        }
        $scope.starts_at_validation = true;
        //Normalise Dates (Excluse MS etc)
        $scope.form.starts_at = Math.floor($scope.form.starts_at / 1000) * 1000;
        $scope.form.ends_at = Math.floor($scope.form.ends_at / 10000) * 10000;


        for (var i = 0; i < $scope.events.length; i++) {
            var event = $scope.events[i];
            //If the start time is within another event time, its a failure
            if ($scope.form.starts_at >= Date.parse(event.starts_at) && $scope.form.starts_at <= Date.parse(event.ends_at)) {
                $scope.starts_at_validation = false;
                console.log(1);
                break;
            }

            if ($scope.form.starts_at <= Date.parse(event.starts_at) && $scope.form.ends_at > Date.parse(event.starts_at)) {
                $scope.starts_at_validation = false;
                console.log(2, $scope.form.ends_at, Date.parse(event.starts_at));
                break;
            }
        }
    }

    $scope.nextEventTime = function() {
        if ($scope.events == undefined) {
            return;
        }
        //Set default if there is nothing
        var target = new Date();
        target.setHours(24, 0, 0, 0);

        //If an events is after, then show it
        for (var i = 0; i < $scope.events.length; i++) {
            if ($scope.form.starts_at < Date.parse($scope.events[i].starts_at)) {
                console.log("MAX", $scope.form.starts_at, Date.parse($scope.events[i].starts_at));
                return Date.parse($scope.events[i].starts_at);
            }
        }
        console.log("END", Date.parse(target));
        return Date.parse(target);
    }

    $interval(tick, 1000);
}]);
