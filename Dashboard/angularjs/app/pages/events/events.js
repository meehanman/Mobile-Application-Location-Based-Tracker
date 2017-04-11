app.controller('EventsCtrl', [ '$scope', 'Events', function($scope, Locations){

    $scope.events;
    Locations.getEvents(function(events){
      $scope.events = events;
    });
}]);
