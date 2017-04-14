app.controller('EventsCtrl', [ '$scope', 'Events', function($scope, Events){

    $scope.events;
    Events.get(function(events){
      $scope.events = events;
    });
}]);
