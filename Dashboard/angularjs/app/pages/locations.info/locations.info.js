app.controller('LocationsInfoCtrl', ['$scope', '$stateParams', 'Locations', '$interval', function($scope, $stateParams, Locations, $interval) {
    $scope.location;
    $scope.events;
    $scope.date = new Date();

    Locations.getOne($stateParams.id, function(location) {
        $scope.location = location.data;
    });

    Locations.getEvents($stateParams.id, function(events) {
        $scope.events = events.data;
    });

    var tick = function() {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    var tick = function() {
        $scope.date = Date.now();
    }
    tick();
    $interval(tick, 1000);
}]);
