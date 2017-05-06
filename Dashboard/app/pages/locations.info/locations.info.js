app.controller('LocationsInfoCtrl', ['$scope', '$stateParams', 'Locations', '$interval', '$state', function($scope, $stateParams, Locations, $interval, $state) {
    $scope.location;
    $scope.eventsRaw;
    $scope.currentEvent;
    $scope.date = new Date();

    Locations.getOne($stateParams.id, function(location) {
        $scope.location = location.data;
    });

    $scope.getEvents = function() {
        Locations.getEvents($stateParams.id, function(events) {
            console.log("events",events);
            $scope.eventsRaw = events.data;
        });
    }

    $scope.dashboard = function(){
      $state.go('dashboard');
    }

    // Start the timer
    //$scope.date = new Date();
    //$scope.date.setDate(18);
    //$scope.date.setHours(15,59,50,50);
    var tick = function() {
        $scope.date = new Date();
        //$scope.date.setSeconds($scope.date.getSeconds() + 1);

        $scope.events = $scope.eventsRaw;
        //If the next event is within a minute, display it on the right
        if ($scope.events && $scope.events.length > 0) {
            //Get the next event
            var next_event;
            for (var i = 0; i < $scope.events.length; i++) {
                if ($scope.date < new Date($scope.events[i].ends_at)) {
                    next_event = $scope.events[i];
                    next_event.index = i;
                    break;
                } else {
                    $scope.events[i].finished = true;
                    $scope.events[i].active = false;
                    if($scope.currentEvent && $scope.events[i]._id==$scope.currentEvent._id){
                      delete $scope.currentEvent;
                    }
                }
            }

            //IF there is no next event
            if (!next_event) {
                return null;
            }

            //If the event is currently active
            if ($scope.date > new Date(next_event.starts_at) && $scope.date < new Date(next_event.ends_at)) {
                $scope.currentEvent = next_event;
                $scope.events[next_event.index].active = true;
            }
        }
    }

    $scope.book = function(){
      $state.go('locations-book', {id:$stateParams.id});
    }

    //Update the clock every second
    $interval(tick, 1000);

    //Update the events every 1 minute
    $interval($scope.getEvents, 5 * 1000);

    $scope.getEvents();
    tick();

}]);
